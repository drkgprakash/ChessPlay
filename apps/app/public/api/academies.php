<?php
// =========================================================
// Chess Play SaaS Owner Academy Tenant Management API
// Handles CRUD for Academy Tenants, Admin Provisioning & Billing
// =========================================================

require_once __DIR__ . '/db.php';
require_once __DIR__ . '/jwt.php';
require_once __DIR__ . '/middleware.php';

header('Content-Type: application/json');

if (!$pdo) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Database connection unavailable']);
    exit;
}

// Authenticate user via JWT Bearer token
$user = requireAuth($pdo);

$action = $_GET['action'] ?? '';
$method = $_SERVER['REQUEST_METHOD'];

// Helper to parse JSON input
function getJsonInput() {
    $raw = file_get_contents('php://input');
    if (!$raw) return $_POST;
    $data = json_decode($raw, true);
    return is_array($data) ? array_merge($_POST, $data) : $_POST;
}

// Helper to sanitize slug
function createSlug($string) {
    $slug = strtolower(trim(preg_replace('/[^A-Za-z0-9-]+/', '-', $string), '-'));
    return !empty($slug) ? $slug : 'academy-' . bin2hex(random_bytes(3));
}

// =========================================================
// 1. GET /api/academies.php
// List all academy tenants with real MySQL live metrics
// =========================================================
if ($method === 'GET' && empty($action)) {
    // Only SaaS Owner or Academy Admin can access
    if ($user['role'] !== 'saas_owner' && $user['role'] !== 'academy_admin') {
        http_response_code(403);
        echo json_encode(['status' => 'error', 'message' => 'Forbidden: SaaS Platform Command Center is restricted to Superadmins']);
        exit;
    }

    $search = trim($_GET['q'] ?? '');

    $sql = "SELECT a.*,
                   (SELECT COUNT(*) FROM users u WHERE u.academy_id = a.id AND u.role IN ('head_coach', 'assistant_coach')) AS coaches_count,
                   (SELECT COUNT(*) FROM students s WHERE s.academy_id = a.id) AS students_count,
                   (SELECT COUNT(*) FROM batches b WHERE b.academy_id = a.id) AS batches_count
            FROM academies a
            WHERE 1=1";
    $params = [];

    // Tenant isolation if not saas_owner
    if ($user['role'] !== 'saas_owner') {
        $sql .= " AND a.id = :acad_id";
        $params['acad_id'] = $user['academy_id'] ?? 'acad-001';
    }

    if (!empty($search)) {
        $sql .= " AND (a.name LIKE :search OR a.slug LIKE :search OR a.contact_email LIKE :search)";
        $params['search'] = '%' . $search . '%';
    }

    $sql .= " ORDER BY a.created_at ASC";

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $academies = $stmt->fetchAll();

    // Compute platform-wide summary metrics
    $totalAcademies = count($academies);
    $totalStudents = 0;
    $totalCoaches = 0;
    $totalMrr = 0.0;
    $activeCount = 0;

    foreach ($academies as $a) {
        $totalStudents += (int)$a['students_count'];
        $totalCoaches += (int)$a['coaches_count'];
        $totalMrr += (float)($a['monthly_billing'] ?? 7999.00);
        if ($a['status'] === 'active') {
            $activeCount++;
        }
    }

    echo json_encode([
        'status' => 'success',
        'academies' => $academies,
        'stats' => [
            'total_academies' => $totalAcademies,
            'active_academies' => $activeCount,
            'total_students' => $totalStudents,
            'total_coaches' => $totalCoaches,
            'total_mrr' => $totalMrr,
            'mrr_formatted' => '₹' . number_format($totalMrr, 0, '.', ',')
        ]
    ]);
    exit;
}

