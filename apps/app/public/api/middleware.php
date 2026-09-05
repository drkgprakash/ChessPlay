<?php
// =========================================================
// Chess Play RBAC & Authentication Middleware
// Enforces token authentication and role-based permissions
// =========================================================

require_once __DIR__ . '/jwt.php';

// Canonical RBAC Permissions Matrix
function getRolePermissions($role) {
    switch ($role) {
        case 'saas_owner':
            return ['*']; // Superadmin all permissions

        case 'academy_admin':
            return [
                'academy:manage',
                'academy:billing',
                'coaches:manage',
                'students:manage',
                'batches:manage',
                'classroom:view',
                'reports:view',
                'reports:send'
            ];

        case 'head_coach':
            return [
                'classroom:master',
                'classroom:simul',
                'classroom:draw',
                'classroom:view',
                'homework:create',
                'homework:grade',
                'tournaments:manage',
                'students:notes',
                'reports:send'
            ];

        case 'assistant_coach':
            return [
                'classroom:assist',
                'classroom:view',
                'attendance:mark',
                'homework:grade',
                'students:view',
                'tournaments:view'
            ];

        case 'student':
            return [
                'classroom:attend',
                'homework:submit',
                'puzzles:solve',
                'tournaments:play'
            ];

        default:
            return [];
    }
}

/**
 * Extract Bearer token from HTTP request headers
 */
function getBearerToken() {
    $headers = null;
    if (isset($_SERVER['Authorization'])) {
        $headers = trim($_SERVER['Authorization']);
    } elseif (isset($_SERVER['HTTP_AUTHORIZATION'])) {
        $headers = trim($_SERVER['HTTP_AUTHORIZATION']);
    } elseif (function_exists('apache_request_headers')) {
        $requestHeaders = apache_request_headers();
        if (isset($requestHeaders['Authorization'])) {
            $headers = trim($requestHeaders['Authorization']);
        }
    }

    if (!empty($headers)) {
        if (preg_match('/Bearer\s(\S+)/', $headers, $matches)) {
            return $matches[1];
        }
    }

    // Also check query param fallback for download or direct links
    if (isset($_GET['token'])) {
        return trim($_GET['token']);
    }

    return null;
}

/**
 * Enforce authentication and return the authenticated user record
 */
function requireAuth($pdo) {
    $token = getBearerToken();
    if (!$token) {
        http_response_code(401);
        echo json_encode(['status' => 'error', 'message' => 'Unauthorized: Missing Bearer Token']);
        exit;
    }

    $payload = JWT::verify($token);
    if (!$payload || !isset($payload['sub'])) {
        http_response_code(401);
        echo json_encode(['status' => 'error', 'message' => 'Unauthorized: Invalid or expired token']);
        exit;
    }

    // Verify user is still active in database
    if ($pdo) {
        $stmt = $pdo->prepare("SELECT u.*, a.name AS academy_name, a.plan_tier, a.whatsapp_number, a.primary_color 
                               FROM users u 
                               LEFT JOIN academies a ON u.academy_id = a.id 
                               WHERE u.id = :id AND u.is_active = 1 LIMIT 1");
        $stmt->execute(['id' => $payload['sub']]);
        $user = $stmt->fetch();

        if (!$user) {
            http_response_code(401);
            echo json_encode(['status' => 'error', 'message' => 'Unauthorized: User account not found or deactivated']);
            exit;
        }

        // Attach updated permissions
        $user['permissions'] = getRolePermissions($user['role']);
        unset($user['password_hash']); // Strip sensitive hash
        return $user;
    }

    // Fallback using token payload if DB temporary unavailable
    return [
        'id' => $payload['sub'],
        'email' => $payload['email'] ?? '',
        'name' => $payload['name'] ?? '',
        'role' => $payload['role'] ?? 'assistant_coach',
        'academy_id' => $payload['academy_id'] ?? null,
        'permissions' => getRolePermissions($payload['role'] ?? 'assistant_coach')
    ];
}

/**
 * Enforce role requirement (single role or array of allowed roles)
 */
function requireRole($user, $allowedRoles) {
    if (!is_array($allowedRoles)) {
        $allowedRoles = [$allowedRoles];
    }

    // SaaS Owner bypasses role checks
    if ($user['role'] === 'saas_owner') {
        return true;
    }

    if (!in_array($user['role'], $allowedRoles)) {
        http_response_code(403);
        echo json_encode([
            'status' => 'error',
            'message' => 'Forbidden: Access denied for role ' . htmlspecialchars($user['role']),
            'required_roles' => $allowedRoles
        ]);
        exit;
    }

    return true;
}

/**
 * Check if user has specific permission
 */
function hasPermission($user, $permission) {
    if ($user['role'] === 'saas_owner') {
        return true;
    }
    if (in_array('*', $user['permissions'] ?? [])) {
        return true;
    }
    return in_array($permission, $user['permissions'] ?? []);
}

/**
 * Enforce granular permission
 */
function requirePermission($user, $permission) {
    if (!hasPermission($user, $permission)) {
        http_response_code(403);
        echo json_encode([
            'status' => 'error',
            'message' => 'Forbidden: Lacking required permission: ' . htmlspecialchars($permission)
        ]);
        exit;
    }
    return true;
}
