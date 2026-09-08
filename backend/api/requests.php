<?php


require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../utils/helpers.php';

$action = $_GET['action'] ?? '';

if ($action === 'claim') {

    $user = require_role(['buyer', 'customer']);
    $input = get_json_input();
    $listing_id = isset($input['listing_id']) ? (int)$input['listing_id'] : 0;

    if (!$listing_id) {
        send_error("INVALID_INPUT", "listing_id is required", 400);
    }

    $stmt = $pdo->prepare("SELECT id, status, item_name, donor_id FROM listings WHERE id = ?");
    $stmt->execute([$listing_id]);
    $listing = $stmt->fetch();

    if (!$listing) {
        send_error("NOT_FOUND", "Listing not found", 404);
    }

    if ($listing['status'] !== 'available') {
        send_error("ALREADY_CLAIMED", "This lot is no longer available for rescue", 409);
    }


    if ((int)$listing['donor_id'] === (int)$user['id']) {
        send_error("FORBIDDEN", "Donors cannot claim their own rescue listings", 403);
    }

    $pdo->beginTransaction();
    try {
        $insert = $pdo->prepare("
            INSERT INTO requests (listing_id, buyer_id, status, requested_at)
            VALUES (?, ?, 'pending', NOW())
            RETURNING id
        ");
        $insert->execute([$listing_id, $user['id']]);
        $request_id = (int)$insert->fetchColumn();

        $update = $pdo->prepare("UPDATE listings SET status = 'claimed' WHERE id = ?");
        $update->execute([$listing_id]);

        $pdo->commit();

        send_success([
            "request_id" => $request_id,
            "listing_id" => $listing_id,
            "status"     => "pending"
        ], "Rescue claim initiated. Pending fulfillment confirmation.", 201);

    } catch (Throwable $e) {
        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }
        send_error("CLAIM_FAILED", "Could not complete claim: " . $e->getMessage(), 500);
    }

} elseif ($action === 'my_requests') {

    $user = require_role(['buyer', 'customer']);

    $stmt = $pdo->prepare("
        SELECT r.id, r.listing_id, r.status, r.requested_at,
               l.item_name, l.category, l.expiry_date, l.orig_price, l.discount_price,
               l.image_url, l.status AS listing_status,
               u.name AS donor_name,
               (l.expiry_date - CURRENT_DATE) AS days_remaining
        FROM requests r
        JOIN listings l ON r.listing_id = l.id
        JOIN users u ON l.donor_id = u.id
        WHERE r.buyer_id = ?
        ORDER BY r.requested_at DESC
    ");
    $stmt->execute([$user['id']]);
    $rows = $stmt->fetchAll();

    foreach ($rows as &$row) {
        $row['id'] = (int)$row['id'];
        $row['listing_id'] = (int)$row['listing_id'];
        $row['orig_price'] = (float)$row['orig_price'];
        $row['discount_price'] = (float)$row['discount_price'];
        $row['days_remaining'] = (int)$row['days_remaining'];
    }

    send_success($rows);

} elseif ($action === 'incoming') {

    $user = require_role(['donor', 'retailer']);

    $stmt = $pdo->prepare("
        SELECT r.id, r.listing_id, r.status, r.requested_at,
               l.item_name, l.category, l.qty, l.expiry_date, l.discount_price,
               u.id AS buyer_id, u.name AS buyer_name, u.email AS buyer_email, u.buyer_type
        FROM requests r
        JOIN listings l ON r.listing_id = l.id
        JOIN users u ON r.buyer_id = u.id
        WHERE l.donor_id = ?
        ORDER BY r.requested_at DESC
    ");
    $stmt->execute([$user['id']]);
    $rows = $stmt->fetchAll();

    foreach ($rows as &$row) {
        $row['id'] = (int)$row['id'];
        $row['listing_id'] = (int)$row['listing_id'];
        $row['qty'] = (int)$row['qty'];
        $row['discount_price'] = (float)$row['discount_price'];
    }

    send_success($rows);

} elseif ($action === 'cancel') {

    $user = require_role(['buyer', 'customer']);
    $input = get_json_input();
    $request_id = isset($input['request_id']) ? (int)$input['request_id'] : (int)($_GET['id'] ?? 0);

    if (!$request_id) {
        send_error("INVALID_INPUT", "request_id is required", 400);
    }

    $stmt = $pdo->prepare("SELECT id, listing_id, buyer_id, status FROM requests WHERE id = ?");
    $stmt->execute([$request_id]);
    $req = $stmt->fetch();

    if (!$req) {
        send_error("NOT_FOUND", "Request not found", 404);
    }

    if ((int)$req['buyer_id'] !== (int)$user['id'] && $user['role'] !== 'admin') {
        send_error("FORBIDDEN", "You can only cancel your own requests", 403);
    }

    if ($req['status'] !== 'pending') {
        send_error("CANNOT_CANCEL", "Only pending requests can be cancelled (current status: {$req['status']})", 409);
    }

    $pdo->beginTransaction();
    try {

        $updateReq = $pdo->prepare("UPDATE requests SET status = 'cancelled' WHERE id = ?");
        $updateReq->execute([$request_id]);


        $updateListing = $pdo->prepare("UPDATE listings SET status = 'available' WHERE id = ?");
        $updateListing->execute([$req['listing_id']]);

        $pdo->commit();
        send_success(["request_id" => $request_id], "Request cancelled and listing released back to available");

    } catch (Throwable $e) {
        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }
        send_error("CANCEL_FAILED", "Failed to cancel request: " . $e->getMessage(), 500);
    }

} else {
    send_error("INVALID_ACTION", "Unrecognized requests action: {$action}", 400);
}