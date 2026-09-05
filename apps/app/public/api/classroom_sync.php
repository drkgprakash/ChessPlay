<?php
// =========================================================
// Chess Play Real-Time Classroom Room Signaling API
// Handles Master Board Sync, Simul Grid, Hand-Raises & Live Chat
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

// Authenticate user via JWT Bearer token
$user = requireAuth($pdo);

// Helper to resolve student ID from user account
function resolveStudentId($pdo, $user, $inputStudentId = null) {
    if (!empty($inputStudentId) && $inputStudentId !== $user['id']) {
        return $inputStudentId;
    }
    
    // Check if user is student
    $stStmt = $pdo->prepare("SELECT id FROM students WHERE id = :uid OR email = :email LIMIT 1");
    $stStmt->execute([
        'uid' => $user['id'],
        'email' => $user['email'] ?? ''
    ]);
    $st = $stStmt->fetch();
    if ($st) {
        return $st['id'];
    }
    
    return $user['id'];
}

// Helper to ensure 6 Batch Alpha boards are seeded in session
function ensureSimulBoards($pdo, $sessionId) {
    $countStmt = $pdo->prepare("SELECT COUNT(*) FROM student_board_states WHERE session_id = :sid");
    $countStmt->execute(['sid' => $sessionId]);
    $count = (int)$countStmt->fetchColumn();

    if ($count < 6) {
        $defaultBoards = [
            ['sb-1', $sessionId, 'st-1', 'Aarav Sharma', '👦', 'r1bqkb1r/pppp1ppp/2n5/4p3/2B1n3/5Q2/PPPP1PPP/RNB1K1NR w KQkq - 0 5', 'Qf3', '+1.4', 'active', 0],
            ['sb-2', $sessionId, 'st-2', 'Diya Patel', '👧', '6k1/5ppp/8/8/8/5Q2/4NPPP/2r3K1 w - - 0 1', 'cxd4', '-0.8', 'blunder', 0],
            ['sb-3', $sessionId, 'st-3', 'Rohan Iyer', '🧑', 'r3k2r/pppq1ppp/3p1n2/4p3/1b2P3/2NP1N2/PPP2PPP/R1BQK2R w KQkq - 0 8', 'Nf6', '+2.1', 'active', 0],
            ['sb-4', $sessionId, 'st-4', 'Ananya Gupta', '👧', 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1', 'e4', '0.0', 'waiting', 0],
            ['sb-5', $sessionId, 'st-5', 'Kabir Verma', '👦', 'rnbqkbnr/pppp1ppp/8/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R b KQkq - 1 2', 'Nf3', '+3.6', 'active', 0],
            ['sb-6', $sessionId, 'st-6', 'Meera Nair', '👧', '5rk1/1p3ppp/pq2p3/3p4/8/1P3Q2/P1r2PPP/R4RK1 w - - 0 20', 'Nf6', '-1.2', 'solved', 0]
        ];

        $ins = $pdo->prepare("
            INSERT INTO student_board_states (id, session_id, student_id, student_name, avatar, current_fen, last_move, eval_score, status, hand_raised)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
                current_fen = VALUES(current_fen),
                last_move = VALUES(last_move),
                eval_score = VALUES(eval_score),
                status = VALUES(status),
                hand_raised = VALUES(hand_raised)
        ");

        foreach ($defaultBoards as $b) {
            $ins->execute($b);
        }
    }
}

// ---------------------------------------------------------
// 1. GET ?action=snapshot&batch_id=X
// Fetches initial full classroom room snapshot
// ---------------------------------------------------------
if ($action === 'snapshot' && $method === 'GET') {
    $batchId = trim($_GET['batch_id'] ?? 'batch-01');

    if (!$pdo) {
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => 'Database unavailable']);
        exit;
    }

    // Fetch or create session
    $sessionStmt = $pdo->prepare("SELECT * FROM classroom_sessions WHERE batch_id = :batch_id AND status = 'active' LIMIT 1");
    $sessionStmt->execute(['batch_id' => $batchId]);
    $session = $sessionStmt->fetch();

    if (!$session) {
        $sessionId = 'session-01';
        $createStmt = $pdo->prepare("
            INSERT INTO classroom_sessions (id, batch_id, academy_id, coach_id, title, master_fen, is_locked) 
            VALUES (:id, :batch, :acad, :coach, 'Live Masterclass — Batch Alpha', 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1', 0)
            ON DUPLICATE KEY UPDATE status = 'active'
        ");
        $createStmt->execute([
            'id' => $sessionId,
            'batch' => $batchId,
            'acad' => $user['academy_id'] ?? 'acad-001',
            'coach' => $user['id']
        ]);
        $sessionStmt->execute(['batch_id' => $batchId]);
        $session = $sessionStmt->fetch();
    }

    $sessionId = $session['id'] ?? 'session-01';
    ensureSimulBoards($pdo, $sessionId);

    // Decode active arrows if present
    if (!empty($session['active_arrows'])) {
        $session['active_arrows'] = json_decode($session['active_arrows'], true);
    } else {
        $session['active_arrows'] = [];
    }

    // Fetch 6 Student Simul Boards
    $sbStmt = $pdo->prepare("SELECT * FROM student_board_states WHERE session_id = :session_id ORDER BY id ASC");
    $sbStmt->execute(['session_id' => $sessionId]);
    $studentBoards = $sbStmt->fetchAll();

    // Determine current user's student mapping
    $myStudentId = resolveStudentId($pdo, $user);
    $myBoard = null;
    foreach ($studentBoards as $sb) {
        if ($sb['student_id'] === $myStudentId || $sb['student_id'] === $user['id']) {
            $myBoard = $sb;
            break;
        }
    }
    // Default to Board 1 if logged in as student and not matched
    if (!$myBoard && $user['role'] === 'student' && count($studentBoards) > 0) {
        $myBoard = $studentBoards[0];
        $myStudentId = $studentBoards[0]['student_id'];
    }

    // Fetch latest chat messages
    $chatStmt = $pdo->prepare("SELECT id, user_name AS sender, user_role, payload, created_at 
                              FROM classroom_events 
                              WHERE batch_id = :batch_id AND event_type = 'chat_message' 
                              ORDER BY id DESC LIMIT 50");
    $chatStmt->execute(['batch_id' => $batchId]);
    $rawChat = $chatStmt->fetchAll();
    
    $chatMessages = [];
    foreach (array_reverse($rawChat) as $c) {
        $p = json_decode($c['payload'], true);
        $chatMessages[] = [
            'id' => (int)$c['id'],
            'sender' => $c['sender'],
            'role' => $c['user_role'] ?? 'student',
            'text' => $p['text'] ?? '',
            'time' => date('h:i A', strtotime($c['created_at']))
        ];
    }

    // Fetch highest event ID for sync watermark
    $maxEventStmt = $pdo->prepare("SELECT COALESCE(MAX(id), 0) AS max_id FROM classroom_events WHERE batch_id = :batch_id");
    $maxEventStmt->execute(['batch_id' => $batchId]);
    $maxEvent = $maxEventStmt->fetch();

    // Fetch latest coach stream status
    $streamStmt = $pdo->prepare("SELECT payload FROM classroom_events 
                                WHERE batch_id = :batch_id AND event_type = 'stream_status' 
                                ORDER BY id DESC LIMIT 1");
    $streamStmt->execute(['batch_id' => $batchId]);
    $latestStream = $streamStmt->fetch();
    $streamStatus = null;
    if ($latestStream && !empty($latestStream['payload'])) {
        $streamStatus = json_decode($latestStream['payload'], true);
    }

    echo json_encode([
        'status' => 'success',
        'session' => $session,
        'student_boards' => $studentBoards,
        'my_student_id' => $myStudentId,
        'my_board' => $myBoard,
        'chat_messages' => $chatMessages,
        'stream_status' => $streamStatus,
        'last_event_id' => (int)($maxEvent['max_id'] ?? 0)
    ]);
    exit;
}

// ---------------------------------------------------------
// 2. GET ?action=sync&batch_id=X&since_id=Y
// Fast sub-second delta stream of new classroom events
// ---------------------------------------------------------
if ($action === 'sync' && $method === 'GET') {
    $batchId = trim($_GET['batch_id'] ?? 'batch-01');
    $sinceId = (int)($_GET['since_id'] ?? 0);

    // Fetch new events
    $eventStmt = $pdo->prepare("SELECT * FROM classroom_events 
                                WHERE batch_id = :batch_id AND id > :since_id 
                                ORDER BY id ASC LIMIT 50");
    $eventStmt->execute(['batch_id' => $batchId, 'since_id' => $sinceId]);
    $rawEvents = $eventStmt->fetchAll();

    $events = [];
    $maxId = $sinceId;
    foreach ($rawEvents as $ev) {
        $events[] = [
            'id' => (int)$ev['id'],
            'user_id' => $ev['user_id'],
            'user_name' => $ev['user_name'],
            'user_role' => $ev['user_role'],
            'event_type' => $ev['event_type'],
            'payload' => json_decode($ev['payload'], true),
            'created_at' => $ev['created_at']
        ];
        if ((int)$ev['id'] > $maxId) {
            $maxId = (int)$ev['id'];
        }
    }

    // Fetch active session state (lock & master FEN)
    $sessionStmt = $pdo->prepare("SELECT id, master_fen, is_locked, active_arrows, updated_at FROM classroom_sessions WHERE batch_id = :batch_id AND status = 'active' LIMIT 1");
    $sessionStmt->execute(['batch_id' => $batchId]);
    $session = $sessionStmt->fetch();
    if ($session && !empty($session['active_arrows'])) {
        $session['active_arrows'] = json_decode($session['active_arrows'], true);
    }

    $sessionId = $session['id'] ?? 'session-01';

    // Fetch all student boards (status, hand-raises, latest FEN)
    $sbStmt = $pdo->prepare("SELECT id, student_id, student_name, avatar, current_fen, last_move, eval_score, status, hand_raised, updated_at FROM student_board_states WHERE session_id = :session_id ORDER BY id ASC");
    $sbStmt->execute(['session_id' => $sessionId]);
    $studentBoards = $sbStmt->fetchAll();

    echo json_encode([
        'status' => 'success',
        'events' => $events,
        'session' => $session,
        'student_boards' => $studentBoards,
        'last_event_id' => $maxId
    ]);
    exit;
}

// ---------------------------------------------------------
// 3. POST ?action=broadcast
// Coach broadcasts move, FEN, arrows, or board lock
// ---------------------------------------------------------
if ($action === 'broadcast' && $method === 'POST') {
    requirePermission($user, 'classroom:master');

    $input = getJsonInput();
    $batchId = trim($input['batch_id'] ?? 'batch-01');
    $eventType = trim($input['event_type'] ?? 'move');
    $payload = $input['payload'] ?? [];

    $sessionStmt = $pdo->prepare("SELECT id FROM classroom_sessions WHERE batch_id = :batch_id AND status = 'active' LIMIT 1");
    $sessionStmt->execute(['batch_id' => $batchId]);
    $session = $sessionStmt->fetch();
    $sessionId = $session['id'] ?? 'session-01';

    // Update session table based on broadcast event
    if ($eventType === 'move' || $eventType === 'fen_reset') {
        $fen = $payload['fen'] ?? null;
        if ($fen) {
            $uStmt = $pdo->prepare("UPDATE classroom_sessions SET master_fen = :fen WHERE id = :id");
            $uStmt->execute(['fen' => $fen, 'id' => $sessionId]);
        }
    } elseif ($eventType === 'board_lock') {
        $isLocked = !empty($payload['is_locked']) ? 1 : 0;
        $uStmt = $pdo->prepare("UPDATE classroom_sessions SET is_locked = :locked WHERE id = :id");
        $uStmt->execute(['locked' => $isLocked, 'id' => $sessionId]);
    } elseif ($eventType === 'arrow_draw') {
        $arrowsJson = json_encode($payload['arrows'] ?? []);
        $uStmt = $pdo->prepare("UPDATE classroom_sessions SET active_arrows = :arrows WHERE id = :id");
        $uStmt->execute(['arrows' => $arrowsJson, 'id' => $sessionId]);
    }

    // Insert into sequential events log
    $insStmt = $pdo->prepare("INSERT INTO classroom_events (session_id, batch_id, user_id, user_name, user_role, event_type, payload) 
                             VALUES (:session_id, :batch_id, :user_id, :user_name, :user_role, :event_type, :payload)");
    $insStmt->execute([
        'session_id' => $sessionId,
        'batch_id' => $batchId,
        'user_id' => $user['id'],
        'user_name' => $user['name'],
        'user_role' => $user['role'],
        'event_type' => $eventType,
        'payload' => json_encode($payload)
    ]);

    echo json_encode([
        'status' => 'success',
        'event_id' => (int)$pdo->lastInsertId(),
        'event_type' => $eventType
    ]);
    exit;
}

// ---------------------------------------------------------
// 4. POST ?action=student_move
// Student or coach submits a move on an individual simul board
// ---------------------------------------------------------
if ($action === 'student_move' && $method === 'POST') {
    $input = getJsonInput();
    $batchId = trim($input['batch_id'] ?? 'batch-01');
    $rawStudentId = trim($input['student_id'] ?? '');
    $studentId = resolveStudentId($pdo, $user, $rawStudentId);

    $fen = trim($input['fen'] ?? '');
    $lastMove = trim($input['last_move'] ?? '');
    $evalScore = trim($input['eval_score'] ?? '0.0');
    $status = trim($input['status'] ?? 'active');

    $sessionStmt = $pdo->prepare("SELECT id FROM classroom_sessions WHERE batch_id = :batch_id AND status = 'active' LIMIT 1");
    $sessionStmt->execute(['batch_id' => $batchId]);
    $session = $sessionStmt->fetch();
    $sessionId = $session['id'] ?? 'session-01';

    // Update student board state (matches student_id OR user_id)
    $uStmt = $pdo->prepare("UPDATE student_board_states 
                           SET current_fen = :fen, last_move = :move, eval_score = :eval, status = :status 
                           WHERE session_id = :session_id AND (student_id = :sid OR student_id = :uid)");
    $uStmt->execute([
        'fen' => $fen,
        'move' => $lastMove,
        'eval' => $evalScore,
        'status' => $status,
        'session_id' => $sessionId,
        'sid' => $studentId,
        'uid' => $user['id']
    ]);

    // Insert student_move event so other party receives it immediately
    $insStmt = $pdo->prepare("INSERT INTO classroom_events (session_id, batch_id, user_id, user_name, user_role, event_type, payload) 
                             VALUES (:session_id, :batch_id, :user_id, :user_name, :user_role, 'student_move', :payload)");
    $insStmt->execute([
        'session_id' => $sessionId,
        'batch_id' => $batchId,
        'user_id' => $user['id'],
        'user_name' => $user['name'],
        'user_role' => $user['role'],
        'payload' => json_encode([
            'student_id' => $studentId,
            'fen' => $fen,
            'last_move' => $lastMove,
            'eval_score' => $evalScore,
            'status' => $status
        ])
    ]);

    echo json_encode(['status' => 'success', 'student_id' => $studentId]);
    exit;
}

// ---------------------------------------------------------
// 5. POST ?action=raise_hand
// Student raises or lowers hand ✋, or Coach lowers it
// ---------------------------------------------------------
if ($action === 'raise_hand' && $method === 'POST') {
    $input = getJsonInput();
    $batchId = trim($input['batch_id'] ?? 'batch-01');
    $rawStudentId = trim($input['student_id'] ?? '');
    $studentId = resolveStudentId($pdo, $user, $rawStudentId);
    $handRaised = !empty($input['hand_raised']) ? 1 : 0;

    $sessionStmt = $pdo->prepare("SELECT id FROM classroom_sessions WHERE batch_id = :batch_id AND status = 'active' LIMIT 1");
    $sessionStmt->execute(['batch_id' => $batchId]);
    $session = $sessionStmt->fetch();
    $sessionId = $session['id'] ?? 'session-01';

    $uStmt = $pdo->prepare("UPDATE student_board_states 
                           SET hand_raised = :raised 
                           WHERE session_id = :session_id AND (student_id = :sid OR student_id = :uid)");
    $uStmt->execute([
        'raised' => $handRaised, 
        'session_id' => $sessionId, 
        'sid' => $studentId,
        'uid' => $user['id']
    ]);

    // Log event with student name
    $studentName = $user['name'];
    $insStmt = $pdo->prepare("INSERT INTO classroom_events (session_id, batch_id, user_id, user_name, user_role, event_type, payload) 
                             VALUES (:session_id, :batch_id, :user_id, :user_name, :user_role, 'raise_hand', :payload)");
    $insStmt->execute([
        'session_id' => $sessionId,
        'batch_id' => $batchId,
        'user_id' => $user['id'],
        'user_name' => $studentName,
        'user_role' => $user['role'],
        'payload' => json_encode([
            'student_id' => $studentId, 
            'student_name' => $studentName,
            'hand_raised' => $handRaised
        ])
    ]);

    echo json_encode(['status' => 'success', 'student_id' => $studentId, 'hand_raised' => $handRaised]);
    exit;
}

// ---------------------------------------------------------
// 6. POST ?action=chat
// Sends group chat message in the live classroom
// ---------------------------------------------------------
if ($action === 'chat' && $method === 'POST') {
    $input = getJsonInput();
    $batchId = trim($input['batch_id'] ?? 'batch-01');
    $text = trim($input['text'] ?? '');

    if (empty($text)) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Message text cannot be empty']);
        exit;
    }

    $sessionStmt = $pdo->prepare("SELECT id FROM classroom_sessions WHERE batch_id = :batch_id AND status = 'active' LIMIT 1");
    $sessionStmt->execute(['batch_id' => $batchId]);
    $session = $sessionStmt->fetch();
    $sessionId = $session['id'] ?? 'session-01';

    $insStmt = $pdo->prepare("INSERT INTO classroom_events (session_id, batch_id, user_id, user_name, user_role, event_type, payload) 
                             VALUES (:session_id, :batch_id, :user_id, :user_name, :user_role, 'chat_message', :payload)");
    $insStmt->execute([
        'session_id' => $sessionId,
        'batch_id' => $batchId,
        'user_id' => $user['id'],
        'user_name' => $user['name'],
        'user_role' => $user['role'],
        'payload' => json_encode(['text' => $text])
    ]);

    $chatId = (int)$pdo->lastInsertId();

    echo json_encode([
        'status' => 'success',
        'chat' => [
            'id' => $chatId,
            'sender' => $user['name'],
            'role' => $user['role'],
            'text' => $text,
            'time' => date('h:i A')
        ]
    ]);
    exit;
}

// ---------------------------------------------------------
// 7. POST ?action=broadcast_to_simul
// Coach pushes position to ALL 6 student simul boards
// ---------------------------------------------------------
if ($action === 'broadcast_to_simul' && $method === 'POST') {
    requirePermission($user, 'classroom:master');

    $input = getJsonInput();
    $batchId = trim($input['batch_id'] ?? 'batch-01');
    $fen = trim($input['fen'] ?? 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');

    $sessionStmt = $pdo->prepare("SELECT id FROM classroom_sessions WHERE batch_id = :batch_id AND status = 'active' LIMIT 1");
    $sessionStmt->execute(['batch_id' => $batchId]);
    $session = $sessionStmt->fetch();
    $sessionId = $session['id'] ?? 'session-01';

    $uStmt = $pdo->prepare("UPDATE student_board_states 
                           SET current_fen = :fen, last_move = 'Reset by Coach', status = 'active' 
                           WHERE session_id = :session_id");
    $uStmt->execute(['fen' => $fen, 'session_id' => $sessionId]);

    // Insert broadcast event so all students receive it
    $insStmt = $pdo->prepare("INSERT INTO classroom_events (session_id, batch_id, user_id, user_name, user_role, event_type, payload) 
                             VALUES (:session_id, :batch_id, :user_id, :user_name, :user_role, 'simul_reset', :payload)");
    $insStmt->execute([
        'session_id' => $sessionId,
        'batch_id' => $batchId,
        'user_id' => $user['id'],
        'user_name' => $user['name'],
        'user_role' => $user['role'],
        'payload' => json_encode(['fen' => $fen])
    ]);

    echo json_encode(['status' => 'success', 'message' => 'Position broadcasted to all 6 student boards']);
    exit;
}

// ---------------------------------------------------------
// 8. POST ?action=signal
// WebRTC Signaling: exchange offer, answer, and ICE candidates
// ---------------------------------------------------------
if ($action === 'signal' && $method === 'POST') {
    $input = getJsonInput();
    $batchId = trim($input['batch_id'] ?? 'batch-01');
    $targetUserId = trim($input['target_user_id'] ?? '');
    $fromUserId = !empty($input['from_user_id']) ? trim($input['from_user_id']) : $user['id'];
    $fromUserName = !empty($input['from_user_name']) ? trim($input['from_user_name']) : $user['name'];
    $fromUserRole = !empty($input['from_user_role']) ? trim($input['from_user_role']) : $user['role'];
    $signalType = trim($input['signal_type'] ?? '');
    $signalData = $input['signal_data'] ?? null;

    $sessionStmt = $pdo->prepare("SELECT id FROM classroom_sessions WHERE batch_id = :batch_id AND status = 'active' LIMIT 1");
    $sessionStmt->execute(['batch_id' => $batchId]);
    $session = $sessionStmt->fetch();
    $sessionId = $session['id'] ?? 'session-01';

    $insStmt = $pdo->prepare("INSERT INTO classroom_events (session_id, batch_id, user_id, user_name, user_role, event_type, payload) 
                             VALUES (:session_id, :batch_id, :user_id, :user_name, :user_role, 'webrtc_signal', :payload)");
    $insStmt->execute([
        'session_id' => $sessionId,
        'batch_id' => $batchId,
        'user_id' => $fromUserId,
        'user_name' => $fromUserName,
        'user_role' => $fromUserRole,
        'payload' => json_encode([
            'target_user_id' => $targetUserId,
            'from_user_id' => $fromUserId,
            'from_user_name' => $fromUserName,
            'from_user_role' => $fromUserRole,
            'signal_type' => $signalType,
            'signal_data' => $signalData
        ])
    ]);

    echo json_encode(['status' => 'success', 'signal_id' => (int)$pdo->lastInsertId()]);
    exit;
}

// ---------------------------------------------------------
// 9. POST ?action=stream_status
// Broadcasts AV status (cam_active, mic_active, screen_active)
// ---------------------------------------------------------
if ($action === 'stream_status' && $method === 'POST') {
    $input = getJsonInput();
    $batchId = trim($input['batch_id'] ?? 'batch-01');
    $camActive = !empty($input['cam_active']) ? 1 : 0;
    $micActive = !empty($input['mic_active']) ? 1 : 0;
    $screenActive = !empty($input['screen_active']) ? 1 : 0;
    $streamType = trim($input['stream_type'] ?? 'webcam');
    $streamUserId = !empty($input['user_id']) ? trim($input['user_id']) : $user['id'];

    $sessionStmt = $pdo->prepare("SELECT id FROM classroom_sessions WHERE batch_id = :batch_id AND status = 'active' LIMIT 1");
    $sessionStmt->execute(['batch_id' => $batchId]);
    $session = $sessionStmt->fetch();
    $sessionId = $session['id'] ?? 'session-01';

    $insStmt = $pdo->prepare("INSERT INTO classroom_events (session_id, batch_id, user_id, user_name, user_role, event_type, payload) 
                             VALUES (:session_id, :batch_id, :user_id, :user_name, :user_role, 'stream_status', :payload)");
    $insStmt->execute([
        'session_id' => $sessionId,
        'batch_id' => $batchId,
        'user_id' => $streamUserId,
        'user_name' => $user['name'],
        'user_role' => $user['role'],
        'payload' => json_encode([
            'user_id' => $streamUserId,
            'user_name' => $user['name'],
            'role' => $user['role'],
            'cam_active' => $camActive,
            'mic_active' => $micActive,
            'screen_active' => $screenActive,
            'stream_type' => $streamType
        ])
    ]);

    echo json_encode(['status' => 'success']);
    exit;
}

echo json_encode([
    'status' => 'ok',
    'service' => 'Chess Play Realtime Classroom API',
    'actions' => ['snapshot', 'sync', 'broadcast', 'student_move', 'raise_hand', 'chat', 'broadcast_to_simul', 'signal', 'stream_status']
]);