// =========================================================
// 2. POST ?action=create_academy
// SaaS Owner creates new academy tenant & provisions admin user
// =========================================================
if ($method === 'POST' && $action === 'create_academy') {
    if ($user['role'] !== 'saas_owner') {
        http_response_code(403);
        echo json_encode(['status' => 'error', 'message' => 'Forbidden: Only SaaS Owner can register new academy tenants']);
        exit;
    }

    $input = getJsonInput();
    $name = trim($input['name'] ?? '');
    $slug = createSlug($input['slug'] ?? $name);
    $planTier = trim($input['plan_tier'] ?? 'pro');
    $monthlyBilling = !empty($input['monthly_billing']) ? (float)$input['monthly_billing'] : 7999.00;
    $whatsapp = trim($input['whatsapp_number'] ?? '');
    $primaryColor = trim($input['primary_color'] ?? '#f97316');

    // Admin Credentials
    $adminName = trim($input['admin_name'] ?? '');
    $adminEmail = strtolower(trim($input['admin_email'] ?? ''));
    $adminPassword = trim($input['admin_password'] ?? '');

    $errors = [];
    if (strlen($name) < 2) {
        $errors[] = 'Academy name must be at least 2 characters';
    }
    if (!in_array($planTier, ['starter', 'pro', 'enterprise'])) {
        $errors[] = 'Invalid plan tier selected';
    }
    if (strlen($adminName) < 2) {
        $errors[] = 'Admin full name is required';
    }
    if (!filter_var($adminEmail, FILTER_VALIDATE_EMAIL)) {
        $errors[] = 'A valid admin email address is required';
    }
    if (strlen($adminPassword) < 6) {
        $errors[] = 'Admin password must be at least 6 characters';
    }

    // Check slug uniqueness
    $slugStmt = $pdo->prepare("SELECT id FROM academies WHERE slug = :slug LIMIT 1");
    $slugStmt->execute(['slug' => $slug]);
    if ($slugStmt->fetch()) {
        $slug = $slug . '-' . bin2hex(random_bytes(2));
    }

    // Check admin email uniqueness
    $emailStmt = $pdo->prepare("SELECT id FROM users WHERE email = :email LIMIT 1");
    $emailStmt->execute(['email' => $adminEmail]);
    if ($emailStmt->fetch()) {
        $errors[] = 'An account with this admin email address already exists';
    }

    if (!empty($errors)) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => implode(' • ', $errors), 'errors' => $errors]);
        exit;
    }

    $academyId = 'acad-' . bin2hex(random_bytes(3));
    $adminUserId = 'usr-' . bin2hex(random_bytes(6));
    $adminHash = password_hash($adminPassword, PASSWORD_BCRYPT, ['cost' => 12]);

    // Insert Academy
    $insAcad = $pdo->prepare("
        INSERT INTO academies (id, name, slug, plan_tier, primary_color, whatsapp_number, monthly_billing, contact_email, admin_name, status)
        VALUES (:id, :name, :slug, :plan, :color, :phone, :mrr, :email, :admin, 'active')
    ");
    $insAcad->execute([
        'id' => $academyId,
        'name' => $name,
        'slug' => $slug,
        'plan' => $planTier,
        'color' => $primaryColor,
        'phone' => $whatsapp,
        'mrr' => $monthlyBilling,
        'email' => $adminEmail,
        'admin' => $adminName
    ]);

    // Provision Admin User
    $insUser = $pdo->prepare("
        INSERT INTO users (id, email, password_hash, name, role, academy_id, avatar_emoji, phone, is_active)
        VALUES (:id, :email, :hash, :name, 'academy_admin', :acad_id, '🏛️', :phone, 1)
    ");
    $insUser->execute([
        'id' => $adminUserId,
        'email' => $adminEmail,
        'hash' => $adminHash,
        'name' => $adminName,
        'acad_id' => $academyId,
        'phone' => $whatsapp
    ]);

    // Create a default initial batch for this academy
    $insBatch = $pdo->prepare("
        INSERT INTO batches (id, academy_id, name, schedule, level, max_students)
        VALUES (:id, :acad, 'Batch Alpha (General)', 'Mon, Wed, Fri 5:00 PM IST', 'intermediate', 15)
    ");
    $insBatch->execute([
        'id' => 'batch-' . bin2hex(random_bytes(3)),
        'acad' => $academyId
    ]);

    echo json_encode([
        'status' => 'success',
        'message' => 'Academy tenant registered and Admin user provisioned successfully',
        'academy_id' => $academyId,
        'admin_email' => $adminEmail
    ]);
    exit;
}

// =========================================================
// 3. PUT ?action=update_academy
// Update academy tenant settings, plan or billing
// =========================================================
if ($method === 'PUT' && $action === 'update_academy') {
    if ($user['role'] !== 'saas_owner' && $user['role'] !== 'academy_admin') {
        http_response_code(403);
        echo json_encode(['status' => 'error', 'message' => 'Forbidden']);
        exit;
    }

    $input = getJsonInput();
    $id = trim($input['id'] ?? '');
    $name = trim($input['name'] ?? '');
    $planTier = trim($input['plan_tier'] ?? '');
    $status = trim($input['status'] ?? '');
    $monthlyBilling = isset($input['monthly_billing']) ? (float)$input['monthly_billing'] : null;
    $whatsapp = trim($input['whatsapp_number'] ?? '');
    $primaryColor = trim($input['primary_color'] ?? '');

    // Check academy existence
    $checkStmt = $pdo->prepare("SELECT * FROM academies WHERE id = :id LIMIT 1");
    $checkStmt->execute(['id' => $id]);
    $target = $checkStmt->fetch();

    if (!$target) {
        http_response_code(404);
        echo json_encode(['status' => 'error', 'message' => 'Academy tenant not found']);
        exit;
    }

    if ($user['role'] === 'academy_admin' && $user['academy_id'] !== $id) {
        http_response_code(403);
        echo json_encode(['status' => 'error', 'message' => 'Forbidden: Tenant mismatch']);
        exit;
    }

    $uStmt = $pdo->prepare("
        UPDATE academies
        SET name = COALESCE(:name, name),
            plan_tier = COALESCE(:plan, plan_tier),
            status = COALESCE(:status, status),
            monthly_billing = COALESCE(:mrr, monthly_billing),
            whatsapp_number = COALESCE(:phone, whatsapp_number),
            primary_color = COALESCE(:color, primary_color)
        WHERE id = :id
    ");
    $uStmt->execute([
        'name' => !empty($name) ? $name : null,
        'plan' => !empty($planTier) ? $planTier : null,
        'status' => !empty($status) ? $status : null,
        'mrr' => $monthlyBilling !== null ? $monthlyBilling : null,
        'phone' => !empty($whatsapp) ? $whatsapp : null,
        'color' => !empty($primaryColor) ? $primaryColor : null,
        'id' => $id
    ]);

    echo json_encode(['status' => 'success', 'message' => 'Academy tenant updated successfully']);
    exit;
}

// =========================================================
// 4. DELETE ?action=delete_academy
// SaaS Owner deletes academy tenant
// =========================================================
if ($method === 'DELETE' && $action === 'delete_academy') {
    if ($user['role'] !== 'saas_owner') {
        http_response_code(403);
        echo json_encode(['status' => 'error', 'message' => 'Forbidden: Only SaaS Owner can delete academy tenants']);
        exit;
    }

    $id = trim($_GET['id'] ?? '');
    if ($id === 'acad-001') {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Primary platform demo academy cannot be deleted']);
        exit;
    }

    // Cascade delete related records
    $pdo->prepare("DELETE FROM students WHERE academy_id = :id")->execute(['id' => $id]);
    $pdo->prepare("DELETE FROM batches WHERE academy_id = :id")->execute(['id' => $id]);
    $pdo->prepare("DELETE FROM users WHERE academy_id = :id")->execute(['id' => $id]);
    $delAcad = $pdo->prepare("DELETE FROM academies WHERE id = :id");
    $delAcad->execute(['id' => $id]);

    echo json_encode(['status' => 'success', 'message' => 'Academy tenant and associated records deleted successfully']);
    exit;
}

http_response_code(400);
echo json_encode(['status' => 'error', 'message' => 'Invalid action or request method']);
