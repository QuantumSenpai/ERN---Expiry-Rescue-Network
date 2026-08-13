<?php
// backend/api/requests.php
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../utils/helpers.php';

$action = $_GET['action'] ?? '';

if ($action === 'claim') {
    $input = get_json_input();
    $listing_id = $input['listing_id'] ?? null;
    $buyer_id = $input['buyer_id'] ?? null;

    if (!$listing_id || !$buyer_id) {
        send_error("INVALID_INPUT", "listing_id and buyer_id required", 400);
    }

    $stmt = $pdo->prepare("SELECT status FROM listings WHERE id = ?");
    $stmt->execute([$listing_id]);
    $listing = $stmt->fetch();

    if (!$listing) {
        send_error("NOT_FOUND", "Listing not found", 404);
    }
    if ($listing['status'] !== 'available') {
        send_error("ALREADY_CLAIMED", "This listing is no longer available", 409);
    }

    $pdo->beginTransaction();
    try {
        $insert = $pdo->prepare("INSERT INTO requests (listing_id, buyer_id) VALUES (?, ?)");
        $insert->execute([$listing_id, $buyer_id]);
        $request_id = $pdo->lastInsertId();

        $update = $pdo->prepare("UPDATE listings SET status = 'claimed' WHERE id = ?");
        $update->execute([$listing_id]);

        $pdo->commit();
    } catch (Exception $e) {
        $pdo->rollBack();
        send_error("CLAIM_FAILED", "Could not claim listing, please try again", 500);
    }

    send_success(["request_id" => $request_id], "Listing claimed, pending admin confirmation");

} elseif ($action === 'my_requests') {
    $buyer_id = $_GET['buyer_id'] ?? null;
    if (!$buyer_id) send_error("INVALID_INPUT", "buyer_id required", 400);

    $stmt = $pdo->prepare("
        SELECT r.id, r.status, r.requested_at,
               l.item_name, l.category, l.expiry_date, l.discount_price, l.image_url
        FROM requests r
        JOIN listings l ON r.listing_id = l.id
        WHERE r.buyer_id = ?
        ORDER BY r.requested_at DESC
    ");
    $stmt->execute([$buyer_id]);
    send_success($stmt->fetchAll());

} elseif ($action === 'incoming') {
    // Requests made against listings posted by a specific donor
    $donor_id = $_GET['donor_id'] ?? null;
    if (!$donor_id) send_error("INVALID_INPUT", "donor_id required", 400);

    $stmt = $pdo->prepare("
        SELECT r.id, r.status, r.requested_at,
               l.item_name, u.name AS buyer_name, u.buyer_type
        FROM requests r
        JOIN listings l ON r.listing_id = l.id
        JOIN users u ON r.buyer_id = u.id
        WHERE l.donor_id = ?
        ORDER BY r.requested_at DESC
    ");
    $stmt->execute([$donor_id]);
    send_success($stmt->fetchAll());

} else {
    send_error("INVALID_ACTION", "Unknown action", 400);
}