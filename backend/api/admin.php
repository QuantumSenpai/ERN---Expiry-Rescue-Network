<?php


require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../utils/helpers.php';


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

} else {
    send_error("INVALID_ACTION", "Unrecognized admin action: {$action}", 400);
}