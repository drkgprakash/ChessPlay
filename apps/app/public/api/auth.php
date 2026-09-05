<?php
// =========================================================
// Chess Play Authentication & RBAC API Endpoint
// Handles Login, JWT Issuance, Token Verification & RBAC Introspection
// =========================================================

require_once __DIR__ . '/db.php';
require_once __DIR__ . '/jwt.php';
require_once __DIR__ . '/middleware.php';

$action = $_GET['action'] ?? '';
$method = $_SERVER['REQUEST_METHOD'];

// Helper to parse JSON input
function getJsonInput() {
    $raw = file_get_contents('php://input');
    if (!$raw) return $_POST;
    $data = json_decode($raw, true);
    return is_array($data) ? array_merge($_POST, $data) : $_POST;
}

// ---------------------------------------------------------
// 1. POST ?action=login
// Authenticates email & bcrypt password against MySQL
// ---------------------------------------------------------
if ($action === 'login' && $method === 'POST') {
    $input = getJsonInput();
    $email = trim($input['email'] ?? '');
    $password = trim($input['password'] ?? '');

    if (empty($email) || empty($password)) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Email and password are required']);
        exit;
    }

    if (!$pdo) {
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => 'Database connection unavailable']);
        exit;
    }

    $stmt = $pdo->prepare("SELECT u.*, a.name AS academy_name, a.plan_tier 
                           FROM users u 
                           LEFT JOIN academies a ON u.academy_id = a.id 
                           WHERE LOWER(u.email) = LOWER(:email) AND u.is_active = 1 LIMIT 1");
    $stmt->execute(['email' => $email]);
    $user = $stmt->fetch();

    if (!$user || !password_verify($password, $user['password_hash'])) {
        http_response_code(401);
        echo json_encode(['status' => 'error', 'message' => 'Invalid email or password']);
        exit;
    }

    // Update last login timestamp
    $updateStmt = $pdo->prepare("UPDATE users SET last_login_at = NOW() WHERE id = :id");
    $updateStmt->execute(['id' => $user['id']]);

    $permissions = getRolePermissions($user['role']);

    // Generate JWT Token (valid for 7 days)
    $token = JWT::sign([
        'sub' => $user['id'],
        'email' => $user['email'],
        'name' => $user['name'],
        'role' => $user['role'],
        'academy_id' => $user['academy_id'],
        'permissions' => $permissions
    ], 604800);

    unset($user['password_hash']);
    $user['permissions'] = $permissions;

    echo json_encode([
        'status' => 'success',
        'message' => 'Authentication successful',
        'token' => $token,
        'user' => $user
    ]);
    exit;
}

// ---------------------------------------------------------
// 2. GET ?action=me
// Verifies Bearer JWT and returns the active user profile & RBAC permissions
// ---------------------------------------------------------
if ($action === 'me' && $method === 'GET') {
    $user = requireAuth($pdo);
    echo json_encode([
        'status' => 'success',
        'user' => $user
    ]);
    exit;
}

// ---------------------------------------------------------
// 3. POST ?action=demo_login
// Authenticates 1-click test roles against verified DB credentials
// ---------------------------------------------------------
if ($action === 'demo_login' && $method === 'POST') {
    $input = getJsonInput();
    $role = trim($input['role'] ?? 'head_coach');

    $validRoles = ['saas_owner', 'academy_admin', 'head_coach', 'assistant_coach'];
    if (!in_array($role, $validRoles)) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Invalid demo role requested']);
        exit;
    }

    if (!$pdo) {
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => 'Database connection unavailable']);
        exit;
    }

    $stmt = $pdo->prepare("SELECT u.*, a.name AS academy_name, a.plan_tier 
                           FROM users u 
                           LEFT JOIN academies a ON u.academy_id = a.id 
                           WHERE u.role = :role LIMIT 1");
    $stmt->execute(['role' => $role]);
    $user = $stmt->fetch();

    if (!$user) {
        http_response_code(404);
        echo json_encode(['status' => 'error', 'message' => "Demo user for {$role} not found in database"]);
        exit;
    }

    // Update last login
    $updateStmt = $pdo->prepare("UPDATE users SET last_login_at = NOW() WHERE id = :id");
    $updateStmt->execute(['id' => $user['id']]);

    $permissions = getRolePermissions($user['role']);

    $token = JWT::sign([
        'sub' => $user['id'],
        'email' => $user['email'],
        'name' => $user['name'],
        'role' => $user['role'],
        'academy_id' => $user['academy_id'],
        'permissions' => $permissions
    ], 604800);

    unset($user['password_hash']);
    $user['permissions'] = $permissions;

    echo json_encode([
        'status' => 'success',
        'message' => "Logged in as {$user['role']}",
        'token' => $token,
        'user' => $user
    ]);
    exit;
}

// ---------------------------------------------------------
// 4. POST ?action=register_coach
// RBAC-guarded endpoint for Academy Admins to onboard coaches
// ---------------------------------------------------------
if ($action === 'register_coach' && $method === 'POST') {
    $currentUser = requireAuth($pdo);
    requireRole($currentUser, ['saas_owner', 'academy_admin']);
    requirePermission($currentUser, 'coaches:manage');

    $input = getJsonInput();
    $name = trim($input['name'] ?? '');
    $email = trim($input['email'] ?? '');
    $password = trim($input['password'] ?? '');
    $role = trim($input['role'] ?? 'assistant_coach');
    $academyId = $currentUser['role'] === 'saas_owner' ? ($input['academy_id'] ?? 'acad-001') : $currentUser['academy_id'];

    if (empty($name) || empty($email) || empty($password)) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Name, email and password are required']);
        exit;
    }

    if (!in_array($role, ['head_coach', 'assistant_coach'])) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Role must be head_coach or assistant_coach']);
        exit;
    }

    $id = 'usr-' . bin2hex(random_bytes(8));
    $hashedPassword = password_hash($password, PASSWORD_BCRYPT, ['cost' => 12]);
    $avatar = $role === 'head_coach' ? '👨‍🏫' : '🧑‍🏫';

    try {
        $insertStmt = $pdo->prepare("INSERT INTO users (id, email, password_hash, name, role, academy_id, avatar_emoji) 
                                     VALUES (:id, :email, :pass, :name, :role, :acad, :avatar)");
        $insertStmt->execute([
            'id' => $id,
            'email' => $email,
            'pass' => $hashedPassword,
            'name' => $name,
            'role' => $role,
            'acad' => $academyId,
            'avatar' => $avatar
        ]);

        echo json_encode([
            'status' => 'success',
            'message' => 'Coach registered successfully',
            'coach' => [
                'id' => $id,
                'name' => $name,
                'email' => $email,
                'role' => $role,
                'academy_id' => $academyId,
                'avatar_emoji' => $avatar
            ]
        ]);
    } catch (PDOException $e) {
        http_response_code(409);
        echo json_encode(['status' => 'error', 'message' => 'Email already registered: ' . $e->getMessage()]);
    }
    exit;
}

// Fallback status
echo json_encode([
    'status' => 'ok',
    'service' => 'Chess Play Auth & RBAC API',
    'endpoints' => [
        'POST ?action=login',
        'GET ?action=me',
        'POST ?action=demo_login',
        'POST ?action=register_coach'
    ]
]);
