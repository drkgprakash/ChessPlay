<?php
// =========================================================
// Chess Play Tournament Organizer & Swiss Pairings REST API
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

// Self-healing schema check
try {
    $pdo->exec("
    CREATE TABLE IF NOT EXISTS tournaments (
        id VARCHAR(36) PRIMARY KEY,
        academy_id VARCHAR(36) NOT NULL,
        batch_id VARCHAR(36) NULL,
        title VARCHAR(150) NOT NULL,
        format ENUM('swiss', 'round_robin', 'arena') DEFAULT 'swiss',
        time_control VARCHAR(50) DEFAULT '10m + 5s Rapid',
        total_rounds INT DEFAULT 5,
        current_round INT DEFAULT 3,
        status ENUM('upcoming', 'in_progress', 'completed') DEFAULT 'in_progress',
        created_by VARCHAR(36) NOT NULL,
        scheduled_at DATETIME NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_tourn_acad (academy_id, status)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

    CREATE TABLE IF NOT EXISTS tournament_participants (
        id VARCHAR(36) PRIMARY KEY,
        tournament_id VARCHAR(36) NOT NULL,
        student_id VARCHAR(36) NOT NULL,
        score DECIMAL(3,1) DEFAULT 0.0,
        buchholz DECIMAL(4,1) DEFAULT 0.0,
        sonneborn_berger DECIMAL(4,1) DEFAULT 0.0,
        rank INT DEFAULT 1,
        streak INT DEFAULT 0,
        performance_rating INT DEFAULT 1400,
        color_history VARCHAR(50) DEFAULT '',
        opponents_played JSON NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY uk_tourn_student (tournament_id, student_id),
        INDEX idx_part_score (tournament_id, score)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

    CREATE TABLE IF NOT EXISTS tournament_matches (
        id VARCHAR(36) PRIMARY KEY,
        tournament_id VARCHAR(36) NOT NULL,
        round_number INT NOT NULL,
        table_number INT NOT NULL,
        white_student_id VARCHAR(36) NOT NULL,
        black_student_id VARCHAR(36) NULL,
        result ENUM('pending', '1-0', '0-1', '1/2-1/2', '1-0F', '0-1F') DEFAULT 'pending',
        played_at DATETIME NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY uk_match (tournament_id, round_number, table_number),
        INDEX idx_match_round (tournament_id, round_number)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    ");

    $count = (int)$pdo->query("SELECT COUNT(*) FROM tournaments")->fetchColumn();
    if ($count === 0) {
        $tournStmt = $pdo->prepare("
            INSERT INTO tournaments (id, academy_id, batch_id, title, format, time_control, total_rounds, current_round, status, created_by, scheduled_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ");
        $tournStmt->execute(['tourn-01', 'acad-001', 'batch-01', 'Sunday Rapid Grand Prix — September Edition', 'swiss', '10m + 5s Rapid', 5, 3, 'in_progress', 'usr-headcoach', date('Y-m-d 10:00:00')]);

        $partStmt = $pdo->prepare("
            INSERT INTO tournament_participants (id, tournament_id, student_id, score, buchholz, sonneborn_berger, rank, streak, performance_rating, color_history, opponents_played)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ");
        $partStmt->execute(['part-01', 'tourn-01', 'st-1', 2.5, 4.5, 3.75, 1, 2, 1780, 'W,B,W', json_encode(['st-5', 'st-2'])]);
        $partStmt->execute(['part-02', 'tourn-01', 'st-2', 2.0, 4.0, 3.00, 2, 1, 1690, 'W,W,B', json_encode(['st-4', 'st-1'])]);
        $partStmt->execute(['part-03', 'tourn-01', 'st-3', 2.0, 3.5, 2.50, 3, 1, 1650, 'W,B,B', json_encode(['st-6', 'st-5'])]);
        $partStmt->execute(['part-04', 'tourn-01', 'st-5', 1.5, 4.0, 1.75, 4, 0, 1510, 'B,W,W', json_encode(['st-1', 'st-3'])]);
        $partStmt->execute(['part-05', 'tourn-01', 'st-4', 1.0, 3.5, 1.00, 5, 0, 1420, 'B,W,B', json_encode(['st-2', 'st-6'])]);
        $partStmt->execute(['part-06', 'tourn-01', 'st-6', 1.0, 3.0, 0.75, 6, 0, 1390, 'B,B,W', json_encode(['st-3', 'st-4'])]);

        $matchStmt = $pdo->prepare("
            INSERT INTO tournament_matches (id, tournament_id, round_number, table_number, white_student_id, black_student_id, result, played_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ");
        // Round 1
        $matchStmt->execute(['m-1-1', 'tourn-01', 1, 1, 'st-1', 'st-5', '1-0', date('Y-m-d 10:15:00')]);
        $matchStmt->execute(['m-1-2', 'tourn-01', 1, 2, 'st-2', 'st-4', '1-0', date('Y-m-d 10:15:00')]);
        $matchStmt->execute(['m-1-3', 'tourn-01', 1, 3, 'st-3', 'st-6', '1-0', date('Y-m-d 10:15:00')]);
        // Round 2
        $matchStmt->execute(['m-2-1', 'tourn-01', 2, 1, 'st-2', 'st-1', '1/2-1/2', date('Y-m-d 10:45:00')]);
        $matchStmt->execute(['m-2-2', 'tourn-01', 2, 2, 'st-5', 'st-3', '0-1', date('Y-m-d 10:45:00')]);
        $matchStmt->execute(['m-2-3', 'tourn-01', 2, 3, 'st-4', 'st-6', '0-1', date('Y-m-d 10:45:00')]);
        // Round 3
        $matchStmt->execute(['m-3-1', 'tourn-01', 3, 1, 'st-1', 'st-3', 'pending', NULL]);
        $matchStmt->execute(['m-3-2', 'tourn-01', 3, 2, 'st-6', 'st-2', 'pending', NULL]);
        $matchStmt->execute(['m-3-3', 'tourn-01', 3, 3, 'st-5', 'st-4', 'pending', NULL]);
    }
} catch (Exception $e) {
    // Ignore migration exception
}

// Function to recalculate tournament scores, Buchholz, and Sonneborn-Berger
function recalculate_standings($pdo, $tournamentId) {
    // Fetch all participants
    $partStmt = $pdo->prepare("SELECT student_id FROM tournament_participants WHERE tournament_id = :tid");
    $partStmt->execute(['tid' => $tournamentId]);
    $participantIds = $partStmt->fetchAll(PDO::FETCH_COLUMN);

    if (empty($participantIds)) return;

    // Fetch all completed matches for this tournament
    $matchStmt = $pdo->prepare("
        SELECT * FROM tournament_matches 
        WHERE tournament_id = :tid AND result != 'pending'
        ORDER BY round_number ASC
    ");
    $matchStmt->execute(['tid' => $tournamentId]);
    $matches = $matchStmt->fetchAll();

    // Map: student_id => [score, opponents => [], defeated => [], drawn => [], color_history => []]
    $data = [];
    foreach ($participantIds as $id) {
        $data[$id] = [
            'score' => 0.0,
            'opponents' => [],
            'defeated' => [],
            'drawn' => [],
            'streak' => 0,
            'color_history' => []
        ];
    }

    foreach ($matches as $m) {
        $w = $m['white_student_id'];
        $b = $m['black_student_id'];
        $res = $m['result'];

        if (isset($data[$w])) {
            $data[$w]['color_history'][] = 'W';
            if ($b && isset($data[$b])) {
                $data[$w]['opponents'][] = $b;
            }
        }
        if ($b && isset($data[$b])) {
            $data[$b]['color_history'][] = 'B';
            if (isset($data[$w])) {
                $data[$b]['opponents'][] = $w;
            }
        }

        if ($res === '1-0' || $res === '1-0F') {
            if (isset($data[$w])) {
                $data[$w]['score'] += 1.0;
                if ($b) $data[$w]['defeated'][] = $b;
                $data[$w]['streak']++;
            }
            if ($b && isset($data[$b])) {
                $data[$b]['streak'] = 0;
            }
        } elseif ($res === '0-1' || $res === '0-1F') {
            if ($b && isset($data[$b])) {
                $data[$b]['score'] += 1.0;
                $data[$b]['defeated'][] = $w;
                $data[$b]['streak']++;
            }
            if (isset($data[$w])) {
                $data[$w]['streak'] = 0;
            }
        } elseif ($res === '1/2-1/2') {
            if (isset($data[$w])) {
                $data[$w]['score'] += 0.5;
                if ($b) $data[$w]['drawn'][] = $b;
                $data[$w]['streak'] = 0;
            }
            if ($b && isset($data[$b])) {
                $data[$b]['score'] += 0.5;
                $data[$b]['drawn'][] = $w;
                $data[$b]['streak'] = 0;
            }
        }
    }

    // Now calculate Buchholz and Sonneborn-Berger using scores
    $calculated = [];
    foreach ($participantIds as $id) {
        $d = $data[$id];
        $score = $d['score'];

        // Buchholz = sum of opponents' scores
        $buchholz = 0.0;
        foreach ($d['opponents'] as $oppId) {
            $buchholz += $data[$oppId]['score'] ?? 0.0;
        }

        // Sonneborn-Berger = sum of beaten opponents' scores + 0.5 * sum of drawn opponents' scores
        $sb = 0.0;
        foreach ($d['defeated'] as $oppId) {
            $sb += $data[$oppId]['score'] ?? 0.0;
        }
        foreach ($d['drawn'] as $oppId) {
            $sb += ($data[$oppId]['score'] ?? 0.0) * 0.5;
        }

        // Student initial rating for performance rating
        $calculated[$id] = [
            'score' => $score,
            'buchholz' => $buchholz,
            'sonneborn_berger' => $sb,
            'streak' => $d['streak'],
            'color_history' => implode(',', $d['color_history']),
            'opponents' => json_encode(array_values(array_unique($d['opponents'])))
        ];
    }

    // Rank sorting
    uasort($calculated, function($a, $b) {
        if ($b['score'] != $a['score']) return $b['score'] <=> $a['score'];
        if ($b['buchholz'] != $a['buchholz']) return $b['buchholz'] <=> $a['buchholz'];
        if ($b['sonneborn_berger'] != $a['sonneborn_berger']) return $b['sonneborn_berger'] <=> $a['sonneborn_berger'];
        return 0;
    });

    $rank = 1;
    $updStmt = $pdo->prepare("
        UPDATE tournament_participants
        SET score = :score, buchholz = :buchholz, sonneborn_berger = :sb,
            `rank` = :rk, streak = :streak, color_history = :ch, opponents_played = :opp
        WHERE tournament_id = :tid AND student_id = :sid
    ");

    foreach ($calculated as $sid => $item) {
        $updStmt->execute([
            'score' => $item['score'],
            'buchholz' => $item['buchholz'],
            'sb' => $item['sonneborn_berger'],
            'rk' => $rank++,
            'streak' => $item['streak'],
            'ch' => $item['color_history'],
            'opp' => $item['opponents'],
            'tid' => $tournamentId,
            'sid' => $sid
        ]);
    }
}

try {
    // ---------------------------------------------------------
    // 1. GET: Fetch Tournaments or Specific Tournament Details
    // ---------------------------------------------------------
    if ($method === 'GET') {
        // Tournament Details & Live Standings
        if ($action === 'tournament_detail') {
            $tournamentId = $_GET['id'] ?? 'tourn-01';
            $selectedRound = isset($_GET['round']) ? (int)$_GET['round'] : null;

            // Tournament record
            $tStmt = $pdo->prepare("
                SELECT t.*, b.name AS batch_name, a.name AS academy_name
                FROM tournaments t
                LEFT JOIN batches b ON t.batch_id = b.id
                LEFT JOIN academies a ON t.academy_id = a.id
                WHERE t.id = :id
            ");
            $tStmt->execute(['id' => $tournamentId]);
            $tournament = $tStmt->fetch();

            if (!$tournament) {
                http_response_code(404);
                echo json_encode(['status' => 'error', 'message' => 'Tournament not found']);
                exit;
            }

            $currentRound = (int)$tournament['current_round'];
            $roundToFetch = $selectedRound ?: $currentRound;

            // Participants Standings
            $pStmt = $pdo->prepare("
                SELECT tp.*, s.name, s.avatar_emoji, s.fide_id, s.rating
                FROM tournament_participants tp
                JOIN students s ON tp.student_id = s.id
                WHERE tp.tournament_id = :tid
                ORDER BY tp.rank ASC, tp.score DESC, tp.buchholz DESC, s.rating DESC
            ");
            $pStmt->execute(['tid' => $tournamentId]);
            $participants = $pStmt->fetchAll();

            // Matches for selected round
            $mStmt = $pdo->prepare("
                SELECT tm.*, 
                       sw.name AS white_name, sw.avatar_emoji AS white_avatar, sw.rating AS white_rating,
                       sb.name AS black_name, sb.avatar_emoji AS black_avatar, sb.rating AS black_rating
                FROM tournament_matches tm
                JOIN students sw ON tm.white_student_id = sw.id
                LEFT JOIN students sb ON tm.black_student_id = sb.id
                WHERE tm.tournament_id = :tid AND tm.round_number = :rnd
                ORDER BY tm.table_number ASC
            ");
            $mStmt->execute(['tid' => $tournamentId, 'rnd' => $roundToFetch]);
            $matches = $mStmt->fetchAll();

            // Distinct rounds completed/available
            $rStmt = $pdo->prepare("SELECT DISTINCT round_number FROM tournament_matches WHERE tournament_id = :tid ORDER BY round_number ASC");
            $rStmt->execute(['tid' => $tournamentId]);
            $rounds = $rStmt->fetchAll(PDO::FETCH_COLUMN);

            echo json_encode([
                'status' => 'success',
                'tournament' => $tournament,
                'standings' => $participants,
                'matches' => $matches,
                'selected_round' => $roundToFetch,
                'available_rounds' => $rounds
            ]);
            exit;
        }

        // List all tournaments
        $academyId = $currentUser['academy_id'] ?? 'acad-001';
        $sql = "
            SELECT t.*, b.name AS batch_name,
                   (SELECT COUNT(*) FROM tournament_participants WHERE tournament_id = t.id) AS participant_count
            FROM tournaments t
            LEFT JOIN batches b ON t.batch_id = b.id
            WHERE 1=1
        ";
        $params = [];
        if ($currentUser['role'] !== 'saas_owner' && !empty($academyId)) {
            $sql .= " AND t.academy_id = :aid";
            $params['aid'] = $academyId;
        }
        $sql .= " ORDER BY t.created_at DESC";

        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        $tournaments = $stmt->fetchAll();

        echo json_encode([
            'status' => 'success',
            'tournaments' => $tournaments
        ]);
        exit;
    }

    // ---------------------------------------------------------
    // 2. POST: Record Match Result, Advance Round, Create Tournament
    // ---------------------------------------------------------
    if ($method === 'POST') {
        $input = json_decode(file_get_contents('php://input'), true);

        // Action A: Record Match Result
        if ($action === 'record_result') {
            $matchId = $input['match_id'] ?? '';
            $result = $input['result'] ?? ''; // '1-0', '0-1', '1/2-1/2'

            if (!in_array($result, ['1-0', '0-1', '1/2-1/2', '1-0F', '0-1F', 'pending'])) {
                http_response_code(400);
                echo json_encode(['status' => 'error', 'message' => 'Invalid match result']);
                exit;
            }

            // Get match
            $mStmt = $pdo->prepare("SELECT * FROM tournament_matches WHERE id = :id");
            $mStmt->execute(['id' => $matchId]);
            $match = $mStmt->fetch();

            if (!$match) {
                http_response_code(404);
                echo json_encode(['status' => 'error', 'message' => 'Match not found']);
                exit;
            }

            $playedAt = ($result !== 'pending') ? date('Y-m-d H:i:s') : null;
            $upd = $pdo->prepare("UPDATE tournament_matches SET result = :res, played_at = :pa WHERE id = :id");
            $upd->execute(['res' => $result, 'pa' => $playedAt, 'id' => $matchId]);

            // Recalculate standings, Buchholz, and Sonneborn-Berger
            recalculate_standings($pdo, $match['tournament_id']);

            echo json_encode([
                'status' => 'success',
                'message' => "Table #{$match['table_number']} result recorded as {$result}",
                'match_id' => $matchId,
                'result' => $result
            ]);
            exit;
        }

        // Action B: Advance to Next Round (FIDE Swiss Pairing Algorithm)
        if ($action === 'next_round') {
            $tournamentId = $input['tournament_id'] ?? '';
            if (empty($tournamentId)) {
                http_response_code(400);
                echo json_encode(['status' => 'error', 'message' => 'Tournament ID is required']);
                exit;
            }

            $tStmt = $pdo->prepare("SELECT * FROM tournaments WHERE id = :id");
            $tStmt->execute(['id' => $tournamentId]);
            $tourn = $tStmt->fetch();

            if (!$tourn) {
                http_response_code(404);
                echo json_encode(['status' => 'error', 'message' => 'Tournament not found']);
                exit;
            }

            $currentRound = (int)$tourn['current_round'];
            $totalRounds = (int)$tourn['total_rounds'];

            // Check if all matches in current round are completed
            $pendingStmt = $pdo->prepare("
                SELECT COUNT(*) FROM tournament_matches 
                WHERE tournament_id = :tid AND round_number = :rnd AND result = 'pending'
            ");
            $pendingStmt->execute(['tid' => $tournamentId, 'rnd' => $currentRound]);
            $pendingCount = (int)$pendingStmt->fetchColumn();

            if ($pendingCount > 0) {
                http_response_code(400);
                echo json_encode([
                    'status' => 'error',
                    'message' => "Cannot advance: {$pendingCount} matches in Round {$currentRound} are still pending result."
                ]);
                exit;
            }

            // If we reached the final round, conclude tournament
            if ($currentRound >= $totalRounds) {
                $compStmt = $pdo->prepare("UPDATE tournaments SET status = 'completed' WHERE id = :id");
                $compStmt->execute(['id' => $tournamentId]);

                echo json_encode([
                    'status' => 'success',
                    'message' => "Tournament has finished all {$totalRounds} rounds! Final standings crowned.",
                    'completed' => true
                ]);
                exit;
            }

            $nextRound = $currentRound + 1;

            // Run FIDE Swiss Pairing for $nextRound
            // Fetch participants ordered by score DESC, then rating DESC
            $pQuery = $pdo->prepare("
                SELECT tp.*, s.rating
                FROM tournament_participants tp
                JOIN students s ON tp.student_id = s.id
                WHERE tp.tournament_id = :tid
                ORDER BY tp.score DESC, s.rating DESC
            ");
            $pQuery->execute(['tid' => $tournamentId]);
            $players = $pQuery->fetchAll();

            $unpaired = $players;
            $pairings = [];
            $tableNum = 1;

            while (count($unpaired) > 1) {
                $p1 = array_shift($unpaired);
                $p1Opponents = json_decode($p1['opponents_played'] ?? '[]', true) ?: [];

                // Find candidate opponent: same score or nearest score, not played yet
                $chosenIdx = -1;
                foreach ($unpaired as $idx => $cand) {
                    if (!in_array($cand['student_id'], $p1Opponents)) {
                        $chosenIdx = $idx;
                        break;
                    }
                }

                // If everyone has been played (rare in Swiss), pick first available
                if ($chosenIdx === -1) {
                    $chosenIdx = 0;
                }

                $p2 = $unpaired[$chosenIdx];
                array_splice($unpaired, $chosenIdx, 1);

                // Color assignment: balance White vs Black
                $p1Whites = substr_count($p1['color_history'], 'W');
                $p1Blacks = substr_count($p1['color_history'], 'B');
                $p2Whites = substr_count($p2['color_history'], 'W');
                $p2Blacks = substr_count($p2['color_history'], 'B');

                $whiteId = $p1['student_id'];
                $blackId = $p2['student_id'];

                if ($p1Whites > $p1Blacks && $p2Whites <= $p2Blacks) {
                    $whiteId = $p2['student_id'];
                    $blackId = $p1['student_id'];
                }

                $pairings[] = [
                    'id' => generate_uuid(),
                    'tournament_id' => $tournamentId,
                    'round_number' => $nextRound,
                    'table_number' => $tableNum++,
                    'white_student_id' => $whiteId,
                    'black_student_id' => $blackId,
                    'result' => 'pending'
                ];
            }

            // If odd number, last player gets a 1-0 bye
            if (count($unpaired) === 1) {
                $byePlayer = array_shift($unpaired);
                $pairings[] = [
                    'id' => generate_uuid(),
                    'tournament_id' => $tournamentId,
                    'round_number' => $nextRound,
                    'table_number' => $tableNum++,
                    'white_student_id' => $byePlayer['student_id'],
                    'black_student_id' => null,
                    'result' => '1-0' // automatic full point bye
                ];
            }

            // Insert new pairings
            $insMatch = $pdo->prepare("
                INSERT INTO tournament_matches (id, tournament_id, round_number, table_number, white_student_id, black_student_id, result)
                VALUES (:id, :tid, :rnd, :tbl, :w, :b, :res)
            ");

            foreach ($pairings as $pr) {
                $insMatch->execute([
                    'id' => $pr['id'],
                    'tid' => $pr['tournament_id'],
                    'rnd' => $pr['round_number'],
                    'tbl' => $pr['table_number'],
                    'w' => $pr['white_student_id'],
                    'b' => $pr['black_student_id'],
                    'res' => $pr['result']
                ]);
            }

            // Update tournament current_round
            $updTourn = $pdo->prepare("UPDATE tournaments SET current_round = :rnd WHERE id = :id");
            $updTourn->execute(['rnd' => $nextRound, 'id' => $tournamentId]);

            // Re-sync standings
            recalculate_standings($pdo, $tournamentId);

            echo json_encode([
                'status' => 'success',
                'message' => "Generated Swiss pairings for Round {$nextRound} across " . count($pairings) . " boards!",
                'new_round' => $nextRound,
                'pairings_count' => count($pairings)
            ]);
            exit;
        }

        // Action C: Create New Tournament
        if ($action === 'create') {
            $title = trim($input['title'] ?? 'Academy Rapid Tournament');
            $format = $input['format'] ?? 'swiss';
            $timeControl = $input['time_control'] ?? '10m + 5s Rapid';
            $totalRounds = (int)($input['total_rounds'] ?? 5);
            $batchId = $input['batch_id'] ?? 'batch-01';
            $academyId = $currentUser['academy_id'] ?? 'acad-001';
            $selectedStudents = $input['student_ids'] ?? [];

            // If no specific students provided, enroll all active students from batch
            if (empty($selectedStudents)) {
                $stStmt = $pdo->prepare("SELECT id FROM students WHERE batch_id = :b AND status = 'active'");
                $stStmt->execute(['b' => $batchId]);
                $selectedStudents = $stStmt->fetchAll(PDO::FETCH_COLUMN);
            }

            if (count($selectedStudents) < 2) {
                http_response_code(400);
                echo json_encode(['status' => 'error', 'message' => 'At least 2 participating players are required']);
                exit;
            }

            $tournId = generate_uuid();

            // 1. Insert tournament
            $insTourn = $pdo->prepare("
                INSERT INTO tournaments (id, academy_id, batch_id, title, format, time_control, total_rounds, current_round, status, created_by, scheduled_at)
                VALUES (:id, :aid, :bid, :title, :fmt, :tc, :rounds, 1, 'in_progress', :uid, NOW())
            ");
            $insTourn->execute([
                'id' => $tournId,
                'aid' => $academyId,
                'bid' => $batchId,
                'title' => $title,
                'fmt' => $format,
                'tc' => $timeControl,
                'rounds' => $totalRounds,
                'uid' => $currentUser['id']
            ]);

            // 2. Insert participants
            $insPart = $pdo->prepare("
                INSERT INTO tournament_participants (id, tournament_id, student_id, score, buchholz, sonneborn_berger, rank, streak, performance_rating)
                VALUES (:id, :tid, :sid, 0.0, 0.0, 0.0, :rk, 0, 1400)
            ");
            $rk = 1;
            foreach ($selectedStudents as $sid) {
                $insPart->execute([
                    'id' => generate_uuid(),
                    'tid' => $tournId,
                    'sid' => $sid,
                    'rk' => $rk++
                ]);
            }

            // 3. Generate Round 1 Pairings (FIDE standard: Top half vs Bottom half)
            // Fetch participants sorted by rating
            $sortStmt = $pdo->prepare("
                SELECT tp.student_id, s.rating 
                FROM tournament_participants tp
                JOIN students s ON tp.student_id = s.id
                WHERE tp.tournament_id = :tid
                ORDER BY s.rating DESC
            ");
            $sortStmt->execute(['tid' => $tournId]);
            $seeded = $sortStmt->fetchAll();

            $n = count($seeded);
            $half = (int)ceil($n / 2);
            $topHalf = array_slice($seeded, 0, $half);
            $bottomHalf = array_slice($seeded, $half);

            $insMatch = $pdo->prepare("
                INSERT INTO tournament_matches (id, tournament_id, round_number, table_number, white_student_id, black_student_id, result)
                VALUES (:id, :tid, 1, :tbl, :w, :b, :res)
            ");

            $tbl = 1;
            for ($i = 0; $i < $half; $i++) {
                $p1 = $topHalf[$i]['student_id'];
                $p2 = isset($bottomHalf[$i]) ? $bottomHalf[$i]['student_id'] : null;

                // Alternate colors across tables
                $white = ($i % 2 === 0) ? $p1 : $p2;
                $black = ($i % 2 === 0) ? $p2 : $p1;
                $res = ($black === null) ? '1-0' : 'pending';

                if ($white === null) {
                    $white = $black;
                    $black = null;
                    $res = '1-0';
                }

                $insMatch->execute([
                    'id' => generate_uuid(),
                    'tid' => $tournId,
                    'tbl' => $tbl++,
                    'w' => $white,
                    'b' => $black,
                    'res' => $res
                ]);
            }

            echo json_encode([
                'status' => 'success',
                'message' => "Tournament '{$title}' created with {$n} players and Round 1 pairings generated!",
                'tournament_id' => $tournId
            ]);
            exit;
        }

        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Invalid action']);
        exit;
    }

    http_response_code(405);
    echo json_encode(['status' => 'error', 'message' => 'Method not allowed']);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
