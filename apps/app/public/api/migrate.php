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
            ],
            [
                'id' => 'usr-student-01',
                'email' => 'student@achieverschess.com',
                'password' => 'StudentPass#2026',
                'name' => 'Aarav Sharma',
                'role' => 'student',
                'academy_id' => 'acad-001',
                'avatar' => '👦'
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
            ['sb-2', 'session-01', 'st-2', 'Diya Patel', '👧', '6k1/5ppp/8/8/8/5Q2/4NPPP/2r3K1 w - - 0 1', 'cxd4', '-0.8', 'blunder', 0],
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

        // 4. Interactive Homework & Drills Schema
        $pdo->exec("
        CREATE TABLE IF NOT EXISTS homework_assignments (
            id VARCHAR(36) PRIMARY KEY,
            academy_id VARCHAR(36) NOT NULL,
            batch_id VARCHAR(36) NOT NULL,
            created_by VARCHAR(36) NOT NULL,
            title VARCHAR(150) NOT NULL,
            description TEXT NULL,
            due_date DATE NULL,
            difficulty ENUM('Beginner', 'Intermediate', 'Advanced', 'Master') DEFAULT 'Intermediate',
            status ENUM('active', 'archived') DEFAULT 'active',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

        CREATE TABLE IF NOT EXISTS homework_drills (
            id VARCHAR(36) PRIMARY KEY,
            assignment_id VARCHAR(36) NOT NULL,
            order_idx INT DEFAULT 1,
            title VARCHAR(150) NOT NULL,
            theme VARCHAR(80) DEFAULT 'Tactics',
            fen VARCHAR(150) NOT NULL,
            initial_turn ENUM('w', 'b') DEFAULT 'w',
            solution_moves JSON NOT NULL,
            hint_piece VARCHAR(255) NULL,
            hint_square VARCHAR(255) NULL,
            hint_solution VARCHAR(255) NULL,
            explanation TEXT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

        CREATE TABLE IF NOT EXISTS homework_submissions (
            id VARCHAR(36) PRIMARY KEY,
            assignment_id VARCHAR(36) NOT NULL,
            student_id VARCHAR(36) NOT NULL,
            drills_completed INT DEFAULT 0,
            total_drills INT DEFAULT 1,
            score_pct INT DEFAULT 0,
            status ENUM('assigned', 'in_progress', 'completed', 'reviewed') DEFAULT 'assigned',
            attempts_json JSON NULL,
            coach_feedback TEXT NULL,
            submitted_at TIMESTAMP NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE KEY uq_assign_student (assignment_id, student_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        ");

        // Seed Homework Assignments
        $hwStmt = $pdo->prepare("
            INSERT INTO homework_assignments (id, academy_id, batch_id, created_by, title, description, due_date, difficulty, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE title = VALUES(title), description = VALUES(description), due_date = VALUES(due_date);
        ");

        $hwStmt->execute([
            'hw-01',
            'acad-001',
            'batch-01',
            'usr-headcoach',
            'Week 4: Essential Checkmate Batteries & Queen Deflections',
            'Solve these 3 tactical puzzles focusing on recognizing queen checkmates, backward guards, and the Anastasia mating net. Review each position carefully before moving.',
            date('Y-m-d', strtotime('+5 days')),
            'Intermediate',
            'active'
        ]);

        $hwStmt->execute([
            'hw-02',
            'acad-001',
            'batch-01',
            'usr-headcoach',
            'Tactical Vision: Knight Forks & Pins',
            'Mastering piece coordination and discovering royal knight tactics under pressure. Calculate all candidate moves.',
            date('Y-m-d', strtotime('+8 days')),
            'Intermediate',
            'active'
        ]);

        // Seed Drills for hw-01
        $drillStmt = $pdo->prepare("
            INSERT INTO homework_drills (id, assignment_id, order_idx, title, theme, fen, initial_turn, solution_moves, hint_piece, hint_square, hint_solution, explanation)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE title = VALUES(title), fen = VALUES(fen), solution_moves = VALUES(solution_moves);
        ");

        $drillStmt->execute([
            'hw-d-01',
            'hw-01',
            1,
            'Smothered Mate Backward Guard',
            'Checkmate Pattern',
            '6k1/5ppp/8/8/8/5Q2/4NPPP/2r3K1 w - - 0 1',
            'w',
            json_encode(['Nxc1']),
            'Look at your knight on e2.',
            'Your knight can capture the black rook on c1.',
            'Nxc1 eliminates the check and defends the king safely.',
            'The black rook was delivering back-rank checkmate, but your knight has a backward tactical defense on c1.'
        ]);

        $drillStmt->execute([
            'hw-d-02',
            'hw-01',
            2,
            'Queen & Bishop Battery Mate',
            'Mate in 1',
            'r1bqkb1r/pppp1ppp/2n5/4p3/2B1n3/5Q2/PPPP1PPP/RNB1K1NR w KQkq - 0 5',
            'w',
            json_encode(['Qxf7#']),
            'Your queen can coordinate with the bishop on c4.',
            'Attack the weak f7 square right beside Black\'s king.',
            'Qxf7# delivers an inescapable checkmate!',
            'The f7 pawn is defended only by the king in early opening moves.'
        ]);

        $drillStmt->execute([
            'hw-d-03',
            'hw-01',
            3,
            'Anastasia Mating Net & Infiltration',
            'Mating Net',
            '5rk1/1p3ppp/pq2p3/3p4/8/1P3Q2/P1r2PPP/R4RK1 w - - 0 20',
            'w',
            json_encode(['Qd3']),
            'Reposition your queen with tempo.',
            'Attack the black rook on c2.',
            'Qd3 attacks the infiltrated rook and gains control of the 3rd rank.',
            'Centralizing the queen with tempo forces Black onto defense.'
        ]);

        // Seed Drills for hw-02
        $drillStmt->execute([
            'hw-d-04',
            'hw-02',
            1,
            'Resolving the Central Pin',
            'Pin & King Safety',
            'r3k2r/pppq1ppp/3p1n2/4p3/1b2P3/2NP1N2/PPP2PPP/R1BQK2R w KQkq - 0 8',
            'w',
            json_encode(['O-O']),
            'Prioritize king safety before advancing central pieces.',
            'Castle kingside.',
            'O-O resolves the pin on your c3 knight safely.',
            'Castling eliminates tactical pin targets against your king.'
        ]);

        $drillStmt->execute([
            'hw-d-05',
            'hw-02',
            2,
            'Endgame King Activation',
            'Endgame Tactics',
            '4kb1r/p2n1ppp/4p3/1b1p4/3P4/2B1P3/PP3PPP/R3K1NR w KQk - 0 14',
            'w',
            json_encode(['Kd2']),
            'Activate your king into the center.',
            'Step to d2 to connect rooks.',
            'Kd2 connects the rooks and readies the king for central control.',
            'With queens off the board, the king transitions into an attacking weapon.'
        ]);

        // Seed Submissions for Batch Alpha Students
        $subStmt = $pdo->prepare("
            INSERT INTO homework_submissions (id, assignment_id, student_id, drills_completed, total_drills, score_pct, status, coach_feedback)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE drills_completed = VALUES(drills_completed), score_pct = VALUES(score_pct), status = VALUES(status), coach_feedback = VALUES(coach_feedback);
        ");

        $subStmt->execute(['sub-01', 'hw-01', 'st-1', 1, 3, 33, 'in_progress', null]);
        $subStmt->execute(['sub-02', 'hw-01', 'st-2', 3, 3, 100, 'completed', null]);
        $subStmt->execute(['sub-03', 'hw-01', 'st-3', 3, 3, 100, 'reviewed', 'Outstanding calculation speed and clean moves!']);
        $subStmt->execute(['sub-04', 'hw-01', 'st-4', 0, 3, 0, 'assigned', null]);
        $subStmt->execute(['sub-05', 'hw-01', 'st-5', 2, 3, 67, 'in_progress', null]);
        $subStmt->execute(['sub-06', 'hw-01', 'st-6', 3, 3, 100, 'completed', null]);

        // Ensure student st-1 has student@achieverschess.com email
        $pdo->exec("UPDATE students SET email = 'student@achieverschess.com' WHERE id = 'st-1'");

        // 5. Student Performance Report Cards Schema
        $pdo->exec("
        CREATE TABLE IF NOT EXISTS student_reports (
            id VARCHAR(36) PRIMARY KEY,
            student_id VARCHAR(36) NOT NULL,
            academy_id VARCHAR(36) NOT NULL,
            coach_id VARCHAR(36) NOT NULL,
            period_label VARCHAR(50) NOT NULL,
            rating INT NOT NULL,
            rating_change INT DEFAULT 0,
            attendance_pct INT NOT NULL,
            homework_pct INT NOT NULL,
            puzzles_solved INT NOT NULL,
            overall_grade VARCHAR(10) DEFAULT 'A',
            openings_score INT DEFAULT 85,
            tactics_score INT DEFAULT 90,
            endgames_score INT DEFAULT 82,
            time_mgmt_score INT DEFAULT 88,
            strengths TEXT NULL,
            areas_for_growth TEXT NULL,
            coach_remarks TEXT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_student_report (student_id, created_at)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        ");

        // Seed Sample Reports
        $repStmt = $pdo->prepare("
            INSERT INTO student_reports (id, student_id, academy_id, coach_id, period_label, rating, rating_change, attendance_pct, homework_pct, puzzles_solved, overall_grade, openings_score, tactics_score, endgames_score, time_mgmt_score, strengths, areas_for_growth, coach_remarks)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE 
                rating = VALUES(rating),
                rating_change = VALUES(rating_change),
                attendance_pct = VALUES(attendance_pct),
                homework_pct = VALUES(homework_pct),
                puzzles_solved = VALUES(puzzles_solved),
                overall_grade = VALUES(overall_grade),
                coach_remarks = VALUES(coach_remarks);
        ");

        $repStmt->execute([
            'rep-01',
            'st-1',
            'acad-001',
            'usr-headcoach',
            'September 2026',
            1485,
            45,
            96,
            92,
            142,
            'A+',
            88,
            95,
            86,
            90,
            'Exceptional pin recognition, rapid calculation in sharp positions, and aggressive piece development.',
            'Pawn structure evaluation in closed positions and complex rook endgame technique.',
            'Aarav is showing rapid maturity in tournament and simul games. His tactical instincts have sharpened remarkably this month!'
        ]);

        $repStmt->execute([
            'rep-02',
            'st-2',
            'acad-001',
            'usr-headcoach',
            'September 2026',
            1520,
            35,
            94,
            95,
            168,
            'A+',
            92,
            94,
            90,
            88,
            'Flawless homework completion, disciplined clock usage, and deep Sicilian defense preparation.',
            'Handling violent king hunts and managing counter-attacks along open files.',
            'Diya continues to be an exemplary student with near-perfect homework consistency. Fully primed for upcoming state Swiss events.'
        ]);

        $repStmt->execute([
            'rep-03',
            'st-3',
            'acad-001',
            'usr-headcoach',
            'September 2026',
            1610,
            60,
            98,
            96,
            195,
            'A+',
            90,
            98,
            92,
            94,
            'Mastery of bishop & queen batteries, lethal endgame conversions, and calm composure under time pressure.',
            'Exploring offbeat hypermodern flank openings.',
            'Rohan is our top performer this month. Cross-table simul results demonstrate clear Candidate Master potential!'
        ]);

        // 7. Student Fee Billing & Automated Invoicing Ledger Schema
        $pdo->exec("
        CREATE TABLE IF NOT EXISTS student_fees (
            id VARCHAR(36) PRIMARY KEY,
            student_id VARCHAR(36) NOT NULL,
            academy_id VARCHAR(36) NOT NULL,
            batch_id VARCHAR(36) NOT NULL,
            invoice_number VARCHAR(50) NOT NULL UNIQUE,
            billing_period VARCHAR(50) NOT NULL,
            amount DECIMAL(10,2) NOT NULL DEFAULT 3500.00,
            discount DECIMAL(10,2) DEFAULT 0.00,
            tax DECIMAL(10,2) DEFAULT 0.00,
            total_amount DECIMAL(10,2) NOT NULL DEFAULT 3500.00,
            due_date DATE NOT NULL,
            paid_date DATETIME NULL,
            payment_method ENUM('upi', 'netbanking', 'cash', 'card', 'cheque') NULL,
            transaction_ref VARCHAR(100) NULL,
            status ENUM('paid', 'pending', 'overdue', 'waived') DEFAULT 'pending',
            notes TEXT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            INDEX idx_student_fees (student_id, academy_id, billing_period)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        ");

        // Seed September 2026 Invoices for Batch Alpha
        $feeStmt = $pdo->prepare("
            INSERT INTO student_fees (id, student_id, academy_id, batch_id, invoice_number, billing_period, amount, discount, tax, total_amount, due_date, paid_date, payment_method, transaction_ref, status, notes)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE 
                amount = VALUES(amount),
                total_amount = VALUES(total_amount),
                status = VALUES(status),
                payment_method = VALUES(payment_method),
                transaction_ref = VALUES(transaction_ref),
                paid_date = VALUES(paid_date);
        ");

        $feeStmt->execute([
            'fee-01', 'st-1', 'acad-001', 'batch-01', 'INV-2026-0901', 'September 2026',
            3500.00, 0.00, 0.00, 3500.00, '2026-09-05', '2026-09-02 14:30:00',
            'upi', 'UPI/624918294/HDFC', 'paid', 'Tuition fee received via GooglePay UPI'
        ]);

        $feeStmt->execute([
            'fee-02', 'st-2', 'acad-001', 'batch-01', 'INV-2026-0902', 'September 2026',
            3500.00, 0.00, 0.00, 3500.00, '2026-09-05', '2026-09-03 11:15:00',
            'netbanking', 'NEFT/92019481/ICICI', 'paid', 'Direct NEFT transfer verified by accounts'
        ]);

        $feeStmt->execute([
            'fee-03', 'st-3', 'acad-001', 'batch-01', 'INV-2026-0903', 'September 2026',
            3500.00, 0.00, 0.00, 3500.00, '2026-09-05', '2026-09-04 16:45:00',
            'upi', 'UPI/829104812/SBI', 'paid', 'PhonePe UPI transfer received'
        ]);

        $feeStmt->execute([
            'fee-04', 'st-4', 'acad-001', 'batch-01', 'INV-2026-0904', 'September 2026',
            3500.00, 0.00, 0.00, 3500.00, '2026-09-10', NULL,
            NULL, NULL, 'pending', 'Invoice sent to parent WhatsApp. Due Sep 10.'
        ]);

        $feeStmt->execute([
            'fee-05', 'st-5', 'acad-001', 'batch-01', 'INV-2026-0905', 'September 2026',
            3500.00, 0.00, 0.00, 3500.00, '2026-09-01', NULL,
            NULL, NULL, 'overdue', 'Due date elapsed. WhatsApp fee reminder pending.'
        ]);

        $feeStmt->execute([
            'fee-06', 'st-6', 'acad-001', 'batch-01', 'INV-2026-0906', 'September 2026',
            3500.00, 0.00, 0.00, 3500.00, '2026-09-05', '2026-09-01 18:00:00',
            'cash', 'REC-CASH-081', 'paid', 'Cash deposited at academy desk receipt #81'
        ]);

        // 8. Student QR Attendance & Session Check-In Ledger Schema
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
        $attStmt = $pdo->prepare("
            INSERT INTO attendance_records (id, academy_id, batch_id, student_id, session_date, checkin_time, status, method, marked_by, notes)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE 
                checkin_time = VALUES(checkin_time),
                status = VALUES(status),
                method = VALUES(method),
                notes = VALUES(notes);
        ");

        $attStmt->execute(['att-01', 'acad-001', 'batch-01', 'st-1', $todayDate, '18:02:14', 'present', 'qr_scan', 'usr-headcoach', 'Digital QR scanned at door entrance']);
        $attStmt->execute(['att-02', 'acad-001', 'batch-01', 'st-2', $todayDate, '18:04:30', 'present', 'qr_scan', 'usr-headcoach', 'Digital QR scanned at door entrance']);
        $attStmt->execute(['att-03', 'acad-001', 'batch-01', 'st-3', $todayDate, '17:58:10', 'present', 'qr_scan', 'usr-headcoach', 'Early arrival, set up board 1']);
        $attStmt->execute(['att-04', 'acad-001', 'batch-01', 'st-4', $todayDate, NULL, 'excused', 'manual', 'usr-headcoach', 'Parent notified: School quarterly exams']);
        $attStmt->execute(['att-05', 'acad-001', 'batch-01', 'st-5', $todayDate, '18:18:45', 'late', 'qr_scan', 'usr-headcoach', 'Arrived 18 mins late due to rain traffic']);
        $attStmt->execute(['att-06', 'acad-001', 'batch-01', 'st-6', $todayDate, '18:01:05', 'present', 'qr_scan', 'usr-headcoach', 'Digital QR scanned at door entrance']);

        // 9. Tournament Organizer & FIDE Swiss Pairings Engine Schema
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

        // Seed Active Tournament
        $tournStmt = $pdo->prepare("
            INSERT INTO tournaments (id, academy_id, batch_id, title, format, time_control, total_rounds, current_round, status, created_by, scheduled_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE title = VALUES(title), current_round = VALUES(current_round), status = VALUES(status);
        ");
        $tournStmt->execute([
            'tourn-01', 'acad-001', 'batch-01', 'Sunday Rapid Grand Prix — September Edition',
            'swiss', '10m + 5s Rapid', 5, 3, 'in_progress', 'usr-headcoach', date('Y-m-d 10:00:00')
        ]);

        // Seed Participants
        $partStmt = $pdo->prepare("
            INSERT INTO tournament_participants (id, tournament_id, student_id, score, buchholz, sonneborn_berger, rank, streak, performance_rating, color_history, opponents_played)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE 
                score = VALUES(score),
                buchholz = VALUES(buchholz),
                sonneborn_berger = VALUES(sonneborn_berger),
                rank = VALUES(rank),
                streak = VALUES(streak),
                performance_rating = VALUES(performance_rating);
        ");

        $participants = [
            ['part-01', 'tourn-01', 'st-1', 2.5, 4.5, 3.75, 1, 2, 1780, 'W,B,W', json_encode(['st-5', 'st-2'])],
            ['part-02', 'tourn-01', 'st-2', 2.0, 4.0, 3.00, 2, 1, 1690, 'W,W,B', json_encode(['st-4', 'st-1'])],
            ['part-03', 'tourn-01', 'st-3', 2.0, 3.5, 2.50, 3, 1, 1650, 'W,B,B', json_encode(['st-6', 'st-5'])],
            ['part-04', 'tourn-01', 'st-5', 1.5, 4.0, 1.75, 4, 0, 1510, 'B,W,W', json_encode(['st-1', 'st-3'])],
            ['part-05', 'tourn-01', 'st-4', 1.0, 3.5, 1.00, 5, 0, 1420, 'B,W,B', json_encode(['st-2', 'st-6'])],
            ['part-06', 'tourn-01', 'st-6', 1.0, 3.0, 0.75, 6, 0, 1390, 'B,B,W', json_encode(['st-3', 'st-4'])]
        ];

        foreach ($participants as $p) {
            $partStmt->execute($p);
        }

        // Seed Matches for Rounds 1, 2, and 3
        $matchStmt = $pdo->prepare("
            INSERT INTO tournament_matches (id, tournament_id, round_number, table_number, white_student_id, black_student_id, result, played_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE result = VALUES(result);
        ");

        // Round 1 (Completed)
        $matchStmt->execute(['m-1-1', 'tourn-01', 1, 1, 'st-1', 'st-5', '1-0', date('Y-m-d 10:15:00')]);
        $matchStmt->execute(['m-1-2', 'tourn-01', 1, 2, 'st-2', 'st-4', '1-0', date('Y-m-d 10:15:00')]);
        $matchStmt->execute(['m-1-3', 'tourn-01', 1, 3, 'st-3', 'st-6', '1-0', date('Y-m-d 10:15:00')]);

        // Round 2 (Completed)
        $matchStmt->execute(['m-2-1', 'tourn-01', 2, 1, 'st-2', 'st-1', '1/2-1/2', date('Y-m-d 10:45:00')]);
        $matchStmt->execute(['m-2-2', 'tourn-01', 2, 2, 'st-5', 'st-3', '0-1', date('Y-m-d 10:45:00')]);
        $matchStmt->execute(['m-2-3', 'tourn-01', 2, 3, 'st-4', 'st-6', '0-1', date('Y-m-d 10:45:00')]);

        // Round 3 (In Progress / Pending results)
        $matchStmt->execute(['m-3-1', 'tourn-01', 3, 1, 'st-1', 'st-3', 'pending', NULL]);
        $matchStmt->execute(['m-3-2', 'tourn-01', 3, 2, 'st-6', 'st-2', 'pending', NULL]);
        $matchStmt->execute(['m-3-3', 'tourn-01', 3, 3, 'st-5', 'st-4', 'pending', NULL]);

        echo json_encode([
            'status' => 'success',
            'message' => "Successfully seeded {$seededCount} secured user accounts, classroom simul boards, homework curricula, student performance reports, fee billing, QR attendance, and Swiss tournament organizer",
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
