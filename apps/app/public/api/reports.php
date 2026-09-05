<?php
// =========================================================
// Chess Play Student Performance Reports REST API
// =========================================================

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
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
    // 1. GET: Fetch Report History or Details
    // ---------------------------------------------------------
    if ($method === 'GET') {
        if ($action === 'report_detail') {
            $reportId = $_GET['id'] ?? '';
            if (empty($reportId)) {
                http_response_code(400);
                echo json_encode(['status' => 'error', 'message' => 'Missing report id']);
                exit;
            }

            $stmt = $pdo->prepare("
                SELECT r.*, s.name AS student_name, s.avatar_emoji, s.fide_id, s.parent_name, s.parent_phone, s.parent_email,
                       b.name AS batch_name, b.level AS batch_level,
                       a.name AS academy_name, a.primary_color,
                       u.name AS coach_name, u.fide_title AS coach_title
                FROM student_reports r
                JOIN students s ON r.student_id = s.id
                LEFT JOIN batches b ON s.batch_id = b.id
                JOIN academies a ON r.academy_id = a.id
                LEFT JOIN users u ON r.coach_id = u.id
                WHERE r.id = :id
                LIMIT 1
            ");
            $stmt->execute(['id' => $reportId]);
            $report = $stmt->fetch();

            if (!$report) {
                http_response_code(404);
                echo json_encode(['status' => 'error', 'message' => 'Report card not found']);
                exit;
            }

            echo json_encode([
                'status' => 'success',
                'report' => $report
            ]);
            exit;
        }

        // Fetch reports for specific student
        $studentId = $_GET['student_id'] ?? '';
        if (empty($studentId)) {
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => 'Missing student_id parameter']);
            exit;
        }

        // Fetch student record
        $sStmt = $pdo->prepare("
            SELECT s.*, b.name AS batch_name, b.level AS batch_level, a.name AS academy_name
            FROM students s
            LEFT JOIN batches b ON s.batch_id = b.id
            JOIN academies a ON s.academy_id = a.id
            WHERE s.id = :id
            LIMIT 1
        ");
        $sStmt->execute(['id' => $studentId]);
        $student = $sStmt->fetch();

        if (!$student) {
            http_response_code(404);
            echo json_encode(['status' => 'error', 'message' => 'Student not found']);
            exit;
        }

        // Fetch past reports
        $rStmt = $pdo->prepare("
            SELECT r.*, u.name AS coach_name
            FROM student_reports r
            LEFT JOIN users u ON r.coach_id = u.id
            WHERE r.student_id = :id
            ORDER BY r.created_at DESC
        ");
        $rStmt->execute(['id' => $studentId]);
        $reports = $rStmt->fetchAll();

        // Calculate draft pre-fill if no report exists for current month
        $currentMonth = date('F Y');
        $hasCurrentMonth = false;
        foreach ($reports as $rep) {
            if ($rep['period_label'] === $currentMonth) {
                $hasCurrentMonth = true;
                break;
            }
        }

        $draft = [
            'period_label' => $currentMonth,
            'rating' => intval($student['rating']),
            'rating_change' => 35, // Typical monthly progression
            'attendance_pct' => intval($student['attendance_pct']),
            'homework_pct' => intval($student['homework_pct']),
            'puzzles_solved' => intval($student['puzzles_solved']),
            'overall_grade' => $student['rating'] >= 1500 ? 'A+' : ($student['rating'] >= 1350 ? 'A' : 'B+'),
            'openings_score' => 88,
            'tactics_score' => 92,
            'endgames_score' => 85,
            'time_mgmt_score' => 90,
            'strengths' => 'Strong middle-game coordination, tactical alert in king attack positions, and reliable homework practice.',
            'areas_for_growth' => 'Complex rook and pawn endgame technique, deep calculating of quiet defensive moves.',
            'coach_remarks' => !empty($student['notes']) ? $student['notes'] : 'Demonstrates great work ethic during batch lectures. Keep refining tactical calculation!'
        ];

        echo json_encode([
            'status' => 'success',
            'student' => $student,
            'reports' => $reports,
            'draft' => $draft
        ]);
        exit;
    }

    // ---------------------------------------------------------
    // 2. POST: Save / Generate Student Report
    // ---------------------------------------------------------
    if ($method === 'POST') {
        if ($action === 'generate_report') {
            requireRole($currentUser, ['saas_owner', 'academy_admin', 'head_coach', 'assistant_coach']);

            $input = json_decode(file_get_contents('php://input'), true) ?: [];

            $studentId = trim($input['student_id'] ?? '');
            if (empty($studentId)) {
                http_response_code(400);
                echo json_encode(['status' => 'error', 'message' => 'student_id is required']);
                exit;
            }

            // Verify student exists
            $sStmt = $pdo->prepare("SELECT academy_id, rating FROM students WHERE id = :id LIMIT 1");
            $sStmt->execute(['id' => $studentId]);
            $student = $sStmt->fetch();

            if (!$student) {
                http_response_code(404);
                echo json_encode(['status' => 'error', 'message' => 'Student not found']);
                exit;
            }

            $reportId = !empty($input['id']) ? $input['id'] : ('rep-' . substr(generate_uuid(), 0, 8));
            $periodLabel = !empty($input['period_label']) ? trim($input['period_label']) : date('F Y');
            $rating = isset($input['rating']) ? intval($input['rating']) : intval($student['rating']);
            $ratingChange = isset($input['rating_change']) ? intval($input['rating_change']) : 0;
            $attendancePct = isset($input['attendance_pct']) ? intval($input['attendance_pct']) : 90;
            $homeworkPct = isset($input['homework_pct']) ? intval($input['homework_pct']) : 85;
            $puzzlesSolved = isset($input['puzzles_solved']) ? intval($input['puzzles_solved']) : 0;
            $overallGrade = !empty($input['overall_grade']) ? trim($input['overall_grade']) : 'A';
            $openingsScore = isset($input['openings_score']) ? intval($input['openings_score']) : 85;
            $tacticsScore = isset($input['tactics_score']) ? intval($input['tactics_score']) : 90;
            $endgamesScore = isset($input['endgames_score']) ? intval($input['endgames_score']) : 85;
            $timeMgmtScore = isset($input['time_mgmt_score']) ? intval($input['time_mgmt_score']) : 85;
            $strengths = trim($input['strengths'] ?? '');
            $areasForGrowth = trim($input['areas_for_growth'] ?? '');
            $coachRemarks = trim($input['coach_remarks'] ?? '');

            $stmt = $pdo->prepare("
                INSERT INTO student_reports (
                    id, student_id, academy_id, coach_id, period_label,
                    rating, rating_change, attendance_pct, homework_pct, puzzles_solved,
                    overall_grade, openings_score, tactics_score, endgames_score, time_mgmt_score,
                    strengths, areas_for_growth, coach_remarks
                ) VALUES (
                    :id, :student_id, :academy_id, :coach_id, :period_label,
                    :rating, :rating_change, :attendance_pct, :homework_pct, :puzzles_solved,
                    :overall_grade, :openings_score, :tactics_score, :endgames_score, :time_mgmt_score,
                    :strengths, :areas_for_growth, :coach_remarks
                )
                ON DUPLICATE KEY UPDATE 
                    period_label = VALUES(period_label),
                    rating = VALUES(rating),
                    rating_change = VALUES(rating_change),
                    attendance_pct = VALUES(attendance_pct),
                    homework_pct = VALUES(homework_pct),
                    puzzles_solved = VALUES(puzzles_solved),
                    overall_grade = VALUES(overall_grade),
                    openings_score = VALUES(openings_score),
                    tactics_score = VALUES(tactics_score),
                    endgames_score = VALUES(endgames_score),
                    time_mgmt_score = VALUES(time_mgmt_score),
                    strengths = VALUES(strengths),
                    areas_for_growth = VALUES(areas_for_growth),
                    coach_remarks = VALUES(coach_remarks);
            ");

            $stmt->execute([
                'id' => $reportId,
                'student_id' => $studentId,
                'academy_id' => $student['academy_id'],
                'coach_id' => $currentUser['id'],
                'period_label' => $periodLabel,
                'rating' => $rating,
                'rating_change' => $ratingChange,
                'attendance_pct' => $attendancePct,
                'homework_pct' => $homeworkPct,
                'puzzles_solved' => $puzzlesSolved,
                'overall_grade' => $overallGrade,
                'openings_score' => $openingsScore,
                'tactics_score' => $tacticsScore,
                'endgames_score' => $endgamesScore,
                'time_mgmt_score' => $timeMgmtScore,
                'strengths' => $strengths,
                'areas_for_growth' => $areasForGrowth,
                'coach_remarks' => $coachRemarks
            ]);

            echo json_encode([
                'status' => 'success',
                'message' => 'Official student report card saved successfully',
                'report_id' => $reportId
            ]);
            exit;
        }

        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Invalid POST action']);
        exit;
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
    exit;
}
