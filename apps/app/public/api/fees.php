<?php
// =========================================================
// Chess Play Student Fee Billing & Invoicing REST API
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

// Self-healing schema check: Ensure student_fees table exists
try {
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

    $countStmt = $pdo->query("SELECT COUNT(*) FROM student_fees");
    if ((int)$countStmt->fetchColumn() === 0) {
        $seedStmt = $pdo->prepare("
            INSERT INTO student_fees (id, student_id, academy_id, batch_id, invoice_number, billing_period, amount, discount, tax, total_amount, due_date, paid_date, payment_method, transaction_ref, status, notes)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ");
        $seedStmt->execute(['fee-01', 'st-1', 'acad-001', 'batch-01', 'INV-2026-0901', 'September 2026', 3500.00, 0.00, 0.00, 3500.00, '2026-09-05', '2026-09-02 14:30:00', 'upi', 'UPI/624918294/HDFC', 'paid', 'Tuition fee received via GooglePay UPI']);
        $seedStmt->execute(['fee-02', 'st-2', 'acad-001', 'batch-01', 'INV-2026-0902', 'September 2026', 3500.00, 0.00, 0.00, 3500.00, '2026-09-05', '2026-09-03 11:15:00', 'netbanking', 'NEFT/92019481/ICICI', 'paid', 'Direct NEFT transfer verified by accounts']);
        $seedStmt->execute(['fee-03', 'st-3', 'acad-001', 'batch-01', 'INV-2026-0903', 'September 2026', 3500.00, 0.00, 0.00, 3500.00, '2026-09-05', '2026-09-04 16:45:00', 'upi', 'UPI/829104812/SBI', 'paid', 'PhonePe UPI transfer received']);
        $seedStmt->execute(['fee-04', 'st-4', 'acad-001', 'batch-01', 'INV-2026-0904', 'September 2026', 3500.00, 0.00, 0.00, 3500.00, '2026-09-10', NULL, NULL, NULL, 'pending', 'Invoice sent to parent WhatsApp. Due Sep 10.']);
        $seedStmt->execute(['fee-05', 'st-5', 'acad-001', 'batch-01', 'INV-2026-0905', 'September 2026', 3500.00, 0.00, 0.00, 3500.00, '2026-09-01', NULL, NULL, NULL, 'overdue', 'Due date elapsed. WhatsApp fee reminder pending.']);
        $seedStmt->execute(['fee-06', 'st-6', 'acad-001', 'batch-01', 'INV-2026-0906', 'September 2026', 3500.00, 0.00, 0.00, 3500.00, '2026-09-05', '2026-09-01 18:00:00', 'cash', 'REC-CASH-081', 'paid', 'Cash deposited at academy desk receipt #81']);
    }
} catch (Exception $e) {
    // Ignore migration exception
}

try {
    // ---------------------------------------------------------
    // 1. GET: Fetch Fee Ledger or Invoice Details
    // ---------------------------------------------------------
    if ($method === 'GET') {
        // Detailed invoice view for PDF / print
        if ($action === 'invoice_detail') {
            $feeId = $_GET['id'] ?? '';
            if (empty($feeId)) {
                http_response_code(400);
                echo json_encode(['status' => 'error', 'message' => 'Missing invoice fee id']);
                exit;
            }

            $stmt = $pdo->prepare("
                SELECT f.*,
                       s.name AS student_name, s.avatar_emoji, s.fide_id, s.email AS student_email, s.phone AS student_phone,
                       s.parent_name, s.parent_phone, s.parent_email, s.rating,
                       b.name AS batch_name, b.schedule AS batch_schedule, b.level AS batch_level,
                       a.name AS academy_name, a.contact_email AS academy_email, a.whatsapp_number AS academy_whatsapp,
                       a.primary_color, a.admin_name AS academy_director
                FROM student_fees f
                JOIN students s ON f.student_id = s.id
                LEFT JOIN batches b ON f.batch_id = b.id
                LEFT JOIN academies a ON f.academy_id = a.id
                WHERE f.id = :id LIMIT 1
            ");
            $stmt->execute(['id' => $feeId]);
            $invoice = $stmt->fetch();

            if (!$invoice) {
                http_response_code(404);
                echo json_encode(['status' => 'error', 'message' => 'Invoice not found']);
                exit;
            }

            echo json_encode([
                'status' => 'success',
                'invoice' => $invoice
            ]);
            exit;
        }

        // List Fee Ledger
        $batchFilter = $_GET['batch_id'] ?? '';
        $statusFilter = $_GET['status'] ?? '';
        $search = trim($_GET['search'] ?? '');
        $period = trim($_GET['period'] ?? 'September 2026');

        $academyId = $currentUser['academy_id'] ?? 'acad-001';
        $params = [];

        $sql = "
            SELECT f.*, 
                   s.name AS student_name, s.avatar_emoji, s.fide_id, s.phone AS student_phone,
                   s.parent_name, s.parent_phone, s.parent_email, s.rating,
                   b.name AS batch_name, b.level AS batch_level
            FROM student_fees f
            JOIN students s ON f.student_id = s.id
            LEFT JOIN batches b ON f.batch_id = b.id
            WHERE 1=1
        ";

        if ($currentUser['role'] !== 'saas_owner' && !empty($academyId)) {
            $sql .= " AND f.academy_id = :academy_id";
            $params['academy_id'] = $academyId;
        }

        if (!empty($period)) {
            $sql .= " AND f.billing_period = :period";
            $params['period'] = $period;
        }

        if (!empty($batchFilter)) {
            $sql .= " AND f.batch_id = :batch_id";
            $params['batch_id'] = $batchFilter;
        }

        if (!empty($statusFilter) && $statusFilter !== 'all') {
            $sql .= " AND f.status = :status";
            $params['status'] = $statusFilter;
        }

        if (!empty($search)) {
            $sql .= " AND (LOWER(s.name) LIKE :q OR LOWER(s.parent_name) LIKE :q OR LOWER(f.invoice_number) LIKE :q OR LOWER(f.transaction_ref) LIKE :q)";
            $params['q'] = '%' . strtolower($search) . '%';
        }

        $sql .= " ORDER BY f.status ASC, f.due_date ASC";

        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        $fees = $stmt->fetchAll();

        // Calculate Analytics Metrics
        $totalBilled = 0;
        $totalCollected = 0;
        $totalPending = 0;
        $paidCount = 0;
        $pendingCount = 0;
        $overdueCount = 0;

        foreach ($fees as $fee) {
            $amt = (float)$fee['total_amount'];
            $totalBilled += $amt;
            if ($fee['status'] === 'paid') {
                $totalCollected += $amt;
                $paidCount++;
            } elseif ($fee['status'] === 'overdue') {
                $totalPending += $amt;
                $overdueCount++;
            } elseif ($fee['status'] === 'pending') {
                $totalPending += $amt;
                $pendingCount++;
            }
        }

        $totalCount = count($fees);
        $collectionRate = $totalBilled > 0 ? round(($totalCollected / $totalBilled) * 100, 1) : 0;

        echo json_encode([
            'status' => 'success',
            'fees' => $fees,
            'metrics' => [
                'total_billed' => $totalBilled,
                'total_collected' => $totalCollected,
                'total_pending' => $totalPending,
                'paid_count' => $paidCount,
                'pending_count' => $pendingCount,
                'overdue_count' => $overdueCount,
                'total_invoices' => $totalCount,
                'collection_rate' => $collectionRate
            ]
        ]);
        exit;
    }

    // ---------------------------------------------------------
    // 2. POST: Update Payment or Create Invoice
    // ---------------------------------------------------------
    if ($method === 'POST') {
        $raw = file_get_contents('php://input');
        $data = json_decode($raw, true) ?: $_POST;

        // Action: Update Payment Status
        if ($action === 'update_payment') {
            $feeId = $data['id'] ?? '';
            $status = $data['status'] ?? 'paid';
            $paymentMethod = $data['payment_method'] ?? null;
            $transactionRef = trim($data['transaction_ref'] ?? '');
            $notes = trim($data['notes'] ?? '');

            if (empty($feeId)) {
                http_response_code(400);
                echo json_encode(['status' => 'error', 'message' => 'Missing fee record id']);
                exit;
            }

            $paidDate = ($status === 'paid') ? date('Y-m-d H:i:s') : null;

            $updateStmt = $pdo->prepare("
                UPDATE student_fees 
                SET status = :status,
                    payment_method = :method,
                    transaction_ref = :ref,
                    paid_date = :paid_date,
                    notes = :notes,
                    updated_at = NOW()
                WHERE id = :id
            ");

            $updateStmt->execute([
                'id' => $feeId,
                'status' => $status,
                'method' => $paymentMethod,
                'ref' => $transactionRef ?: null,
                'paid_date' => $paidDate,
                'notes' => $notes ?: null
            ]);

            echo json_encode([
                'status' => 'success',
                'message' => 'Payment status updated successfully'
            ]);
            exit;
        }

        // Action: Create New Invoice
        if ($action === 'create_invoice') {
            $studentId = $data['student_id'] ?? '';
            $batchId = $data['batch_id'] ?? '';
            $amount = (float)($data['amount'] ?? 3500.00);
            $dueDate = $data['due_date'] ?? date('Y-m-d', strtotime('+7 days'));
            $billingPeriod = $data['billing_period'] ?? date('F Y');
            $notes = $data['notes'] ?? '';

            if (empty($studentId)) {
                http_response_code(400);
                echo json_encode(['status' => 'error', 'message' => 'Student ID is required']);
                exit;
            }

            // Find student academy & batch if missing
            $stdStmt = $pdo->prepare("SELECT academy_id, batch_id FROM students WHERE id = :id LIMIT 1");
            $stdStmt->execute(['id' => $studentId]);
            $std = $stdStmt->fetch();

            if (!$std) {
                http_response_code(404);
                echo json_encode(['status' => 'error', 'message' => 'Student not found']);
                exit;
            }

            $academyId = $std['academy_id'];
            if (empty($batchId)) $batchId = $std['batch_id'];

            $newId = 'fee-' . substr(generate_uuid(), 0, 8);
            $invoiceNumber = 'INV-' . date('Y-m') . '-' . mt_rand(1000, 9999);

            $insStmt = $pdo->prepare("
                INSERT INTO student_fees (id, student_id, academy_id, batch_id, invoice_number, billing_period, amount, discount, tax, total_amount, due_date, status, notes)
                VALUES (:id, :student_id, :academy_id, :batch_id, :inv_num, :period, :amount, 0, 0, :total, :due, 'pending', :notes)
            ");

            $insStmt->execute([
                'id' => $newId,
                'student_id' => $studentId,
                'academy_id' => $academyId,
                'batch_id' => $batchId,
                'inv_num' => $invoiceNumber,
                'period' => $billingPeriod,
                'amount' => $amount,
                'total' => $amount,
                'due' => $dueDate,
                'notes' => $notes ?: null
            ]);

            echo json_encode([
                'status' => 'success',
                'message' => 'Invoice created successfully',
                'fee_id' => $newId,
                'invoice_number' => $invoiceNumber
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
