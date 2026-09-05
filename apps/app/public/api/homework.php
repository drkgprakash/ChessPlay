<?php
// =========================================================
// Chess Play Homework & Tactical Drills REST API
// =========================================================

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/db.php';
require_once __DIR__ . '/middleware.php';

if (!$pdo) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Database connection failed']);
    exit;
}

$currentUser = requireAuth($pdo);
$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

// Helper to generate UUID
function generate_uuid() {
    return sprintf('%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
        mt_rand(0, 0xffff), mt_rand(0, 0xffff),
        mt_rand(0, 0xffff),
        mt_rand(0, 0x0fff) | 0x4000,
        mt_rand(0, 0x3fff) | 0x8000,
        mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0xffff)
    );
}

try {
    // ---------------------------------------------------------
    // 1. GET Requests: List or Detail
    // ---------------------------------------------------------
    if ($method === 'GET') {
        // Detailed Assignment & Submissions Roster
        if ($action === 'assignment_detail') {
            $assignmentId = $_GET['id'] ?? '';
            if (empty($assignmentId)) {
                http_response_code(400);
                echo json_encode(['status' => 'error', 'message' => 'Missing assignment id']);
                exit;
            }

            // Fetch assignment
            $stmt = $pdo->prepare("
                SELECT ha.*, b.name AS batch_name, u.name AS coach_name
                FROM homework_assignments ha
                JOIN batches b ON ha.batch_id = b.id
                LEFT JOIN users u ON ha.created_by = u.id
                WHERE ha.id = :id
                LIMIT 1
            ");
            $stmt->execute(['id' => $assignmentId]);
            $assignment = $stmt->fetch();

            if (!$assignment) {
                http_response_code(404);
                echo json_encode(['status' => 'error', 'message' => 'Assignment not found']);
                exit;
            }

            // Fetch drills
            $drillStmt = $pdo->prepare("
                SELECT * FROM homework_drills 
                WHERE assignment_id = :id 
                ORDER BY order_idx ASC
            ");
            $drillStmt->execute(['id' => $assignmentId]);
            $rawDrills = $drillStmt->fetchAll();
            $drills = array_map(function($d) {
                $d['solution_moves'] = json_decode($d['solution_moves'], true) ?: [];
                return $d;
            }, $rawDrills);

            // Fetch submissions roster
            $subStmt = $pdo->prepare("
                SELECT hs.*, s.name AS student_name, s.avatar_emoji, s.rating, s.email AS student_email
                FROM homework_submissions hs
                JOIN students s ON hs.student_id = s.id
                WHERE hs.assignment_id = :id
                ORDER BY s.name ASC
            ");
            $subStmt->execute(['id' => $assignmentId]);
            $submissions = $subStmt->fetchAll();

            echo json_encode([
                'status' => 'success',
                'assignment' => $assignment,
                'drills' => $drills,
                'submissions' => $submissions
            ]);
            exit;
        }

        // Student Perspective
        if ($currentUser['role'] === 'student') {
            // Find student record linked by email
            $stdStmt = $pdo->prepare("SELECT * FROM students WHERE email = :email LIMIT 1");
            $stdStmt->execute(['email' => $currentUser['email']]);
            $student = $stdStmt->fetch();

            if (!$student) {
                // Fallback to first student in default batch
                $stdStmt = $pdo->prepare("SELECT * FROM students WHERE academy_id = :acad LIMIT 1");
                $stdStmt->execute(['acad' => $currentUser['academy_id'] ?: 'acad-001']);
                $student = $stdStmt->fetch();
            }

            $batchId = $student ? $student['batch_id'] : 'batch-01';

            // Query assignments assigned to this batch
            $hwStmt = $pdo->prepare("
                SELECT ha.*, b.name AS batch_name,
                       COALESCE(hs.status, 'assigned') AS submission_status,
                       COALESCE(hs.drills_completed, 0) AS drills_completed,
                       COALESCE(hs.total_drills, (SELECT COUNT(*) FROM homework_drills WHERE assignment_id = ha.id)) AS total_drills,
                       COALESCE(hs.score_pct, 0) AS score_pct,
                       hs.coach_feedback,
                       hs.submitted_at
                FROM homework_assignments ha
                JOIN batches b ON ha.batch_id = b.id
                LEFT JOIN homework_submissions hs ON (hs.assignment_id = ha.id AND hs.student_id = :student_id)
                WHERE ha.batch_id = :batch_id AND ha.status = 'active'
                ORDER BY ha.created_at DESC
            ");
            $hwStmt->execute([
                'student_id' => $student['id'] ?? 'st-1',
                'batch_id' => $batchId
            ]);
            $assignments = $hwStmt->fetchAll();

            // Fetch drills for all returned assignments
            $allDrills = [];
            if (!empty($assignments)) {
                $assignIds = array_column($assignments, 'id');
                $inClause = implode(',', array_fill(0, count($assignIds), '?'));
                $drillStmt = $pdo->prepare("
                    SELECT * FROM homework_drills 
                    WHERE assignment_id IN ($inClause)
                    ORDER BY assignment_id, order_idx ASC
                ");
                $drillStmt->execute($assignIds);
                $raw = $drillStmt->fetchAll();
                foreach ($raw as $d) {
                    $d['solution_moves'] = json_decode($d['solution_moves'], true) ?: [];
                    $allDrills[$d['assignment_id']][] = $d;
                }
            }

            foreach ($assignments as &$a) {
                $a['drills'] = $allDrills[$a['id']] ?? [];
            }

            echo json_encode([
                'status' => 'success',
                'role' => 'student',
                'student' => $student,
                'assignments' => $assignments
            ]);
            exit;
        }

        // Coach / Admin / SaaS Owner Perspective
        $academyId = $currentUser['role'] === 'saas_owner' ? ($_GET['academy_id'] ?? 'acad-001') : $currentUser['academy_id'];
        $filterBatch = $_GET['batch_id'] ?? '';

        $query = "
            SELECT ha.*, b.name AS batch_name,
                   (SELECT COUNT(*) FROM homework_drills WHERE assignment_id = ha.id) AS drill_count,
                   (SELECT COUNT(*) FROM homework_submissions WHERE assignment_id = ha.id) AS total_assigned,
                   (SELECT COUNT(*) FROM homework_submissions WHERE assignment_id = ha.id AND status IN ('completed', 'reviewed')) AS completed_count,
                   (SELECT COALESCE(ROUND(AVG(score_pct)), 0) FROM homework_submissions WHERE assignment_id = ha.id) AS avg_score
            FROM homework_assignments ha
            JOIN batches b ON ha.batch_id = b.id
            WHERE ha.academy_id = :academy_id
        ";
        $params = ['academy_id' => $academyId];

        if (!empty($filterBatch)) {
            $query .= " AND ha.batch_id = :batch_id";
            $params['batch_id'] = $filterBatch;
        }

        $query .= " ORDER BY ha.created_at DESC";

        $stmt = $pdo->prepare($query);
        $stmt->execute($params);
        $assignments = $stmt->fetchAll();

        // Get batches for filter/create dropdown
        $batchStmt = $pdo->prepare("SELECT id, name, level FROM batches WHERE academy_id = :acad ORDER BY name ASC");
        $batchStmt->execute(['acad' => $academyId]);
        $batches = $batchStmt->fetchAll();

        // Overall stats
        $statsStmt = $pdo->prepare("
            SELECT 
                COUNT(DISTINCT ha.id) AS total_assignments,
                (SELECT COUNT(*) FROM homework_drills hd JOIN homework_assignments a ON hd.assignment_id = a.id WHERE a.academy_id = :acad1) AS total_drills,
                (SELECT COUNT(*) FROM homework_submissions hs JOIN homework_assignments a ON hs.assignment_id = a.id WHERE a.academy_id = :acad2 AND hs.status IN ('completed', 'reviewed')) AS total_completed_submissions,
                (SELECT COALESCE(ROUND(AVG(score_pct)), 0) FROM homework_submissions hs JOIN homework_assignments a ON hs.assignment_id = a.id WHERE a.academy_id = :acad3) AS global_avg_accuracy
            FROM homework_assignments ha
            WHERE ha.academy_id = :acad4
        ");
        $statsStmt->execute([
            'acad1' => $academyId,
            'acad2' => $academyId,
            'acad3' => $academyId,
            'acad4' => $academyId
        ]);
        $stats = $statsStmt->fetch() ?: [
            'total_assignments' => 0,
            'total_drills' => 0,
            'total_completed_submissions' => 0,
            'global_avg_accuracy' => 0
        ];

        echo json_encode([
            'status' => 'success',
            'role' => $currentUser['role'],
            'assignments' => $assignments,
            'batches' => $batches,
            'stats' => $stats
        ]);
        exit;
    }

    // ---------------------------------------------------------
    // 2. POST: Create Assignment or Submit Drill
    // ---------------------------------------------------------
    if ($method === 'POST') {
        $input = json_decode(file_get_contents('php://input'), true) ?: [];

        // Action A: Create Assignment
        if ($action === 'create_assignment') {
            requireRole($currentUser, ['saas_owner', 'academy_admin', 'head_coach']);

            $title = trim($input['title'] ?? '');
            $batchId = trim($input['batch_id'] ?? '');
            $description = trim($input['description'] ?? '');
            $dueDate = !empty($input['due_date']) ? $input['due_date'] : date('Y-m-d', strtotime('+7 days'));
            $difficulty = $input['difficulty'] ?? 'Intermediate';
            $drills = $input['drills'] ?? [];

            if (empty($title) || empty($batchId)) {
                http_response_code(400);
                echo json_encode(['status' => 'error', 'message' => 'Assignment title and target batch are required']);
                exit;
            }

            if (empty($drills) || !is_array($drills)) {
                http_response_code(400);
                echo json_encode(['status' => 'error', 'message' => 'At least one tactical drill is required']);
                exit;
            }

            $academyId = $currentUser['academy_id'] ?: 'acad-001';
            $assignmentId = 'hw-' . substr(generate_uuid(), 0, 8);

            $pdo->beginTransaction();

            // 1. Insert assignment
            $stmt = $pdo->prepare("
                INSERT INTO homework_assignments (id, academy_id, batch_id, created_by, title, description, due_date, difficulty, status)
                VALUES (:id, :acad, :batch, :user, :title, :desc, :due, :diff, 'active')
            ");
            $stmt->execute([
                'id' => $assignmentId,
                'acad' => $academyId,
                'batch' => $batchId,
                'user' => $currentUser['id'],
                'title' => $title,
                'desc' => $description,
                'due' => $dueDate,
                'diff' => $difficulty
            ]);

            // 2. Insert drills
            $drillStmt = $pdo->prepare("
                INSERT INTO homework_drills (id, assignment_id, order_idx, title, theme, fen, initial_turn, solution_moves, hint_piece, hint_square, hint_solution, explanation)
                VALUES (:id, :assign_id, :order_idx, :title, :theme, :fen, :turn, :moves, :hp, :hs, :hsol, :expl)
            ");

            foreach ($drills as $idx => $d) {
                $drillId = 'drill-' . substr(generate_uuid(), 0, 8);
                $movesJson = is_array($d['solution_moves']) ? json_encode($d['solution_moves']) : json_encode([$d['solution_moves']]);
                
                $drillStmt->execute([
                    'id' => $drillId,
                    'assign_id' => $assignmentId,
                    'order_idx' => $idx + 1,
                    'title' => !empty($d['title']) ? $d['title'] : 'Tactical Exercise #' . ($idx + 1),
                    'theme' => $d['theme'] ?? 'Tactics',
                    'fen' => !empty($d['fen']) ? $d['fen'] : 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
                    'turn' => $d['initial_turn'] ?? 'w',
                    'moves' => $movesJson,
                    'hp' => $d['hint_piece'] ?? null,
                    'hs' => $d['hint_square'] ?? null,
                    'hsol' => $d['hint_solution'] ?? null,
                    'expl' => $d['explanation'] ?? null
                ]);
            }

            // 3. Auto-provision submissions for all students in this batch
            $studentsStmt = $pdo->prepare("SELECT id FROM students WHERE batch_id = :batch_id AND status = 'active'");
            $studentsStmt->execute(['batch_id' => $batchId]);
            $enrolled = $studentsStmt->fetchAll();

            $subStmt = $pdo->prepare("
                INSERT INTO homework_submissions (id, assignment_id, student_id, drills_completed, total_drills, score_pct, status)
                VALUES (:id, :assign_id, :student_id, 0, :total, 0, 'assigned')
            ");

            $totalDrillsCount = count($drills);
            foreach ($enrolled as $st) {
                $subStmt->execute([
                    'id' => 'sub-' . substr(generate_uuid(), 0, 8),
                    'assign_id' => $assignmentId,
                    'student_id' => $st['id'],
                    'total' => $totalDrillsCount
                ]);
            }

            $pdo->commit();

            echo json_encode([
                'status' => 'success',
                'message' => 'Homework assignment created and assigned to batch students successfully',
                'assignment_id' => $assignmentId,
                'students_enrolled' => count($enrolled)
            ]);
            exit;
        }

        // Action B: Student Submits Drill Progress
        if ($action === 'submit_drill') {
            $assignmentId = trim($input['assignment_id'] ?? '');
            $drillsCompleted = intval($input['drills_completed'] ?? 1);
            $totalDrills = intval($input['total_drills'] ?? 1);
            $studentId = $input['student_id'] ?? null;

            if (empty($assignmentId)) {
                http_response_code(400);
                echo json_encode(['status' => 'error', 'message' => 'Missing assignment_id']);
                exit;
            }

            // Identify student
            if (!$studentId) {
                if ($currentUser['role'] === 'student') {
                    $sStmt = $pdo->prepare("SELECT id FROM students WHERE email = :email LIMIT 1");
                    $sStmt->execute(['email' => $currentUser['email']]);
                    $std = $sStmt->fetch();
                    $studentId = $std ? $std['id'] : 'st-1';
                } else {
                    $studentId = 'st-1'; // Testing fallback
                }
            }

            $scorePct = $totalDrills > 0 ? min(100, round(($drillsCompleted / $totalDrills) * 100)) : 100;
            $newStatus = ($drillsCompleted >= $totalDrills) ? 'completed' : 'in_progress';
            $submittedAt = ($drillsCompleted >= $totalDrills) ? date('Y-m-d H:i:s') : null;

            // Upsert submission
            $subStmt = $pdo->prepare("
                INSERT INTO homework_submissions (id, assignment_id, student_id, drills_completed, total_drills, score_pct, status, submitted_at)
                VALUES (:id, :assign_id, :student_id, :completed, :total, :score, :status, :submitted)
                ON DUPLICATE KEY UPDATE 
                    drills_completed = GREATEST(drills_completed, VALUES(drills_completed)),
                    score_pct = GREATEST(score_pct, VALUES(score_pct)),
                    status = IF(drills_completed >= total_drills, 'completed', VALUES(status)),
                    submitted_at = COALESCE(submitted_at, VALUES(submitted_at));
            ");

            $subStmt->execute([
                'id' => 'sub-' . substr(generate_uuid(), 0, 8),
                'assign_id' => $assignmentId,
                'student_id' => $studentId,
                'completed' => $drillsCompleted,
                'total' => $totalDrills,
                'score' => $scorePct,
                'status' => $newStatus,
                'submitted' => $submittedAt
            ]);

            // Update student's overall puzzle and homework stats
            try {
                $pdo->prepare("
                    UPDATE students 
                    SET puzzles_solved = puzzles_solved + 1,
                        homework_pct = LEAST(100, homework_pct + 2)
                    WHERE id = :id
                ")->execute(['id' => $studentId]);
            } catch (Exception $e) {
                // Non-fatal
            }

            echo json_encode([
                'status' => 'success',
                'message' => 'Drill progress saved successfully',
                'drills_completed' => $drillsCompleted,
                'total_drills' => $totalDrills,
                'score_pct' => $scorePct,
                'submission_status' => $newStatus
            ]);
            exit;
        }

        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Invalid POST action']);
        exit;
    }

    // ---------------------------------------------------------
    // 3. PUT: Grade / Feedback on Submission
    // ---------------------------------------------------------
    if ($method === 'PUT') {
        $input = json_decode(file_get_contents('php://input'), true) ?: [];

        if ($action === 'grade_submission') {
            requireRole($currentUser, ['saas_owner', 'academy_admin', 'head_coach', 'assistant_coach']);

            $submissionId = trim($input['submission_id'] ?? '');
            $feedback = trim($input['coach_feedback'] ?? '');
            $scorePct = isset($input['score_pct']) ? intval($input['score_pct']) : null;

            if (empty($submissionId)) {
                http_response_code(400);
                echo json_encode(['status' => 'error', 'message' => 'Missing submission_id']);
                exit;
            }

            $updateFields = ["status = 'reviewed'"];
            $params = ['id' => $submissionId];

            if ($feedback !== '') {
                $updateFields[] = "coach_feedback = :feedback";
                $params['feedback'] = $feedback;
            }

            if ($scorePct !== null) {
                $updateFields[] = "score_pct = :score";
                $params['score'] = max(0, min(100, $scorePct));
            }

            $sql = "UPDATE homework_submissions SET " . implode(', ', $updateFields) . " WHERE id = :id";
            $stmt = $pdo->prepare($sql);
            $stmt->execute($params);

            echo json_encode([
                'status' => 'success',
                'message' => 'Submission reviewed and graded successfully'
            ]);
            exit;
        }

        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Invalid PUT action']);
        exit;
    }

    // ---------------------------------------------------------
    // 4. DELETE: Remove Assignment
    // ---------------------------------------------------------
    if ($method === 'DELETE') {
        if ($action === 'delete_assignment') {
            requireRole($currentUser, ['saas_owner', 'academy_admin', 'head_coach']);

            $id = $_GET['id'] ?? '';
            if (empty($id)) {
                http_response_code(400);
                echo json_encode(['status' => 'error', 'message' => 'Missing assignment id']);
                exit;
            }

            $pdo->beginTransaction();
            $pdo->prepare("DELETE FROM homework_submissions WHERE assignment_id = :id")->execute(['id' => $id]);
            $pdo->prepare("DELETE FROM homework_drills WHERE assignment_id = :id")->execute(['id' => $id]);
            $pdo->prepare("DELETE FROM homework_assignments WHERE id = :id")->execute(['id' => $id]);
            $pdo->commit();

            echo json_encode([
                'status' => 'success',
                'message' => 'Assignment and associated student submissions deleted'
            ]);
            exit;
        }

        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Invalid DELETE action']);
        exit;
    }

} catch (Exception $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
    exit;
}
