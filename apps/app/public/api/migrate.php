<?php
require_once __DIR__ . '/db.php';

if (!$pdo) {
    echo json_encode(['status' => 'error', 'message' => 'Database connection failed']);
    exit;
}

// Auto-run migration if requested or if tables do not exist
$action = $_GET['action'] ?? '';

if ($action === 'migrate') {
    try {
        $sql = file_get_contents(__DIR__ . '/../../../../deploy/schema.sql');
        if (!$sql) {
            // Embedded fallback schema
            $sql = "
            CREATE TABLE IF NOT EXISTS academies (
                id VARCHAR(36) PRIMARY KEY,
                name VARCHAR(150) NOT NULL,
                slug VARCHAR(100) UNIQUE NOT NULL,
                plan_tier ENUM('starter', 'pro', 'enterprise') DEFAULT 'pro',
                status ENUM('active', 'trial', 'suspended') DEFAULT 'active',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
            CREATE TABLE IF NOT EXISTS users (
                id VARCHAR(36) PRIMARY KEY,
                email VARCHAR(150) UNIQUE NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                name VARCHAR(100) NOT NULL,
                role ENUM('saas_owner', 'academy_admin', 'head_coach', 'assistant_coach', 'student', 'parent') NOT NULL,
                academy_id VARCHAR(36) NULL,
                avatar_emoji VARCHAR(10) DEFAULT '♟️',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
            ";
        }
        $pdo->exec($sql);
        echo json_encode(['status' => 'success', 'message' => 'Database schema migrated successfully!']);
    } catch (Exception $e) {
        echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
    }
    exit;
}

echo json_encode(['status' => 'ok', 'database' => $db_name, 'connected' => true]);
