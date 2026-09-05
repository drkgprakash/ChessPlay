<?php
// =========================================================
// Chess Play Users & Students Management API (CRUD + RBAC)
// Strictly secured with JWT, RBAC guards & input validation
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

$type = $_GET['type'] ?? '';
$action = $_GET['action'] ?? '';
$method = $_SERVER['REQUEST_METHOD'];

// Helper to parse JSON input
function getJsonInput() {
    $raw = file_get_contents('php://input');
    if (!$raw) return $_POST;
    $data = json_decode($raw, true);
    return is_array($data) ? array_merge($_POST, $data) : $_POST;
}

// Helper to validate phone
function isValidPhone($phone) {
    if (empty($phone)) return true;
    // Allow +, digits, spaces, hyphens, parentheses (min 7 digits)
    $digits = preg_replace('/[^0-9]/', '', $phone);
    return strlen($digits) >= 7 && strlen($digits) <= 16;
}

// =========================================================
// 1. GET ?type=staff
// List staff & coaches based on caller RBAC
// =========================================================
if ($method === 'GET' && $type === 'staff') {
    $search = trim($_GET['q'] ?? '');
    $roleFilter = trim($_GET['role'] ?? '');

    $sql = "SELECT u.id, u.email, u.name, u.role, u.academy_id, a.name AS academy_name, 
                   u.avatar_emoji, u.phone, u.fide_title, u.rating, u.notes, u.is_active, u.created_at 
            FROM users u 
            LEFT JOIN academies a ON u.academy_id = a.id 
            WHERE 1=1";
    $params = [];

    // Tenant Isolation
    if ($user['role'] !== 'saas_owner') {
        $sql .= " AND u.academy_id = :acad_id";
        $params['acad_id'] = $user['academy_id'];
    }

    if (!empty($roleFilter)) {
        $sql .= " AND u.role = :role";
        $params['role'] = $roleFilter;
    }

    if (!empty($search)) {
        $sql .= " AND (u.name LIKE :search OR u.email LIKE :search OR u.phone LIKE :search)";
        $params['search'] = '%' . $search . '%';
    }

    $sql .= " ORDER BY CASE u.role 
                WHEN 'saas_owner' THEN 1 
                WHEN 'academy_admin' THEN 2 
                WHEN 'head_coach' THEN 3 
                WHEN 'assistant_coach' THEN 4 
                ELSE 5 END, u.name ASC";

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $staffList = $stmt->fetchAll();

    // Fetch assigned batches for each coach
    $batchesStmt = $pdo->prepare("SELECT id, academy_id, name, coach_id, schedule, level FROM batches");
    $batchesStmt->execute();
    $allBatches = $batchesStmt->fetchAll();

    $enhancedStaff = [];
    foreach ($staffList as $st) {
        $assigned = [];
        foreach ($allBatches as $b) {
            if ($b['coach_id'] === $st['id']) {
                $assigned[] = $b['name'];
            }
        }
        $st['batches'] = $assigned;
        $enhancedStaff[] = $st;
    }

    echo json_encode([
        'status' => 'success',
        'staff' => $enhancedStaff,
        'total' => count($enhancedStaff)
    ]);
    exit;
}

