-- =========================================================
-- Chess Play SaaS Platform Database Schema (MySQL 8.0+)
-- Database: u586022648_chessplay
-- =========================================================

SET FOREIGN_KEY_CHECKS = 0;

-- 1. Academies Table (Tenants)
DROP TABLE IF EXISTS `academies`;
CREATE TABLE `academies` (
  `id` VARCHAR(36) PRIMARY KEY,
  `name` VARCHAR(150) NOT NULL,
  `slug` VARCHAR(100) UNIQUE NOT NULL,
  `plan_tier` ENUM('starter', 'pro', 'enterprise') DEFAULT 'pro',
  `logo_url` VARCHAR(255) NULL,
  `primary_color` VARCHAR(20) DEFAULT '#f97316',
  `whatsapp_number` VARCHAR(30) NULL,
  `status` ENUM('active', 'trial', 'suspended') DEFAULT 'active',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Users Table (RBAC Identities)
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` VARCHAR(36) PRIMARY KEY,
  `email` VARCHAR(150) UNIQUE NOT NULL,
  `password_hash` VARCHAR(255) NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `role` ENUM('saas_owner', 'academy_admin', 'head_coach', 'assistant_coach', 'student', 'parent') NOT NULL,
  `academy_id` VARCHAR(36) NULL,
  `avatar_emoji` VARCHAR(10) DEFAULT '♟️',
  `phone` VARCHAR(30) NULL,
  `is_active` BOOLEAN DEFAULT TRUE,
  `last_login_at` TIMESTAMP NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`academy_id`) REFERENCES `academies`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Batches / Classes Table
DROP TABLE IF EXISTS `batches`;
CREATE TABLE `batches` (
  `id` VARCHAR(36) PRIMARY KEY,
  `academy_id` VARCHAR(36) NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `skill_level` ENUM('beginner', 'intermediate', 'advanced', 'master') DEFAULT 'intermediate',
  `head_coach_id` VARCHAR(36) NOT NULL,
  `assistant_coach_id` VARCHAR(36) NULL,
  `schedule_days` VARCHAR(100) DEFAULT 'Mon, Wed, Fri',
  `schedule_time` VARCHAR(50) DEFAULT '5:00 PM - 6:30 PM',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`academy_id`) REFERENCES `academies`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`head_coach_id`) REFERENCES `users`(`id`),
  FOREIGN KEY (`assistant_coach_id`) REFERENCES `users`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Students Table
DROP TABLE IF EXISTS `students`;
CREATE TABLE `students` (
  `id` VARCHAR(36) PRIMARY KEY,
  `academy_id` VARCHAR(36) NOT NULL,
  `batch_id` VARCHAR(36) NULL,
  `user_id` VARCHAR(36) NULL,
  `name` VARCHAR(100) NOT NULL,
  `rating` INT DEFAULT 1200,
  `parent_name` VARCHAR(100) NULL,
  `parent_email` VARCHAR(150) NULL,
  `parent_whatsapp` VARCHAR(30) NULL,
  `attendance_pct` DECIMAL(5,2) DEFAULT 95.0,
  `homework_score_pct` DECIMAL(5,2) DEFAULT 90.0,
  `coach_notes` TEXT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`academy_id`) REFERENCES `academies`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`batch_id`) REFERENCES `batches`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Homework Assignments
DROP TABLE IF EXISTS `homework_assignments`;
CREATE TABLE `homework_assignments` (
  `id` VARCHAR(36) PRIMARY KEY,
  `academy_id` VARCHAR(36) NOT NULL,
  `batch_id` VARCHAR(36) NOT NULL,
  `created_by_coach_id` VARCHAR(36) NOT NULL,
  `title` VARCHAR(150) NOT NULL,
  `fen` VARCHAR(150) NOT NULL,
  `solution_san` VARCHAR(50) NOT NULL,
  `due_date` DATE NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`academy_id`) REFERENCES `academies`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`batch_id`) REFERENCES `batches`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`created_by_coach_id`) REFERENCES `users`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Insert Seed Data with Demo Accounts
INSERT INTO `academies` (`id`, `name`, `slug`, `plan_tier`, `primary_color`, `whatsapp_number`, `status`) VALUES
('acad-001', 'Achiever\'s Chess Academy', 'achievers', 'pro', '#f97316', '+919876543210', 'active'),
('acad-002', 'KnightSquad Club', 'knightsquad', 'enterprise', '#3b82f6', '+919876543211', 'active');

-- Password hashes use bcrypt in production; demo accounts seeded:
INSERT INTO `users` (`id`, `email`, `password_hash`, `name`, `role`, `academy_id`, `avatar_emoji`) VALUES
-- 1. SaaS Owner (Platform Superadmin)
('usr-owner', 'owner@chessplay.in', '$2a$12$eXampleHashedPasswordForOwner2026', 'Platform Owner (You)', 'saas_owner', NULL, '👑'),

-- 2. Academy Admin
('usr-admin', 'admin@achieverschess.com', '$2a$12$eXampleHashedPasswordForAdmin2026', 'Rajesh Kumar', 'academy_admin', 'acad-001', '🏛️'),

-- 3. Head Coach
('usr-headcoach', 'headcoach@achieverschess.com', '$2a$12$eXampleHashedPasswordForCoach2026', 'GM Vikram Sen', 'head_coach', 'acad-001', '👨‍🏫'),

-- 4. Assistant Coach
('usr-asstcoach', 'assistant@achieverschess.com', '$2a$12$eXampleHashedPasswordForAsst2026', 'Pooja Sharma', 'assistant_coach', 'acad-001', '🧑‍🏫');

-- Seed Sample Batches
INSERT INTO `batches` (`id`, `academy_id`, `name`, `skill_level`, `head_coach_id`, `assistant_coach_id`) VALUES
('batch-01', 'acad-001', 'Batch Alpha (1400 - 1800 ELO)', 'advanced', 'usr-headcoach', 'usr-asstcoach'),
('batch-02', 'acad-001', 'Beginner Masters (800 - 1200 ELO)', 'beginner', 'usr-headcoach', 'usr-asstcoach');

-- Seed Sample Students
INSERT INTO `students` (`id`, `academy_id`, `batch_id`, `name`, `rating`, `parent_name`, `parent_whatsapp`, `attendance_pct`, `homework_score_pct`, `coach_notes`) VALUES
('st-1', 'acad-001', 'batch-01', 'Aarav Sharma', 1640, 'Mrs. Sharma', '+919811122233', 96.0, 94.0, 'Excellent understanding of central levers. Working on rook endgames.'),
('st-2', 'acad-001', 'batch-01', 'Diya Patel', 1580, 'Mr. Patel', '+919822233344', 92.0, 88.0, 'Sharp attacking instincts in Sicilian Najdorf. Improving king safety.'),
('st-3', 'acad-001', 'batch-01', 'Rohan Iyer', 1520, 'Dr. Iyer', '+919833344455', 88.0, 85.0, 'Good positional fundamentals. Doing extra drills on piece pins.');

SET FOREIGN_KEY_CHECKS = 1;
