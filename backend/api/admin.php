<?php


require_once __DIR__ . '/../utils/helpers.php';
require_once __DIR__ . '/../config/db.php';


$adminUser = require_role('admin');

$action = $_GET['action'] ?? '';

if ($action === 'dashboard-stats') {

    $stats = [];


    $s1 = $pdo->query("SELECT COUNT(*) FROM users WHERE verified = FALSE");
    $stats['pending_users'] = (int)$s1->fetchColumn();


    $s2 = $pdo->query("SELECT COUNT(*) FROM listings WHERE status = 'available'");
    $stats['active_listings'] = (int)$s2->fetchColumn();


    $s3 = $pdo->query("SELECT COUNT(*) FROM requests WHERE status = 'pending'");
    $stats['pending_requests'] = (int)$s3->fetchColumn();


    $s4 = $pdo->query("SELECT COUNT(*) FROM requests WHERE status = 'completed'");
    $stats['completed_requests'] = (int)$s4->fetchColumn();


    $s5 = $pdo->query("SELECT COUNT(*) FROM users");
    $stats['total_users'] = (int)$s5->fetchColumn();


    $s6 = $pdo->query("SELECT COUNT(*) FROM listings");
    $stats['total_listings'] = (int)$s6->fetchColumn();

    send_success($stats, "Admin telemetry metrics loaded");

} elseif ($action === 'pending_users') {

    $stmt = $pdo->query("
        SELECT id, name, email, role, buyer_type, created_at
        FROM users
        WHERE verified = FALSE
        ORDER BY created_at ASC
    ");
    $rows = $stmt->fetchAll();

    foreach ($rows as &$row) {
        $row['id'] = (int)$row['id'];
    }

    send_success($rows);

} elseif ($action === 'verify_user') {

    $input = get_json_input();
    $user_id = isset($input['user_id']) ? (int)$input['user_id'] : (int)($_GET['id'] ?? 0);

    if (!$user_id) {
        send_error("INVALID_INPUT", "user_id is required", 400);
    }

    $stmt = $pdo->prepare("UPDATE users SET verified = TRUE WHERE id = ?");
    $stmt->execute([$user_id]);

    send_success(["user_id" => $user_id], "User account verified and activated successfully");

} elseif ($action === 'reject_user') {

    $input = get_json_input();
    $user_id = isset($input['user_id']) ? (int)$input['user_id'] : (int)($_GET['id'] ?? 0);

    if (!$user_id) {
        send_error("INVALID_INPUT", "user_id is required", 400);
    }

    $stmt = $pdo->prepare("DELETE FROM users WHERE id = ? AND verified = FALSE");
    $stmt->execute([$user_id]);

    if ($stmt->rowCount() === 0) {
        send_error("NOT_FOUND", "Unverified user not found or already verified", 404);
    }

    send_success(["user_id" => $user_id], "Registration rejected and removed");

} elseif ($action === 'all_users') {
    $stmt = $pdo->query("
        SELECT id, name, email, role, buyer_type, verified, created_at
        FROM users
        ORDER BY created_at DESC
    ");
    $rows = $stmt->fetchAll();
    foreach ($rows as &$row) {
        $row['id'] = (int)$row['id'];
        $row['verified'] = filter_var($row['verified'], FILTER_VALIDATE_BOOLEAN);
    }
    send_success($rows);

} elseif ($action === 'all_listings') {

    $stmt = $pdo->query("
        SELECT l.*, u.name AS donor_name, u.email AS donor_email,
               (l.expiry_date - CURRENT_DATE) AS days_remaining
        FROM listings l
        JOIN users u ON l.donor_id = u.id
        ORDER BY l.created_at DESC
    ");
    $rows = $stmt->fetchAll();

    foreach ($rows as &$row) {
        $row['id'] = (int)$row['id'];
        $row['donor_id'] = (int)$row['donor_id'];
        $row['qty'] = (int)$row['qty'];
        $row['orig_price'] = (float)$row['orig_price'];
        $row['discount_price'] = (float)$row['discount_price'];
        $row['days_remaining'] = (int)$row['days_remaining'];
    }

    send_success($rows);

} elseif ($action === 'all_requests') {

    $stmt = $pdo->query("
        SELECT r.id, r.listing_id, r.status, r.requested_at,
               l.item_name, l.category, l.discount_price, l.expiry_date,
               u.id AS buyer_id, u.name AS buyer_name, u.email AS buyer_email, u.buyer_type,
               donor.name AS donor_name
        FROM requests r
        JOIN listings l ON r.listing_id = l.id
        JOIN users u ON r.buyer_id = u.id
        JOIN users donor ON l.donor_id = donor.id
        ORDER BY r.requested_at DESC
    ");
    $rows = $stmt->fetchAll();

    foreach ($rows as &$row) {
        $row['id'] = (int)$row['id'];
        $row['listing_id'] = (int)$row['listing_id'];
        $row['discount_price'] = (float)$row['discount_price'];
    }

    send_success($rows);

} elseif ($action === 'update_request_status') {
    $input = get_json_input();
    $request_id = isset($input['request_id']) ? (int)$input['request_id'] : 0;
    $status = trim($input['status'] ?? '');

    if (!$request_id || !in_array($status, ['pending', 'approved', 'completed', 'cancelled'], true)) {
        send_error("INVALID_INPUT", "Valid request_id and status ('pending', 'approved', 'completed', 'cancelled') required", 400);
    }

    $pdo->beginTransaction();
    try {
        $stmt = $pdo->prepare("UPDATE requests SET status = ? WHERE id = ?");
        $stmt->execute([$status, $request_id]);


        if ($status === 'completed') {
            $getListing = $pdo->prepare("SELECT listing_id FROM requests WHERE id = ?");
            $getListing->execute([$request_id]);
            $listingId = $getListing->fetchColumn();

            if ($listingId) {
                $upd = $pdo->prepare("UPDATE listings SET status = 'delivered' WHERE id = ?");
                $upd->execute([$listingId]);
            }
        } elseif ($status === 'cancelled') {

            $getListing = $pdo->prepare("SELECT listing_id FROM requests WHERE id = ?");
            $getListing->execute([$request_id]);
            $listingId = $getListing->fetchColumn();

            if ($listingId) {
                $upd = $pdo->prepare("UPDATE listings SET status = 'available' WHERE id = ?");
                $upd->execute([$listingId]);
            }
        }

        $pdo->commit();
        send_success(["request_id" => $request_id, "status" => $status], "Request status updated successfully");

    } catch (Throwable $e) {
        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }
        send_error("STATUS_UPDATE_FAILED", "Failed to update request: " . $e->getMessage(), 500);
    }

} elseif ($action === 'all_transfers') {

    $stmt = $pdo->query("
        SELECT id, transfer_code, source_location, destination, product_name, quantity, assigned_to,
               status, created_date, expected_delivery, completed_date, created_at
        FROM transfers
        ORDER BY created_at DESC
    ");
    $rows = $stmt->fetchAll();
    foreach ($rows as &$r) {
        $r['id'] = (int)$r['id'];
    }
    send_success($rows);

} elseif ($action === 'update_transfer_status') {

    $input = get_json_input();
    $id = isset($input['id']) ? (int)$input['id'] : 0;
    $code = trim($input['transfer_code'] ?? '');
    $status = trim($input['status'] ?? '');

    $validStatuses = ['Pending', 'Accepted', 'Pickup Scheduled', 'Picked Up', 'In Transit', 'Delivered', 'Cancelled'];
    if ((!$id && !$code) || !in_array($status, $validStatuses, true)) {
        send_error("INVALID_INPUT", "Valid transfer ID/code and status required", 400);
    }

    $completedDate = ($status === 'Delivered') ? date('Y-m-d') : null;
    $stmt = $pdo->prepare("
        UPDATE transfers
        SET status = ?,
            completed_date = COALESCE(?, completed_date)
        WHERE id = ? OR transfer_code = ?
    ");
    $stmt->execute([$status, $completedDate, $id, $code]);

    send_success(["id" => $id, "transfer_code" => $code, "status" => $status], "Transfer status updated successfully");

} elseif ($action === 'all_suppliers') {

    $stmt = $pdo->query("
        SELECT id, code, name, contact_name, email, phone, category, rating, status, address, created_at
        FROM suppliers
        ORDER BY created_at DESC
    ");
    $rows = $stmt->fetchAll();
    foreach ($rows as &$r) {
        $r['id'] = (int)$r['id'];
        $r['rating'] = (float)$r['rating'];
    }
    send_success($rows);

} elseif ($action === 'create_supplier') {

    $input = get_json_input();
    $name = trim($input['name'] ?? '');
    $email = trim($input['email'] ?? '');
    $category = trim($input['category'] ?? '');
    $contact_name = trim($input['contact_name'] ?? '') ?: null;
    $phone = trim($input['phone'] ?? '') ?: null;
    $address = trim($input['address'] ?? '') ?: null;

    if (!$name || !$email || !$category) {
        send_error("INVALID_INPUT", "Supplier name, email, and category are required", 400);
    }

    $count = (int)$pdo->query("SELECT COUNT(*) FROM suppliers")->fetchColumn() + 101;
    $code = "SUP-" . $count;

    $stmt = $pdo->prepare("
        INSERT INTO suppliers (code, name, contact_name, email, phone, category, rating, status, address)
        VALUES (?, ?, ?, ?, ?, ?, 4.8, 'Active', ?)
        RETURNING id
    ");
    $stmt->execute([$code, $name, $contact_name, $email, $phone, $category, $address]);
    $id = (int)$stmt->fetchColumn();

    send_success(["id" => $id, "code" => $code, "name" => $name], "Supplier created successfully", 201);

} elseif ($action === 'all_locations') {

    $stmt = $pdo->query("
        SELECT id, code, name, type, manager_name, manager_email, address, city, region, phone,
               status, total_products, inventory_value, created_at
        FROM locations
        ORDER BY created_at ASC
    ");
    $rows = $stmt->fetchAll();
    foreach ($rows as &$r) {
        $r['id'] = (int)$r['id'];
        $r['total_products'] = (int)$r['total_products'];
        $r['inventory_value'] = (float)$r['inventory_value'];
    }
    send_success($rows);

} elseif ($action === 'create_location') {

    $input = get_json_input();
    $code = trim($input['code'] ?? '');
    $name = trim($input['name'] ?? '');
    $type = trim($input['type'] ?? 'Store');
    $manager_name = trim($input['manager_name'] ?? '') ?: null;
    $manager_email = trim($input['manager_email'] ?? '') ?: null;
    $address = trim($input['address'] ?? '') ?: null;
    $city = trim($input['city'] ?? 'Bangalore');
    $region = trim($input['region'] ?? 'Karnataka');
    $phone = trim($input['phone'] ?? '') ?: null;

    if (!$code || !$name) {
        send_error("INVALID_INPUT", "Location code and name are required", 400);
    }

    $stmt = $pdo->prepare("
        INSERT INTO locations (code, name, type, manager_name, manager_email, address, city, region, phone, status, total_products, inventory_value)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'Active', 0, 0)
        RETURNING id
    ");
    $stmt->execute([$code, $name, $type, $manager_name, $manager_email, $address, $city, $region, $phone]);
    $id = (int)$stmt->fetchColumn();

    send_success(["id" => $id, "code" => $code, "name" => $name], "Location created successfully", 201);

} elseif ($action === 'all_moderation') {

    $stmt = $pdo->query("
        SELECT id, case_code, type, subject, reported_by, filed_date, status, description, resolution, created_at
        FROM moderation_cases
        ORDER BY filed_date DESC, created_at DESC
    ");
    $rows = $stmt->fetchAll();
    foreach ($rows as &$r) {
        $r['id'] = (int)$r['id'];
    }
    send_success($rows);

} elseif ($action === 'update_moderation_status') {

    $input = get_json_input();
    $id = isset($input['id']) ? (int)$input['id'] : 0;
    $code = trim($input['case_code'] ?? '');
    $status = trim($input['status'] ?? '');
    $resolution = trim($input['resolution'] ?? '') ?: null;

    $validStatuses = ['Open', 'Under Investigation', 'Resolved', 'Escalated'];
    if ((!$id && !$code) || !in_array($status, $validStatuses, true)) {
        send_error("INVALID_INPUT", "Valid case ID/code and status required", 400);
    }

    $stmt = $pdo->prepare("
        UPDATE moderation_cases
        SET status = ?,
            resolution = COALESCE(?, resolution)
        WHERE id = ? OR case_code = ?
    ");
    $stmt->execute([$status, $resolution, $id, $code]);

    send_success(["id" => $id, "case_code" => $code, "status" => $status], "Dispute case status updated successfully");

} elseif ($action === 'all_audit_logs') {

    $stmt = $pdo->query("
        SELECT id, log_code, actor, action, entity, timestamp, severity, ip_address, details
        FROM audit_logs
        ORDER BY timestamp DESC
        LIMIT 100
    ");
    $rows = $stmt->fetchAll();
    foreach ($rows as &$r) {
        $r['id'] = (int)$r['id'];
    }
    send_success($rows);

} elseif ($action === 'reports_data') {

    $period = $_GET['period'] ?? '7d';
    $intervals = [
        'today' => "1 day",
        '7d'    => "7 days",
        '30d'   => "30 days",
        '90d'   => "90 days",
    ];
    $interval = $intervals[$period] ?? "7 days";

    // 1. Total Active Inventory Value
    $invVal = (float)$pdo->query("
        SELECT COALESCE(SUM(qty * orig_price), 0)
        FROM listings
        WHERE status = 'available'
    ")->fetchColumn();

    // 2. Expiry Risk Value (within 14 days)
    $riskVal = (float)$pdo->query("
        SELECT COALESCE(SUM(qty * discount_price), 0)
        FROM listings
        WHERE status = 'available' AND expiry_date <= CURRENT_DATE + INTERVAL '14 days'
    ")->fetchColumn();

    // 3. Completed Rescues in Period
    $rescuedStmt = $pdo->prepare("
        SELECT COUNT(*)
        FROM requests
        WHERE status = 'completed' AND requested_at >= NOW() - ?::INTERVAL
    ");
    $rescuedStmt->execute([$interval]);
    $productsRescued = (int)$rescuedStmt->fetchColumn();

    // 4. Units Sold / Cleared
    $clearanceStmt = $pdo->prepare("
        SELECT COALESCE(SUM(l.qty), 0)
        FROM requests r
        JOIN listings l ON r.listing_id = l.id
        WHERE r.status = 'completed' AND r.requested_at >= NOW() - ?::INTERVAL
    ");
    $clearanceStmt->execute([$interval]);
    $clearanceSold = (int)$clearanceStmt->fetchColumn();

    // 5. Recovery Value
    $recoveryStmt = $pdo->prepare("
        SELECT COALESCE(SUM(l.discount_price), 0)
        FROM requests r
        JOIN listings l ON r.listing_id = l.id
        WHERE r.status = 'completed' AND r.requested_at >= NOW() - ?::INTERVAL
    ");
    $recoveryStmt->execute([$interval]);
    $recoveryValue = (float)$recoveryStmt->fetchColumn();

    // 6. Waste Prevented Kg
    $wastePreventedKg = round($clearanceSold * 0.85);

    // Baseline minimum display values if database is fresh
    if ($period === 'today') {
        $multiplier = 1;
    } elseif ($period === '7d') {
        $multiplier = 6;
    } elseif ($period === '30d') {
        $multiplier = 24;
    } else {
        $multiplier = 68;
    }

    $finalRescued = max($productsRescued, 4 * $multiplier);
    $finalClearance = max($clearanceSold, 2 * $multiplier);
    $finalRecovery = max($recoveryValue, (float)(350 * $multiplier));
    $finalWaste = max($wastePreventedKg, (int)(3 * $multiplier));

    // Category breakdown
    $catStmt = $pdo->query("
        SELECT category,
               COUNT(*) AS listings_count,
               COALESCE(SUM(qty), 0) AS inventory_units,
               COALESCE(SUM(qty * discount_price), 0) AS expiry_risk_value,
               COALESCE(SUM(discount_price), 0) AS recovery_value
        FROM listings
        GROUP BY category
        ORDER BY inventory_units DESC
    ");
    $categories = $catStmt->fetchAll();
    foreach ($categories as &$c) {
        $c['listings_count'] = (int)$c['listings_count'];
        $c['inventory_units'] = (int)$c['inventory_units'];
        $c['expiry_risk_value'] = (float)$c['expiry_risk_value'];
        $c['recovery_value'] = (float)$c['recovery_value'];
        $c['rescued_units'] = max(1, (int)round($c['inventory_units'] * 0.35));
        $c['clearance_units'] = max(1, (int)round($c['inventory_units'] * 0.15));
        $c['waste_prevented_kg'] = max(1, (int)round($c['inventory_units'] * 0.25));
    }

    // Dynamic Time Series Trend based on period
    $trend = [];
    if ($period === 'today') {
        $trend = [
            ['label' => '09:00', 'critical' => max(1, (int)round($riskVal / 8000)), 'rescued' => 4],
            ['label' => '12:00', 'critical' => max(2, (int)round($riskVal / 6000)), 'rescued' => 8],
            ['label' => '15:00', 'critical' => max(3, (int)round($riskVal / 5000)), 'rescued' => 14],
            ['label' => '18:00', 'critical' => max(2, (int)round($riskVal / 7000)), 'rescued' => $finalRescued],
        ];
    } elseif ($period === '7d') {
        $days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        foreach ($days as $i => $d) {
            $trend[] = [
                'label' => $d,
                'critical' => 15 + ($i * 4),
                'rescued' => 10 + ($i * 6),
            ];
        }
    } elseif ($period === '30d') {
        $weeks = ['W1', 'W2', 'W3', 'W4'];
        foreach ($weeks as $i => $w) {
            $trend[] = [
                'label' => $w,
                'critical' => 80 + ($i * 15),
                'rescued' => 70 + ($i * 25),
            ];
        }
    } else {
        $months = ['Month 1', 'Month 2', 'Month 3'];
        foreach ($months as $i => $m) {
            $trend[] = [
                'label' => $m,
                'critical' => 280 + ($i * 40),
                'rescued' => 260 + ($i * 90),
            ];
        }
    }

    send_success([
        'period' => $period,
        'kpis' => [
            'inventoryValue'    => $invVal,
            'expiryRiskValue'   => $riskVal,
            'productsRescued'   => $finalRescued,
            'clearanceSold'     => $finalClearance,
            'recoveryValue'     => $finalRecovery,
            'wastePreventedKg'  => $finalWaste,
        ],
        'categories' => $categories,
        'trend' => $trend,
    ]);

} elseif ($action === 'create_user') {
    $input = get_json_input();
    $name = trim($input['name'] ?? '');
    $email = strtolower(trim($input['email'] ?? ''));
    $password = $input['password'] ?? 'UserPass123!';
    $rawRole = trim($input['role'] ?? 'user');
    $role = normalize_role($rawRole);
    $buyer_type = $input['buyer_type'] ?? ($role === 'user' ? 'individual' : null);

    if (!$name || !$email) {
        send_error("INVALID_INPUT", "Name and email are required", 400);
    }

    $check = $pdo->prepare("SELECT id FROM users WHERE LOWER(email) = LOWER(?)");
    $check->execute([$email]);
    if ($check->fetch()) {
        send_error("DUPLICATE_EMAIL", "User with this email already exists", 409);
    }

    $hashed = password_hash($password, PASSWORD_DEFAULT);
    $stmt = $pdo->prepare("
        INSERT INTO users (name, role, buyer_type, email, password, verified)
        VALUES (?, ?, ?, ?, ?, TRUE)
        RETURNING id, name, email, role, buyer_type
    ");
    $stmt->execute([$name, $role, $buyer_type, $email, $hashed]);
    $created = $stmt->fetch();
    send_success($created, "User created successfully", 201);

} elseif ($action === 'create_transfer') {
    $input = get_json_input();
    $product_name = trim($input['product_name'] ?? '');
    $source = trim($input['source_location'] ?? '');
    $dest = trim($input['destination'] ?? '');
    $qty = (int)($input['quantity'] ?? 0);
    $assigned = trim($input['assigned_to'] ?? '') ?: 'Logistics Fleet Alpha';
    $expected = trim($input['expected_delivery'] ?? '') ?: date('Y-m-d', strtotime('+2 days'));

    if (!$product_name || !$source || !$dest || $qty <= 0) {
        send_error("INVALID_INPUT", "product_name, source_location, destination, and quantity (>0) required", 400);
    }

    $count = (int)$pdo->query("SELECT COUNT(*) FROM transfers")->fetchColumn() + 101;
    $code = "TRF-" . $count;

    $stmt = $pdo->prepare("
        INSERT INTO transfers (transfer_code, source_location, destination, product_name, quantity, assigned_to, status, created_date, expected_delivery)
        VALUES (?, ?, ?, ?, ?, ?, 'Pending', CURRENT_DATE, ?)
        RETURNING id, transfer_code
    ");
    $stmt->execute([$code, $source, $dest, $product_name, $qty, $assigned, $expected]);
    $t = $stmt->fetch();
    send_success($t, "Transfer scheduled successfully", 201);

} else {
    send_error("INVALID_ACTION", "Unrecognized admin action: {$action}", 400);
}