<?php
// =========================================================
// Chess Play Student QR Attendance & Automated Check-In REST API
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

// Self-healing schema check: Ensure attendance_records table exists
try {
    $pdo->exec("
    CREATE TABLE IF NOT EXISTS attendance_records (
        id VARCHAR(36) PRIMARY KEY,
        academy_id VARCHAR(36) NOT NULL,
        batch_id VARCHAR(36) NOT NULL,
        student_id VARCHAR(36) NOT NULL,
        session_date DATE NOT NULL,
        checkin_time TIME NULL,
        status ENUM('present', 'absent', 'late', 'excused') DEFAULT 'present',
        method ENUM('qr_scan', 'manual', 'kiosk') DEFAULT 'qr_scan',
        marked_by VARCHAR(36) NOT NULL,
        notes TEXT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY uk_student_session (student_id, session_date, batch_id),
        INDEX idx_att_date (session_date, batch_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    ");

    $todayDate = date('Y-m-d');
    $countStmt = $pdo->prepare("SELECT COUNT(*) FROM attendance_records WHERE session_date = :dt");
    $countStmt->execute(['dt' => $todayDate]);
    if ((int)$countStmt->fetchColumn() === 0) {
        $seedStmt = $pdo->prepare("
            INSERT INTO attendance_records (id, academy_id, batch_id, student_id, session_date, checkin_time, status, method, marked_by, notes)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE checkin_time = VALUES(checkin_time), status = VALUES(status);
        ");
        $seedStmt->execute(['att-01', 'acad-001', 'batch-01', 'st-1', $todayDate, '18:02:14', 'present', 'qr_scan', 'usr-headcoach', 'Digital QR scanned at door entrance']);
        $seedStmt->execute(['att-02', 'acad-001', 'batch-01', 'st-2', $todayDate, '18:04:30', 'present', 'qr_scan', 'usr-headcoach', 'Digital QR scanned at door entrance']);
        $seedStmt->execute(['att-03', 'acad-001', 'batch-01', 'st-3', $todayDate, '17:58:10', 'present', 'qr_scan', 'usr-headcoach', 'Early arrival, set up board 1']);
        $seedStmt->execute(['att-04', 'acad-001', 'batch-01', 'st-4', $todayDate, NULL, 'excused', 'manual', 'usr-headcoach', 'Parent notified: School quarterly exams']);
        $seedStmt->execute(['att-05', 'acad-001', 'batch-01', 'st-5', $todayDate, '18:18:45', 'late', 'qr_scan', 'usr-headcoach', 'Arrived 18 mins late due to rain traffic']);
        $seedStmt->execute(['att-06', 'acad-001', 'batch-01', 'st-6', $todayDate, '18:01:05', 'present', 'qr_scan', 'usr-headcoach', 'Digital QR scanned at door entrance']);
    }
} catch (Exception $e) {
    // Ignore migration exception
}

try {
    // ---------------------------------------------------------
    // 1. GET: Fetch Batch Attendance Session & Student List
    // ---------------------------------------------------------
    if ($method === 'GET') {
        // Detailed Student ID Card Data
        if ($action === 'student_id_card') {
            $studentId = $_GET['student_id'] ?? '';
            if (empty($studentId)) {
                http_response_code(400);
                echo json_encode(['status' => 'error', 'message' => 'Student ID is required']);
                exit;
            }

            $stmt = $pdo->prepare("
                SELECT s.*, 
                       b.name AS batch_name, b.schedule AS batch_schedule, b.level AS batch_level,
                       a.name AS academy_name, a.contact_email AS academy_email, a.whatsapp_number AS academy_whatsapp,
                       a.primary_color
                FROM students s
                LEFT JOIN batches b ON s.batch_id = b.id
                LEFT JOIN academies a ON s.academy_id = a.id
                WHERE s.id = :id
            ");
            $stmt->execute(['id' => $studentId]);
            $student = $stmt->fetch();

            if (!$student) {
                http_response_code(404);
                echo json_encode(['status' => 'error', 'message' => 'Student not found']);
                exit;
            }

            // QR Payload string encoded for scanner: CHESSPLAY:ATTENDANCE:student_id:academy_id:batch_id
            $qrPayload = "CHESSPLAY:ATTENDANCE:{$student['id']}:{$student['academy_id']}:{$student['batch_id']}";

            echo json_encode([
                'status' => 'success',
                'student' => $student,
                'qr_payload' => $qrPayload
            ]);
            exit;
        }

        // List Attendance Roster for Date & Batch
        $batchId = $_GET['batch_id'] ?? 'batch-01';
        $sessionDate = $_GET['date'] ?? date('Y-m-d');
        $academyId = $currentUser['academy_id'] ?? 'acad-001';

        // 1. Fetch Batch Details
        $batchStmt = $pdo->prepare("SELECT * FROM batches WHERE id = :id");
        $batchStmt->execute(['id' => $batchId]);
        $batch = $batchStmt->fetch();

        // 2. Fetch all students enrolled in this batch with their attendance record for this date
        $sql = "
            SELECT s.id AS student_id, s.name, s.avatar_emoji, s.fide_id, s.rating, s.phone AS student_phone,
                   s.parent_name, s.parent_phone, s.parent_email, s.attendance_pct AS cumulative_attendance_pct,
                   b.name AS batch_name, b.schedule AS batch_schedule,
                   ar.id AS attendance_id, ar.session_date, ar.checkin_time, ar.status, ar.method, ar.notes, ar.marked_by
            FROM students s
            LEFT JOIN batches b ON s.batch_id = b.id
            LEFT JOIN attendance_records ar ON (s.id = ar.student_id AND ar.session_date = :dt AND ar.batch_id = s.batch_id)
            WHERE s.batch_id = :batch_id AND s.status = 'active'
        ";
        $params = ['dt' => $sessionDate, 'batch_id' => $batchId];

        if ($currentUser['role'] !== 'saas_owner' && !empty($academyId)) {
            $sql .= " AND s.academy_id = :academy_id";
            $params['academy_id'] = $academyId;
        }

        $sql .= " ORDER BY s.name ASC";

        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        $records = $stmt->fetchAll();

        // Calculate session statistics
        $totalStudents = count($records);
        $presentCount = 0;
        $lateCount = 0;
        $absentCount = 0;
        $excusedCount = 0;
        $unmarkedCount = 0;

        foreach ($records as $r) {
            $st = $r['status'];
            if ($st === 'present') {
                $presentCount++;
            } elseif ($st === 'late') {
                $lateCount++;
            } elseif ($st === 'absent') {
                $absentCount++;
            } elseif ($st === 'excused') {
                $excusedCount++;
            } else {
                $unmarkedCount++;
            }
        }

        $attendanceRate = $totalStudents > 0 
            ? round((($presentCount + $lateCount) / $totalStudents) * 100, 1) 
            : 0;

        echo json_encode([
            'status' => 'success',
            'session_date' => $sessionDate,
            'batch' => $batch,
            'students' => $records,
            'metrics' => [
                'total_students' => $totalStudents,
                'present_count' => $presentCount,
                'late_count' => $lateCount,
                'absent_count' => $absentCount,
                'excused_count' => $excusedCount,
                'unmarked_count' => $unmarkedCount,
                'attendance_rate' => $attendanceRate
            ]
        ]);
        exit;
    }

    // ---------------------------------------------------------
    // 2. POST: Check-In (QR Scan or Manual) & Bulk Attendance
    // ---------------------------------------------------------
    if ($method === 'POST') {
        $input = json_decode(file_get_contents('php://input'), true);

        // Bulk Mark Attendance
        if ($action === 'bulk_mark') {
            $batchId = $input['batch_id'] ?? '';
            $sessionDate = $input['session_date'] ?? date('Y-m-d');
            $targetStatus = $input['status'] ?? 'present';
            $academyId = $currentUser['academy_id'] ?? 'acad-001';

            if (empty($batchId)) {
                http_response_code(400);
                echo json_encode(['status' => 'error', 'message' => 'Batch ID is required']);
                exit;
            }

            // Get all students in batch
            $stListStmt = $pdo->prepare("SELECT id FROM students WHERE batch_id = :b AND status = 'active'");
            $stListStmt->execute(['b' => $batchId]);
            $studentIds = $stListStmt->fetchAll(PDO::FETCH_COLUMN);

            $insStmt = $pdo->prepare("
                INSERT INTO attendance_records (id, academy_id, batch_id, student_id, session_date, checkin_time, status, method, marked_by, notes)
                VALUES (:id, :acad, :batch, :student, :dt, :ctime, :st, :method, :marked, :notes)
                ON DUPLICATE KEY UPDATE 
                    status = VALUES(status),
                    checkin_time = VALUES(checkin_time),
                    method = VALUES(method),
                    marked_by = VALUES(marked_by);
            ");

            $checkinTime = ($targetStatus === 'present' || $targetStatus === 'late') ? date('H:i:s') : null;
            $count = 0;

            foreach ($studentIds as $sId) {
                $insStmt->execute([
                    'id' => generate_uuid(),
                    'acad' => $academyId,
                    'batch' => $batchId,
                    'student' => $sId,
                    'dt' => $sessionDate,
                    'ctime' => $checkinTime,
                    'st' => $targetStatus,
                    'method' => 'manual',
                    'marked' => $currentUser['id'],
                    'notes' => 'Batch bulk marked by ' . $currentUser['name']
                ]);
                $count++;
            }

            echo json_encode([
                'status' => 'success',
                'message' => "Successfully marked {$count} students as {$targetStatus}",
                'count' => $count
            ]);
            exit;
        }

        // Single Student Check-In (via QR scan or manual status click)
        $studentId = $input['student_id'] ?? '';
        $qrPayload = $input['qr_payload'] ?? '';

        // If payload is supplied (e.g. CHESSPLAY:ATTENDANCE:st-1:acad-001:batch-01), parse it
        if (!empty($qrPayload) && empty($studentId)) {
            $parts = explode(':', $qrPayload);
            if (count($parts) >= 3 && $parts[0] === 'CHESSPLAY' && $parts[1] === 'ATTENDANCE') {
                $studentId = $parts[2];
            } else {
                // Check if raw student ID was in QR
                $studentId = trim($qrPayload);
            }
        }

        if (empty($studentId)) {
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => 'Student ID or QR payload is required']);
            exit;
        }

        // Fetch student & batch
        $stQuery = $pdo->prepare("
            SELECT s.*, b.name AS batch_name, a.name AS academy_name
            FROM students s
            LEFT JOIN batches b ON s.batch_id = b.id
            LEFT JOIN academies a ON s.academy_id = a.id
            WHERE s.id = :id
        ");
        $stQuery->execute(['id' => $studentId]);
        $student = $stQuery->fetch();

        if (!$student) {
            http_response_code(404);
            echo json_encode(['status' => 'error', 'message' => 'Student profile not found']);
            exit;
        }

        $batchId = $input['batch_id'] ?? $student['batch_id'];
        $academyId = $student['academy_id'] ?? $currentUser['academy_id'] ?? 'acad-001';
        $sessionDate = $input['session_date'] ?? date('Y-m-d');
        $status = $input['status'] ?? 'present';
        $method = $input['method'] ?? 'qr_scan';
        $notes = $input['notes'] ?? ($method === 'qr_scan' ? 'Digital QR scanned at check-in' : 'Manual roll check-in');
        $checkinTime = $input['checkin_time'] ?? date('H:i:s');

        // Upsert attendance record
        $upsertStmt = $pdo->prepare("
            INSERT INTO attendance_records (id, academy_id, batch_id, student_id, session_date, checkin_time, status, method, marked_by, notes)
            VALUES (:id, :acad, :batch, :student, :dt, :ctime, :st, :method, :marked, :notes)
            ON DUPLICATE KEY UPDATE 
                status = VALUES(status),
                checkin_time = VALUES(checkin_time),
                method = VALUES(method),
                marked_by = VALUES(marked_by),
                notes = VALUES(notes);
        ");

        $upsertStmt->execute([
            'id' => generate_uuid(),
            'acad' => $academyId,
            'batch' => $batchId,
            'student' => $studentId,
            'dt' => $sessionDate,
            'ctime' => ($status === 'absent' ? null : $checkinTime),
            'st' => $status,
            'method' => $method,
            'marked' => $currentUser['id'],
            'notes' => $notes
        ]);

        // Recalculate student cumulative attendance percentage
        $totStmt = $pdo->prepare("
            SELECT COUNT(*) AS total_sessions,
                   SUM(CASE WHEN status IN ('present', 'late') THEN 1 ELSE 0 END) AS attended_sessions
            FROM attendance_records
            WHERE student_id = :sid
        ");
        $totStmt->execute(['sid' => $studentId]);
        $attStats = $totStmt->fetch();

        if ($attStats && (int)$attStats['total_sessions'] > 0) {
            $newPct = round(((int)$attStats['attended_sessions'] / (int)$attStats['total_sessions']) * 100);
            $updPct = $pdo->prepare("UPDATE students SET attendance_pct = :pct WHERE id = :sid");
            $updPct->execute(['pct' => $newPct, 'sid' => $studentId]);
            $student['attendance_pct'] = $newPct;
        }

        // Compose 1-Click WhatsApp Parent Check-In Confirmation Text
        $academyName = $student['academy_name'] ?: "Achiever's Chess Academy";
        $formattedTime = date('h:i A', strtotime($checkinTime));
        $formattedDate = date('d M Y', strtotime($sessionDate));
        $statusEmoji = ($status === 'present' ? '✅ PRESENT' : ($status === 'late' ? '⏱️ LATE' : ($status === 'excused' ? 'ℹ️ EXCUSED' : '❌ ABSENT')));

        $whatsappMessage = "♟️ *{$academyName} — Classroom Check-In Notification*\n\n"
            . "Dear {$student['parent_name']},\n\n"
            . "*{$student['name']}* has successfully checked in for chess class.\n\n"
            . "• *Date:* {$formattedDate}\n"
            . "• *Time:* {$formattedTime}\n"
            . "• *Status:* {$statusEmoji}\n"
            . "• *Batch:* {$student['batch_name']}\n"
            . "• *Method:* " . ($method === 'qr_scan' ? 'Digital QR Scan' : 'Class Roster Check') . "\n\n"
            . "Have a great learning session!\n\n"
            . "_Sent via Chess Play Academy Attendance System_";

        echo json_encode([
            'status' => 'success',
            'message' => "{$student['name']} checked in as {$status} at {$formattedTime}",
            'record' => [
                'student_id' => $studentId,
                'student_name' => $student['name'],
                'avatar_emoji' => $student['avatar_emoji'],
                'batch_name' => $student['batch_name'],
                'session_date' => $sessionDate,
                'checkin_time' => $checkinTime,
                'formatted_time' => $formattedTime,
                'status' => $status,
                'method' => $method,
                'parent_name' => $student['parent_name'],
                'parent_phone' => $student['parent_phone']
            ],
            'whatsapp_message' => $whatsappMessage
        ]);
        exit;
    }

    http_response_code(405);
    echo json_encode(['status' => 'error', 'message' => 'Method not allowed']);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
