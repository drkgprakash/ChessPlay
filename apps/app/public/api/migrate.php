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
            "whatsapp_number VARCHAR(30) NULL"
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
            "last_login_at TIMESTAMP NULL"
        ];
        foreach ($userCols as $colDef) {
            try {
                $pdo->exec("ALTER TABLE users ADD COLUMN {$colDef}");
            } catch (Exception $e) {
                // Column already exists
            }
        }

        // Seed Academies
        $pdo->exec("
        INSERT INTO academies (id, name, slug, plan_tier, primary_color, whatsapp_number, status)
        VALUES 
        ('acad-001', 'Achiever\'s Chess Academy', 'achievers', 'pro', '#f97316', '+919876543210', 'active'),
        ('acad-002', 'KnightSquad Club', 'knightsquad', 'enterprise', '#3b82f6', '+919876543211', 'active')
        ON DUPLICATE KEY UPDATE name = VALUES(name), plan_tier = VALUES(plan_tier);
        ");

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

        echo json_encode([
            'status' => 'success',
            'message' => "Successfully seeded {$seededCount} secured user accounts with bcrypt hashes",
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