// =========================================================
// 2. POST ?action=create_staff
// Create new coach or admin (RBAC: saas_owner or academy_admin)
// =========================================================
if ($method === 'POST' && $action === 'create_staff') {
    $callerRole = $user['role'];
    if ($callerRole !== 'saas_owner' && $callerRole !== 'academy_admin') {
        http_response_code(403);
        echo json_encode(['status' => 'error', 'message' => 'Forbidden: Only Academy Admins or Platform Owners can add faculty']);
        exit;
    }

    $input = getJsonInput();
    $name = trim($input['name'] ?? '');
    $email = strtolower(trim($input['email'] ?? ''));
    $password = trim($input['password'] ?? '');
    $targetRole = trim($input['role'] ?? 'assistant_coach');
    $phone = trim($input['phone'] ?? '');
    $fideTitle = trim($input['fide_title'] ?? '');
    $rating = !empty($input['rating']) ? (int)$input['rating'] : 1500;
    $notes = trim($input['notes'] ?? '');

    // RBAC: Academy admin cannot create saas_owner or academy_admin
    if ($callerRole === 'academy_admin') {
        if ($targetRole === 'saas_owner' || $targetRole === 'academy_admin') {
            http_response_code(403);
            echo json_encode(['status' => 'error', 'message' => 'Forbidden: You cannot create administrative roles higher than coach']);
            exit;
        }
        $academyId = $user['academy_id'];
    } else {
        $academyId = !empty($input['academy_id']) ? trim($input['academy_id']) : ($user['academy_id'] ?? 'acad-001');
    }

    // Validation
    $errors = [];
    if (strlen($name) < 2) {
        $errors[] = 'Full name must be at least 2 characters long';
    }
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $errors[] = 'A valid email address is required';
    }
    if (strlen($password) < 6) {
        $errors[] = 'Password must be at least 6 characters long';
    }
    if (!in_array($targetRole, ['academy_admin', 'head_coach', 'assistant_coach'])) {
        $errors[] = 'Invalid role selected';
    }
    if (!isValidPhone($phone)) {
        $errors[] = 'Please provide a valid phone number (min 7 digits)';
    }

    // Check email uniqueness
    $checkStmt = $pdo->prepare("SELECT id FROM users WHERE email = :email LIMIT 1");
    $checkStmt->execute(['email' => $email]);
    if ($checkStmt->fetch()) {
        $errors[] = 'An account with this email address already exists';
    }

    if (!empty($errors)) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => implode(' • ', $errors), 'errors' => $errors]);
        exit;
    }

    $id = 'usr-' . bin2hex(random_bytes(6));
    $avatar = $targetRole === 'head_coach' ? '👨‍🏫' : ($targetRole === 'assistant_coach' ? '🧑‍🏫' : '🏛️');
    $passwordHash = password_hash($password, PASSWORD_BCRYPT, ['cost' => 12]);

    $insertStmt = $pdo->prepare("
        INSERT INTO users (id, email, password_hash, name, role, academy_id, avatar_emoji, phone, fide_title, rating, notes, is_active)
        VALUES (:id, :email, :hash, :name, :role, :acad, :avatar, :phone, :title, :rating, :notes, 1)
    ");
    $insertStmt->execute([
        'id' => $id,
        'email' => $email,
        'hash' => $passwordHash,
        'name' => $name,
        'role' => $targetRole,
        'acad' => $academyId,
        'avatar' => $avatar,
        'phone' => $phone,
        'title' => $fideTitle,
        'rating' => $rating,
        'notes' => $notes
    ]);

    // Return created user (excluding hash)
    echo json_encode([
        'status' => 'success',
        'message' => 'Staff member created successfully',
        'staff' => [
            'id' => $id,
            'name' => $name,
            'email' => $email,
            'role' => $targetRole,
            'academy_id' => $academyId,
            'avatar_emoji' => $avatar,
            'phone' => $phone,
            'fide_title' => $fideTitle,
            'rating' => $rating,
            'is_active' => 1,
            'batches' => []
        ]
    ]);
    exit;
}

