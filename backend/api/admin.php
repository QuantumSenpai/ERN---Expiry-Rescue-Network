<?php
// backend/api/admin.php
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../utils/helpers.php';

$action = $_GET['action'] ?? '';

if ($action === 'pending_users') {
    $stmt = $pdo->query("SELECT id, name, email, role, buyer_type, created_at FROM users WHERE verified = 0 ORDER BY created_at ASC");
    send_success($stmt->fetchAll());

} elseif ($action === 'verify_user') {
    $input = get_json_input();
    $user_id = $input['user_id'] ?? null;
    if (!$user_id) send_error("INVALID_INPUT", "user_id required", 400);

    $stmt = $pdo->prepare("UPDATE users SET verified = 1 WHERE id = ?");
    $stmt->execute([$user_id]);
    send_success([], "User verified");

} elseif ($action === 'all_listings') {
    $stmt = $pdo->query("
        SELECT l.*, u.name AS donor_name
        FROM listings l
        JOIN users u ON l.donor_id = u.id
        ORDER BY l.created_at DESC
    ");
    send_success($stmt->fetchAll());

} elseif ($action === 'all_requests') {
    $stmt = $pdo->query("
        SELECT r.id, r.status, r.requested_at,
               l.item_name, u.name AS buyer_name, u.buyer_type
        FROM requests r
        JOIN listings l ON r.listing_id = l.id
        JOIN users u ON r.buyer_id = u.id
        ORDER BY r.requested_at DESC
    ");
    send_success($stmt->fetchAll());

} elseif ($action === 'update_request_status') {
    $input = get_json_input();
    $request_id = $input['request_id'] ?? null;
    $status = $input['status'] ?? '';

    if (!$request_id || !in_array($status, ['pending', 'approved', 'completed'])) {
        send_error("INVALID_INPUT", "Valid request_id and status ('pending'/'approved'/'completed') required", 400);
    }

    $stmt = $pdo->prepare("UPDATE requests SET status = ? WHERE id = ?");
    $stmt->execute([$status, $request_id]);

    // When a request is marked completed, flip the linked listing to 'delivered'
    if ($status === 'completed') {
        $get_listing = $pdo->prepare("SELECT listing_id FROM requests WHERE id = ?");
        $get_listing->execute([$request_id]);
        $r = $get_listing->fetch();
        if ($r) {
            $pdo->prepare("UPDATE listings SET status = 'delivered' WHERE id = ?")->execute([$r['listing_id']]);
        }
    }

    send_success([], "Request status updated");

} else {
    send_error("INVALID_ACTION", "Unknown action", 400);
}