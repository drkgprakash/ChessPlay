<?php
// =========================================================
// Chess Play Database Migration & Auth Seed Endpoint
// =========================================================

require_once __DIR__ . '/db.php';
require_once __DIR__ . '/jwt.php';

if (!$pdo) {
    echo json_encode(['status' => 'error', 'message' => 'Database connection failed']);
    exit;
}

$action = $_GET['action'] ?? '';

// 1. Seed or rehash demo user credentials with real PHP bcrypt hashes
if ($action === 'seed_auth' || $action === 'migrate') {
    try {
        // Ensure tables exist
        $pdo->exec("
        CREATE TABLE IF NOT EXISTS academies (
            id VARCHAR(36) PRIMARY KEY,
            name VARCHAR(150) NOT NULL,
            slug VARCHAR(100) UNIQUE NOT NULL,
            plan_tier ENUM('starter', 'pro', 'enterprise') DEFAULT 'pro',
            logo_url VARCHAR(255) NULL,
            primary_color VARCHAR(20) DEFAULT '#f97316',
            whatsapp_number VARCHAR(30) NULL,
            status ENUM('active', 'trial', 'suspended') DEFAULT 'active',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

        CREATE TABLE IF NOT EXISTS users (
            id VARCHAR(36) PRIMARY KEY,
            email VARCHAR(150) UNIQUE NOT NULL,
            password_hash VARCHAR(255) NOT NULL,
            name VARCHAR(100) NOT NULL,
            role ENUM('saas_owner', 'academy_admin', 'head_coach', 'assistant_coach', 'student', 'parent') NOT NULL,
            academy_id VARCHAR(36) NULL,
            avatar_emoji VARCHAR(10) DEFAULT '♟️',
            phone VARCHAR(30) NULL,
            is_active BOOLEAN DEFAULT TRUE,
            last_login_at TIMESTAMP NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        ");

        // Ensure all columns exist on academies
        $cols = [
            "logo_url VARCHAR(255) NULL",
            "primary_color VARCHAR(20) DEFAULT '#f97316'",
            "whatsapp_number VARCHAR(30) NULL",
            "monthly_billing DECIMAL(10,2) DEFAULT 7999.00",
            "contact_email VARCHAR(150) NULL",
            "admin_name VARCHAR(100) NULL"
        ];
        foreach ($cols as $colDef) {
            try {
                $pdo->exec("ALTER TABLE academies ADD COLUMN {$colDef}");
            } catch (Exception $e) {
                // Column already exists
            }
        }

        // Ensure all columns exist on users
        $userCols = [
            "avatar_emoji VARCHAR(10) DEFAULT '♟️'",
            "phone VARCHAR(30) NULL",
            "is_active BOOLEAN DEFAULT TRUE",
            "last_login_at TIMESTAMP NULL",
            "fide_title VARCHAR(20) NULL",
            "rating INT DEFAULT 1500",
            "notes TEXT NULL"
        ];
        foreach ($userCols as $colDef) {
            try {
                $pdo->exec("ALTER TABLE users ADD COLUMN {$colDef}");
            } catch (Exception $e) {
                // Column already exists
            }
        }

        // Batches Table
        $pdo->exec("
        CREATE TABLE IF NOT EXISTS batches (
            id VARCHAR(36) PRIMARY KEY,
            academy_id VARCHAR(36) NOT NULL,
            name VARCHAR(100) NOT NULL,
            coach_id VARCHAR(36) NULL,
            schedule VARCHAR(100) NULL,
            level ENUM('beginner', 'intermediate', 'advanced', 'master') DEFAULT 'intermediate',
            max_students INT DEFAULT 15,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

        CREATE TABLE IF NOT EXISTS students (
            id VARCHAR(36) PRIMARY KEY,
            academy_id VARCHAR(36) NOT NULL,
            batch_id VARCHAR(36) NULL,
            name VARCHAR(100) NOT NULL,
            email VARCHAR(150) NULL,
            phone VARCHAR(30) NULL,
            rating INT DEFAULT 1200,
            fide_id VARCHAR(30) NULL,
            parent_name VARCHAR(100) NULL,
            parent_phone VARCHAR(30) NULL,
            parent_email VARCHAR(150) NULL,
            attendance_pct INT DEFAULT 92,
            puzzles_solved INT DEFAULT 0,
            homework_pct INT DEFAULT 85,
            status ENUM('active', 'inactive', 'trial', 'paused') DEFAULT 'active',
            notes TEXT NULL,
            avatar_emoji VARCHAR(10) DEFAULT '👦',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        ");

        // Seed 6 Academies
        $pdo->exec("
        INSERT INTO academies (id, name, slug, plan_tier, primary_color, whatsapp_number, monthly_billing, contact_email, admin_name, status)
        VALUES 
        ('acad-001', 'Achiever\'s Chess Academy', 'achievers', 'pro', '#f97316', '+919876543210', 7999.00, 'admin@achieverschess.com', 'Rajesh Kumar', 'active'),
        ('acad-002', 'KnightSquad Club', 'knightsquad', 'enterprise', '#3b82f6', '+919876543211', 14999.00, 'contact@knightsquad.com', 'Vikas Anand', 'active'),
        ('acad-003', 'Grandmaster Academy', 'grandmaster', 'pro', '#a855f7', '+919876543212', 7999.00, 'info@gmacademy.com', 'GM S. Rao', 'active'),
        ('acad-004', 'ChessMasters India', 'chessmasters', 'enterprise', '#10b981', '+919876543213', 14999.00, 'admin@chessmasters.in', 'Arjun Nambiar', 'active'),
        ('acad-005', 'Castle Chess School', 'castlechess', 'starter', '#f59e0b', '+919876543214', 3499.00, 'hello@castlechess.org', 'Sunita Roy', 'active'),
        ('acad-006', 'Royal Bishop Club', 'royalbishop', 'pro', '#ec4899', '+919876543215', 7999.00, 'support@royalbishop.com', 'David Miller', 'active')
        ON DUPLICATE KEY UPDATE 
            name = VALUES(name), 
            plan_tier = VALUES(plan_tier), 
            monthly_billing = VALUES(monthly_billing), 
            status = VALUES(status);
        ");


        // Seed Batches
        $pdo->exec("
        INSERT INTO batches (id, academy_id, name, coach_id, schedule, level, max_students)
        VALUES 
        ('batch-01', 'acad-001', 'Batch Alpha (1400-1800)', 'usr-headcoach', 'Mon, Wed, Fri 5:00 PM IST', 'advanced', 12),
        ('batch-02', 'acad-001', 'Master Champions (1800+)', 'usr-headcoach', 'Tue, Thu, Sat 6:30 PM IST', 'master', 10),
        ('batch-03', 'acad-001', 'Beginner Knights (800-1200)', 'usr-asstcoach', 'Sat, Sun 10:00 AM IST', 'beginner', 15)
        ON DUPLICATE KEY UPDATE name = VALUES(name), schedule = VALUES(schedule);
        ");

        // Seed Realistic Active Students for Achiever's Chess Academy
        $initialStudents = [
            ['st-1', 'acad-001', 'batch-01', 'Aarav Sharma', 'aarav.sharma@gmail.com', '+919812345671', 1640, 'FIDE-IND-2401', 'Suresh Sharma', '+919812345670', 'suresh.sharma@gmail.com', 96, 142, 94, 'active', 'Excellent understanding of central pawn levers. Working on rook and pawn endgames.', '👦'],
            ['st-2', 'acad-001', 'batch-01', 'Diya Patel', 'diya.patel@gmail.com', '+919823456782', 1580, 'FIDE-IND-2402', 'Kiran Patel', '+919823456780', 'kiran.patel@gmail.com', 92, 128, 88, 'active', 'Sharp attacking instincts in Sicilian Najdorf. Needs to tighten defensive king safety.', '👧'],
            ['st-3', 'acad-001', 'batch-01', 'Rohan Iyer', 'rohan.iyer@gmail.com', '+919834567893', 1520, 'FIDE-IND-2403', 'Venkatesh Iyer', '+919834567890', 'venkat.iyer@gmail.com', 88, 110, 85, 'active', 'Good positional instincts. Recommended more tactical puzzle drills on pins.', '🧑'],
            ['st-4', 'acad-001', 'batch-01', 'Kabir Verma', 'kabir.verma@gmail.com', '+919845678904', 1490, 'FIDE-IND-2404', 'Anil Verma', '+919845678900', 'anil.verma@gmail.com', 85, 95, 80, 'active', 'Pawn structures improving nicely. Advised to review London system theory.', '👦'],
            ['st-5', 'acad-001', 'batch-01', 'Ananya Gupta', 'ananya.gupta@gmail.com', '+919856789015', 1430, 'FIDE-IND-2405', 'Rakesh Gupta', '+919856789010', 'rakesh.gupta@gmail.com', 95, 115, 91, 'active', 'Very diligent with homework. Strong progress in middle-game planning.', '👧'],
            ['st-6', 'acad-001', 'batch-01', 'Meera Nair', 'meera.nair@gmail.com', '+919867890126', 1510, 'FIDE-IND-2406', 'Deepak Nair', '+919867890120', 'deepak.nair@gmail.com', 91, 105, 89, 'active', 'Solid tactical vision. Currently analyzing French Defense Winawer variation.', '👧']
        ];

        $stdStmt = $pdo->prepare("
            INSERT INTO students (id, academy_id, batch_id, name, email, phone, rating, fide_id, parent_name, parent_phone, parent_email, attendance_pct, puzzles_solved, homework_pct, status, notes, avatar_emoji)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE 
                name = VALUES(name),
                rating = VALUES(rating),
                batch_id = VALUES(batch_id),
                parent_phone = VALUES(parent_phone),
                notes = VALUES(notes),
                status = VALUES(status);
        ");

        foreach ($initialStudents as $st) {
            $stdStmt->execute($st);
        }


        // Demo accounts configuration
        $demoUsers = [
            [
                'id' => 'usr-owner',
                'email' => 'owner@chessplay.in',
                'password' => 'OwnerPass#2026',
                'name' => 'Platform Owner (You)',
                'role' => 'saas_owner',
                'academy_id' => null,
                'avatar' => '👑'
            ],
            [
                'id' => 'usr-admin',
                'email' => 'admin@achieverschess.com',
                'password' => 'AdminPass#2026',
                'name' => 'Rajesh Kumar',
                'role' => 'academy_admin',
                'academy_id' => 'acad-001',
                'avatar' => '🏛️'
            ],
            [
                'id' => 'usr-headcoach',
                'email' => 'headcoach@achieverschess.com',
                'password' => 'CoachPass#2026',
                'name' => 'GM Vikram Sen',
                'role' => 'head_coach',
                'academy_id' => 'acad-001',
                'avatar' => '👨‍🏫'
            ],
            [
                'id' => 'usr-asstcoach',
                'email' => 'assistant@achieverschess.com',
                'password' => 'AssistantPass#2026',
                'name' => 'Pooja Sharma',
                'role' => 'assistant_coach',
                'academy_id' => 'acad-001',
                'avatar' => '🧑‍🏫'
            ]
        ];

        $stmt = $pdo->prepare("
            INSERT INTO users (id, email, password_hash, name, role, academy_id, avatar_emoji, is_active)
            VALUES (:id, :email, :hash, :name, :role, :acad, :avatar, 1)
            ON DUPLICATE KEY UPDATE 
                password_hash = VALUES(password_hash),
                name = VALUES(name),
                role = VALUES(role),
                academy_id = VALUES(academy_id),
                avatar_emoji = VALUES(avatar_emoji),
                is_active = 1
        ");

        $seededCount = 0;
        foreach ($demoUsers as $u) {
            $hash = password_hash($u['password'], PASSWORD_BCRYPT, ['cost' => 12]);
            $stmt->execute([
                'id' => $u['id'],
                'email' => $u['email'],
                'hash' => $hash,
                'name' => $u['name'],
                'role' => $u['role'],
                'acad' => $u['academy_id'],
                'avatar' => $u['avatar']
            ]);
            $seededCount++;
        }

        // 3. Real-Time Classroom Schema
        $pdo->exec("
        CREATE TABLE IF NOT EXISTS classroom_sessions (
            id VARCHAR(36) PRIMARY KEY,
            batch_id VARCHAR(36) NOT NULL,
            academy_id VARCHAR(36) NOT NULL,
            coach_id VARCHAR(36) NOT NULL,
            title VARCHAR(150) NOT NULL DEFAULT 'Advanced Tactics & Strategy — Batch Alpha',
            master_fen VARCHAR(150) NOT NULL DEFAULT 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
            is_locked BOOLEAN DEFAULT FALSE,
            active_arrows JSON NULL,
            status ENUM('active', 'ended') DEFAULT 'active',
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

        CREATE TABLE IF NOT EXISTS classroom_events (
            id BIGINT AUTO_INCREMENT PRIMARY KEY,
            session_id VARCHAR(36) NOT NULL,
            batch_id VARCHAR(36) NOT NULL,
            user_id VARCHAR(36) NOT NULL,
            user_name VARCHAR(100) NOT NULL,
            user_role VARCHAR(30) NOT NULL,
            event_type VARCHAR(50) NOT NULL,
            payload JSON NOT NULL,
            created_at TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP(3),
            INDEX idx_batch_id (batch_id, id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

        CREATE TABLE IF NOT EXISTS student_board_states (
            id VARCHAR(36) PRIMARY KEY,
            session_id VARCHAR(36) NOT NULL,
            student_id VARCHAR(36) NOT NULL,
            student_name VARCHAR(100) NOT NULL,
            avatar VARCHAR(10) DEFAULT '♟️',
            current_fen VARCHAR(150) NOT NULL,
            last_move VARCHAR(20) NULL,
            eval_score VARCHAR(20) DEFAULT '0.0',
            status ENUM('active', 'waiting', 'solved', 'blunder') DEFAULT 'active',
            hand_raised BOOLEAN DEFAULT FALSE,
            moves_history JSON NULL,
            updated_at TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        ");

        // Seed Active Classroom Session for Batch Alpha
        $pdo->exec("
        INSERT INTO classroom_sessions (id, batch_id, academy_id, coach_id, title, master_fen, is_locked)
        VALUES ('session-01', 'batch-01', 'acad-001', 'usr-headcoach', 'Advanced Tactics & Strategy — Batch Alpha', 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1', 0)
        ON DUPLICATE KEY UPDATE title = VALUES(title);
        ");

        // Seed 6 Student Boards for Batch Alpha Simul Grid
        $students = [
            ['sb-1', 'session-01', 'st-1', 'Aarav Sharma', '👦', 'r1bqkb1r/pppp1ppp/2n5/4p3/2B1n3/5Q2/PPPP1PPP/RNB1K1NR w KQkq - 0 5', 'Qf3', '+1.4', 'active', 0],
            ['sb-2', 'session-01', 'st-2', 'Diya Patel', '👧', '6k1/5ppp/8/8/8/5Q2/4NPPP/2r3K1 w - - 0 1', 'cxd4', '-0.8', 'blunder', 1],
            ['sb-3', 'session-01', 'st-3', 'Rohan Iyer', '🧑', 'r3k2r/pppq1ppp/3p1n2/4p3/1b2P3/2NP1N2/PPP2PPP/R1BQK2R w KQkq - 0 8', 'Nf6', '+2.1', 'active', 0],
            ['sb-4', 'session-01', 'st-4', 'Ananya Gupta', '👧', 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1', 'e4', '0.0', 'waiting', 0],
            ['sb-5', 'session-01', 'st-5', 'Kabir Verma', '👦', 'rnbqkbnr/pppp1ppp/8/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R b KQkq - 1 2', 'Nf3', '+3.6', 'active', 0],
            ['sb-6', 'session-01', 'st-6', 'Meera Nair', '👧', '5rk1/1p3ppp/pq2p3/3p4/8/1P3Q2/P1r2PPP/R4RK1 w - - 0 20', 'Nf6', '-1.2', 'solved', 0]
        ];

        $sbStmt = $pdo->prepare("
            INSERT INTO student_board_states (id, session_id, student_id, student_name, avatar, current_fen, last_move, eval_score, status, hand_raised)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE 
                current_fen = VALUES(current_fen),
                last_move = VALUES(last_move),
                eval_score = VALUES(eval_score),
                status = VALUES(status),
                hand_raised = VALUES(hand_raised);
        ");

        foreach ($students as $sb) {
            $sbStmt->execute($sb);
        }

        echo json_encode([
            'status' => 'success',
            'message' => "Successfully seeded {$seededCount} secured user accounts and classroom real-time session with 6 simul boards",
            'demo_accounts' => array_map(function($u) {
                return ['email' => $u['email'], 'role' => $u['role'], 'name' => $u['name']];
            }, $demoUsers)
        ]);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
    }
    exit;
}

echo json_encode([
    'status' => 'ok',
    'database' => $db_name,
    'connected' => true,
    'actions' => [
        'migrate' => '?action=migrate',
        'seed_auth' => '?action=seed_auth'
    ]
]);