// =========================================================
// 3. PUT ?action=update_staff
// Update coach / staff member
// =========================================================
if ($method === 'PUT' && $action === 'update_staff') {
    $callerRole = $user['role'];
    if ($callerRole !== 'saas_owner' && $callerRole !== 'academy_admin') {
        http_response_code(403);
        echo json_encode(['status' => 'error', 'message' => 'Forbidden: Insufficient permissions']);
        exit;
    }

    $input = getJsonInput();
    $id = trim($input['id'] ?? '');
    $name = trim($input['name'] ?? '');
    $phone = trim($input['phone'] ?? '');
    $fideTitle = trim($input['fide_title'] ?? '');
    $rating = isset($input['rating']) ? (int)$input['rating'] : null;
    $notes = trim($input['notes'] ?? '');
    $isActive = isset($input['is_active']) ? ($input['is_active'] ? 1 : 0) : 1;

    $targetStmt = $pdo->prepare("SELECT * FROM users WHERE id = :id LIMIT 1");
    $targetStmt->execute(['id' => $id]);
    $target = $targetStmt->fetch();

    if (!$target) {
        http_response_code(404);
        echo json_encode(['status' => 'error', 'message' => 'Staff member not found']);
        exit;
    }

    if ($callerRole === 'academy_admin' && $target['academy_id'] !== $user['academy_id']) {
        http_response_code(403);
        echo json_encode(['status' => 'error', 'message' => 'Forbidden: Tenant mismatch']);
        exit;
    }

    $uStmt = $pdo->prepare("
        UPDATE users 
        SET name = COALESCE(:name, name),
            phone = :phone,
            fide_title = :title,
            rating = COALESCE(:rating, rating),
            notes = :notes,
            is_active = :active
        WHERE id = :id
    ");
    $uStmt->execute([
        'name' => !empty($name) ? $name : null,
        'phone' => $phone,
        'title' => $fideTitle,
        'rating' => $rating,
        'notes' => $notes,
        'active' => $isActive,
        'id' => $id
    ]);

    echo json_encode(['status' => 'success', 'message' => 'Staff member updated successfully']);
    exit;
}

// =========================================================
// 4. DELETE ?action=delete_staff
// Delete staff member
// =========================================================
if ($method === 'DELETE' && $action === 'delete_staff') {
    $callerRole = $user['role'];
    if ($callerRole !== 'saas_owner' && $callerRole !== 'academy_admin') {
        http_response_code(403);
        echo json_encode(['status' => 'error', 'message' => 'Forbidden']);
        exit;
    }

    $id = trim($_GET['id'] ?? '');
    if ($id === $user['id']) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'You cannot delete your own active account']);
        exit;
    }

    $targetStmt = $pdo->prepare("SELECT * FROM users WHERE id = :id LIMIT 1");
    $targetStmt->execute(['id' => $id]);
    $target = $targetStmt->fetch();

    if (!$target) {
        http_response_code(404);
        echo json_encode(['status' => 'error', 'message' => 'User not found']);
        exit;
    }

    if ($target['role'] === 'saas_owner' && $callerRole !== 'saas_owner') {
        http_response_code(403);
        echo json_encode(['status' => 'error', 'message' => 'Forbidden: Superadmin accounts cannot be removed by admins']);
        exit;
    }

    $delStmt = $pdo->prepare("DELETE FROM users WHERE id = :id");
    $delStmt->execute(['id' => $id]);

    echo json_encode(['status' => 'success', 'message' => 'Staff member deleted successfully']);
    exit;
}

// =========================================================
// 5. GET ?type=students
// List students with batch & performance data
// =========================================================
if ($method === 'GET' && $type === 'students') {
    $search = trim($_GET['q'] ?? '');
    $batchId = trim($_GET['batch_id'] ?? '');

    $sql = "SELECT s.*, b.name AS batch_name, b.schedule AS batch_schedule, b.level AS batch_level 
            FROM students s 
            LEFT JOIN batches b ON s.batch_id = b.id 
            WHERE 1=1";
    $params = [];

    if ($user['role'] !== 'saas_owner') {
        $sql .= " AND s.academy_id = :acad_id";
        $params['acad_id'] = $user['academy_id'] ?? 'acad-001';
    }

    if (!empty($batchId)) {
        $sql .= " AND s.batch_id = :batch_id";
        $params['batch_id'] = $batchId;
    }

    if (!empty($search)) {
        $sql .= " AND (s.name LIKE :search OR s.email LIKE :search OR s.phone LIKE :search OR s.parent_name LIKE :search)";
        $params['search'] = '%' . $search . '%';
    }

    $sql .= " ORDER BY s.rating DESC, s.name ASC";

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $students = $stmt->fetchAll();

    // Fetch batches for filter dropdowns
    $bSql = "SELECT id, name, schedule, level, max_students FROM batches";
    if ($user['role'] !== 'saas_owner') {
        $bSql .= " WHERE academy_id = :acad_id";
        $bStmt = $pdo->prepare($bSql);
        $bStmt->execute(['acad_id' => $user['academy_id'] ?? 'acad-001']);
    } else {
        $bStmt = $pdo->prepare($bSql);
        $bStmt->execute();
    }
    $batches = $bStmt->fetchAll();

    echo json_encode([
        'status' => 'success',
        'students' => $students,
        'batches' => $batches,
        'total' => count($students)
    ]);
    exit;
}

