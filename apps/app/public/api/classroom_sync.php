<?php
// =========================================================
// Chess Play Real-Time Classroom Room Signaling API
// Handles Master Board Sync, Simul Grid, Hand-Raises & Live Chat
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

// Authenticate user via JWT Bearer token
$user = requireAuth($pdo);

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
        $sessionId = 'session-' . bin2hex(random_bytes(4));
        $createStmt = $pdo->prepare("INSERT INTO classroom_sessions (id, batch_id, academy_id, coach_id, title) 
                                     VALUES (:id, :batch, :acad, :coach, 'Live Masterclass')");
        $createStmt->execute([
            'id' => $sessionId,
            'batch' => $batchId,
            'acad' => $user['academy_id'] ?? 'acad-001',
            'coach' => $user['id']
        ]);
        $sessionStmt->execute(['batch_id' => $batchId]);
        $session = $sessionStmt->fetch();
    }

    // Decode active arrows if present
    if (!empty($session['active_arrows'])) {
        $session['active_arrows'] = json_decode($session['active_arrows'], true);
    } else {
        $session['active_arrows'] = [];
    }

    // Fetch 6 Student Simul Boards
    $sbStmt = $pdo->prepare("SELECT * FROM student_board_states WHERE session_id = :session_id ORDER BY id ASC");
    $sbStmt->execute(['session_id' => $session['id']]);
    $studentBoards = $sbStmt->fetchAll();

    // Fetch latest chat messages
    $chatStmt = $pdo->prepare("SELECT id, user_name AS sender, payload, created_at 
                              FROM classroom_events 
                              WHERE batch_id = :batch_id AND event_type = 'chat_message' 
                              ORDER BY id DESC LIMIT 40");
    $chatStmt->execute(['batch_id' => $batchId]);
    $rawChat = $chatStmt->fetchAll();
    
    $chatMessages = [];
    foreach (array_reverse($rawChat) as $c) {
        $p = json_decode($c['payload'], true);
        $chatMessages[] = [
            'id' => $c['id'],
            'sender' => $c['sender'],
            'text' => $p['text'] ?? '',
            'time' => date('h:i A', strtotime($c['created_at']))
        ];
    }

    // Fetch highest event ID for sync watermark
    $maxEventStmt = $pdo->prepare("SELECT COALESCE(MAX(id), 0) AS max_id FROM classroom_events WHERE batch_id = :batch_id");
    $maxEventStmt->execute(['batch_id' => $batchId]);
    $maxEvent = $maxEventStmt->fetch();

    echo json_encode([
        'status' => 'success',
        'session' => $session,
        'student_boards' => $studentBoards,
        'chat_messages' => $chatMessages,
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

    // Fetch all student boards (status, hand-raises, latest FEN)
    $sbStmt = $pdo->prepare("SELECT id, student_id, student_name, avatar, current_fen, last_move, eval_score, status, hand_raised, updated_at FROM student_board_states WHERE session_id = :session_id ORDER BY id ASC");
    $sbStmt->execute(['session_id' => $session['id'] ?? 'session-01']);
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
    $studentId = trim($input['student_id'] ?? '');
    $fen = trim($input['fen'] ?? '');
    $lastMove = trim($input['last_move'] ?? '');
    $evalScore = trim($input['eval_score'] ?? '0.0');
    $status = trim($input['status'] ?? 'active');

    $sessionStmt = $pdo->prepare("SELECT id FROM classroom_sessions WHERE batch_id = :batch_id AND status = 'active' LIMIT 1");
    $sessionStmt->execute(['batch_id' => $batchId]);
    $session = $sessionStmt->fetch();
    $sessionId = $session['id'] ?? 'session-01';

    // Update student board state
    $uStmt = $pdo->prepare("UPDATE student_board_states 
                           SET current_fen = :fen, last_move = :move, eval_score = :eval, status = :status 
                           WHERE session_id = :session_id AND student_id = :student_id");
    $uStmt->execute([
        'fen' => $fen,
        'move' => $lastMove,
        'eval' => $evalScore,
        'status' => $status,
        'session_id' => $sessionId,
        'student_id' => $studentId
    ]);

    // Insert student_move event
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

    echo json_encode(['status' => 'success']);
    exit;
}

// ---------------------------------------------------------
// 5. POST ?action=raise_hand
// Student raises or lowers hand ✋
// ---------------------------------------------------------
if ($action === 'raise_hand' && $method === 'POST') {
    $input = getJsonInput();
    $batchId = trim($input['batch_id'] ?? 'batch-01');
    $studentId = trim($input['student_id'] ?? $user['id']);
    $handRaised = !empty($input['hand_raised']) ? 1 : 0;

    $sessionStmt = $pdo->prepare("SELECT id FROM classroom_sessions WHERE batch_id = :batch_id AND status = 'active' LIMIT 1");
    $sessionStmt->execute(['batch_id' => $batchId]);
    $session = $sessionStmt->fetch();
    $sessionId = $session['id'] ?? 'session-01';

    $uStmt = $pdo->prepare("UPDATE student_board_states SET hand_raised = :raised WHERE session_id = :session_id AND student_id = :student_id");
    $uStmt->execute(['raised' => $handRaised, 'session_id' => $sessionId, 'student_id' => $studentId]);

    // Log event
    $insStmt = $pdo->prepare("INSERT INTO classroom_events (session_id, batch_id, user_id, user_name, user_role, event_type, payload) 
                             VALUES (:session_id, :batch_id, :user_id, :user_name, :user_role, 'raise_hand', :payload)");
    $insStmt->execute([
        'session_id' => $sessionId,
        'batch_id' => $batchId,
        'user_id' => $user['id'],
        'user_name' => $user['name'],
        'user_role' => $user['role'],
        'payload' => json_encode(['student_id' => $studentId, 'hand_raised' => $handRaised])
    ]);

    echo json_encode(['status' => 'success', 'hand_raised' => $handRaised]);
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
            'text' => $text,
            'time' => date('h:i A')
        ]
    ]);
    exit;
}

echo json_encode([
    'status' => 'ok',
    'service' => 'Chess Play Realtime Classroom API',
    'actions' => ['snapshot', 'sync', 'broadcast', 'student_move', 'raise_hand', 'chat']
]);