// =========================================================
// 6. POST ?action=create_student
// Add new student (RBAC: saas_owner, academy_admin, head_coach)
// =========================================================
if ($method === 'POST' && $action === 'create_student') {
    $callerRole = $user['role'];
    if ($callerRole === 'assistant_coach' || $callerRole === 'student' || $callerRole === 'parent') {
        http_response_code(403);
        echo json_encode(['status' => 'error', 'message' => 'Forbidden: Only Head Coaches or Admins can enroll new students']);
        exit;
    }

    $input = getJsonInput();
    $name = trim($input['name'] ?? '');
    $email = strtolower(trim($input['email'] ?? ''));
    $phone = trim($input['phone'] ?? '');
    $batchId = trim($input['batch_id'] ?? 'batch-01');
    $rating = !empty($input['rating']) ? (int)$input['rating'] : 1200;
    $fideId = trim($input['fide_id'] ?? '');
    $parentName = trim($input['parent_name'] ?? '');
    $parentPhone = trim($input['parent_phone'] ?? '');
    $parentEmail = strtolower(trim($input['parent_email'] ?? ''));
    $notes = trim($input['notes'] ?? '');
    $avatar = trim($input['avatar_emoji'] ?? '👦');

    $academyId = $user['academy_id'] ?? 'acad-001';

    // Validation
    $errors = [];
    if (strlen($name) < 2) {
        $errors[] = 'Student full name must be at least 2 characters';
    }
    if (!empty($email) && !filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $errors[] = 'Invalid student email format';
    }
    if (!empty($parentEmail) && !filter_var($parentEmail, FILTER_VALIDATE_EMAIL)) {
        $errors[] = 'Invalid parent email format';
    }
    if ($rating < 100 || $rating > 3500) {
        $errors[] = 'Rating must be between 100 and 3500';
    }
    if (!empty($phone) && !isValidPhone($phone)) {
        $errors[] = 'Invalid student phone number';
    }
    if (!empty($parentPhone) && !isValidPhone($parentPhone)) {
        $errors[] = 'Invalid parent WhatsApp/phone number';
    }

    if (!empty($errors)) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => implode(' • ', $errors), 'errors' => $errors]);
        exit;
    }

    $id = 'st-' . bin2hex(random_bytes(6));

    $insStmt = $pdo->prepare("
        INSERT INTO students (id, academy_id, batch_id, name, email, phone, rating, fide_id, parent_name, parent_phone, parent_email, attendance_pct, puzzles_solved, homework_pct, status, notes, avatar_emoji)
        VALUES (:id, :acad, :batch, :name, :email, :phone, :rating, :fide, :p_name, :p_phone, :p_email, 100, 0, 100, 'active', :notes, :avatar)
    ");
    $insStmt->execute([
        'id' => $id,
        'acad' => $academyId,
        'batch' => !empty($batchId) ? $batchId : null,
        'name' => $name,
        'email' => $email,
        'phone' => $phone,
        'rating' => $rating,
        'fide' => $fideId,
        'p_name' => $parentName,
        'p_phone' => $parentPhone,
        'p_email' => $parentEmail,
        'notes' => $notes,
        'avatar' => $avatar
    ]);

    // Fetch batch name
    $bStmt = $pdo->prepare("SELECT name FROM batches WHERE id = :id LIMIT 1");
    $bStmt->execute(['id' => $batchId]);
    $batch = $bStmt->fetch();

    echo json_encode([
        'status' => 'success',
        'message' => 'Student successfully enrolled',
        'student' => [
            'id' => $id,
            'name' => $name,
            'email' => $email,
            'phone' => $phone,
            'rating' => $rating,
            'fide_id' => $fideId,
            'batch_id' => $batchId,
            'batch_name' => $batch ? $batch['name'] : 'General Batch',
            'parent_name' => $parentName,
            'parent_phone' => $parentPhone,
            'parent_email' => $parentEmail,
            'attendance_pct' => 100,
            'puzzles_solved' => 0,
            'homework_pct' => 100,
            'status' => 'active',
            'notes' => $notes,
            'avatar_emoji' => $avatar
        ]
    ]);
    exit;
}

// =========================================================
// 7. PUT ?action=update_student
// Update student info, rating, notes, status
// =========================================================
if ($method === 'PUT' && $action === 'update_student') {
    $callerRole = $user['role'];
    if ($callerRole === 'assistant_coach' || $callerRole === 'student') {
        http_response_code(403);
        echo json_encode(['status' => 'error', 'message' => 'Forbidden']);
        exit;
    }

    $input = getJsonInput();
    $id = trim($input['id'] ?? '');
    $name = trim($input['name'] ?? '');
    $batchId = trim($input['batch_id'] ?? '');
    $rating = isset($input['rating']) ? (int)$input['rating'] : null;
    $fideId = trim($input['fide_id'] ?? '');
    $phone = trim($input['phone'] ?? '');
    $parentName = trim($input['parent_name'] ?? '');
    $parentPhone = trim($input['parent_phone'] ?? '');
    $parentEmail = trim($input['parent_email'] ?? '');
    $notes = trim($input['notes'] ?? '');
    $status = trim($input['status'] ?? 'active');

    $targetStmt = $pdo->prepare("SELECT * FROM students WHERE id = :id LIMIT 1");
    $targetStmt->execute(['id' => $id]);
    $target = $targetStmt->fetch();

    if (!$target) {
        http_response_code(404);
        echo json_encode(['status' => 'error', 'message' => 'Student not found']);
        exit;
    }

    $uStmt = $pdo->prepare("
        UPDATE students 
        SET name = COALESCE(:name, name),
            batch_id = COALESCE(:batch, batch_id),
            rating = COALESCE(:rating, rating),
            fide_id = :fide,
            phone = :phone,
            parent_name = :p_name,
            parent_phone = :p_phone,
            parent_email = :p_email,
            notes = :notes,
            status = :status
        WHERE id = :id
    ");
    $uStmt->execute([
        'name' => !empty($name) ? $name : null,
        'batch' => !empty($batchId) ? $batchId : null,
        'rating' => $rating,
        'fide' => $fideId,
        'phone' => $phone,
        'p_name' => $parentName,
        'p_phone' => $parentPhone,
        'p_email' => $parentEmail,
        'notes' => $notes,
        'status' => $status,
        'id' => $id
    ]);

    echo json_encode(['status' => 'success', 'message' => 'Student record updated successfully']);
    exit;
}

// =========================================================
// 8. DELETE ?action=delete_student
// Remove student from academy roster
// =========================================================
if ($method === 'DELETE' && $action === 'delete_student') {
    $callerRole = $user['role'];
    if ($callerRole !== 'saas_owner' && $callerRole !== 'academy_admin' && $callerRole !== 'head_coach') {
        http_response_code(403);
        echo json_encode(['status' => 'error', 'message' => 'Forbidden']);
        exit;
    }

    $id = trim($_GET['id'] ?? '');
    $delStmt = $pdo->prepare("DELETE FROM students WHERE id = :id");
    $delStmt->execute(['id' => $id]);

    echo json_encode(['status' => 'success', 'message' => 'Student record deleted successfully']);
    exit;
}

// =========================================================
// 9. GET ?type=batches
// List batches with coach details and enrolled student counts
// =========================================================
if ($method === 'GET' && $type === 'batches') {
    $sql = "SELECT b.*, u.name AS coach_name, u.avatar_emoji AS coach_avatar, u.email AS coach_email,
                   (SELECT COUNT(*) FROM students s WHERE s.batch_id = b.id) AS enrolled_count
            FROM batches b
            LEFT JOIN users u ON b.coach_id = u.id
            WHERE 1=1";
    $params = [];

    if ($user['role'] !== 'saas_owner') {
        $sql .= " AND b.academy_id = :acad_id";
        $params['acad_id'] = $user['academy_id'] ?? 'acad-001';
    }

    $sql .= " ORDER BY b.created_at ASC";

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $batches = $stmt->fetchAll();

    // Also fetch available coaches for the dropdown
    $cSql = "SELECT id, name, role, avatar_emoji, fide_title FROM users WHERE role IN ('head_coach', 'assistant_coach', 'academy_admin')";
    if ($user['role'] !== 'saas_owner') {
        $cSql .= " AND academy_id = :acad_id";
        $cStmt = $pdo->prepare($cSql);
        $cStmt->execute(['acad_id' => $user['academy_id'] ?? 'acad-001']);
    } else {
        $cStmt = $pdo->prepare($cSql);
        $cStmt->execute();
    }
    $coaches = $cStmt->fetchAll();

    echo json_encode([
        'status' => 'success',
        'batches' => $batches,
        'coaches' => $coaches,
        'total' => count($batches)
    ]);
    exit;
}

// =========================================================
// 10. POST ?action=create_batch
// Create new batch (RBAC: saas_owner, academy_admin, head_coach)
// =========================================================
if ($method === 'POST' && $action === 'create_batch') {
    $callerRole = $user['role'];
    if ($callerRole === 'assistant_coach' || $callerRole === 'student' || $callerRole === 'parent') {
        http_response_code(403);
        echo json_encode(['status' => 'error', 'message' => 'Forbidden: Insufficient permissions to create batches']);
        exit;
    }

    $input = getJsonInput();
    $name = trim($input['name'] ?? '');
    $coachId = trim($input['coach_id'] ?? '');
    $schedule = trim($input['schedule'] ?? '');
    $level = trim($input['level'] ?? 'intermediate');
    $maxStudents = !empty($input['max_students']) ? (int)$input['max_students'] : 12;

    $academyId = $user['academy_id'] ?? 'acad-001';

    $errors = [];
    if (strlen($name) < 2) {
        $errors[] = 'Batch name must be at least 2 characters';
    }
    if (strlen($schedule) < 2) {
        $errors[] = 'Schedule timing is required';
    }
    if (!in_array($level, ['beginner', 'intermediate', 'advanced', 'master'])) {
        $errors[] = 'Invalid skill level tier';
    }
    if ($maxStudents < 1 || $maxStudents > 50) {
        $errors[] = 'Seat capacity must be between 1 and 50';
    }

    if (!empty($errors)) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => implode(' • ', $errors)]);
        exit;
    }

    $id = 'batch-' . bin2hex(random_bytes(4));

    $insStmt = $pdo->prepare("
        INSERT INTO batches (id, academy_id, name, coach_id, schedule, level, max_students)
        VALUES (:id, :acad, :name, :coach, :schedule, :level, :max)
    ");
    $insStmt->execute([
        'id' => $id,
        'acad' => $academyId,
        'name' => $name,
        'coach' => !empty($coachId) ? $coachId : null,
        'schedule' => $schedule,
        'level' => $level,
        'max' => $maxStudents
    ]);

    echo json_encode([
        'status' => 'success',
        'message' => 'Batch created successfully',
        'batch_id' => $id
    ]);
    exit;
}

// =========================================================
// 11. PUT ?action=update_batch
// Update batch details (schedule, coach, capacity)
// =========================================================
if ($method === 'PUT' && $action === 'update_batch') {
    $callerRole = $user['role'];
    if ($callerRole === 'assistant_coach' || $callerRole === 'student' || $callerRole === 'parent') {
        http_response_code(403);
        echo json_encode(['status' => 'error', 'message' => 'Forbidden']);
        exit;
    }

    $input = getJsonInput();
    $id = trim($input['id'] ?? '');
    $name = trim($input['name'] ?? '');
    $coachId = trim($input['coach_id'] ?? '');
    $schedule = trim($input['schedule'] ?? '');
    $level = trim($input['level'] ?? 'intermediate');
    $maxStudents = isset($input['max_students']) ? (int)$input['max_students'] : 12;

    $uStmt = $pdo->prepare("
        UPDATE batches 
        SET name = COALESCE(:name, name),
            coach_id = :coach,
            schedule = :schedule,
            level = :level,
            max_students = :max
        WHERE id = :id
    ");
    $uStmt->execute([
        'name' => !empty($name) ? $name : null,
        'coach' => !empty($coachId) ? $coachId : null,
        'schedule' => $schedule,
        'level' => $level,
        'max' => $maxStudents,
        'id' => $id
    ]);

    echo json_encode(['status' => 'success', 'message' => 'Batch updated successfully']);
    exit;
}

// =========================================================
// 12. DELETE ?action=delete_batch
// Remove batch
// =========================================================
if ($method === 'DELETE' && $action === 'delete_batch') {
    $callerRole = $user['role'];
    if ($callerRole !== 'saas_owner' && $callerRole !== 'academy_admin') {
        http_response_code(403);
        echo json_encode(['status' => 'error', 'message' => 'Forbidden: Only Admins can delete batches']);
        exit;
    }

    $id = trim($_GET['id'] ?? '');

    // Unlink any students enrolled in this batch
    $unlinkStmt = $pdo->prepare("UPDATE students SET batch_id = NULL WHERE batch_id = :id");
    $unlinkStmt->execute(['id' => $id]);

    $delStmt = $pdo->prepare("DELETE FROM batches WHERE id = :id");
    $delStmt->execute(['id' => $id]);

    echo json_encode(['status' => 'success', 'message' => 'Batch deleted successfully']);
    exit;
}

http_response_code(400);
echo json_encode(['status' => 'error', 'message' => 'Invalid action or request method']);

