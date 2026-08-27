<?php
// backend/api/listings.php
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../utils/helpers.php';

$action = $_GET['action'] ?? '';

if ($action === 'create') {
    $input = get_json_input();
    $donor_id = $input['donor_id'] ?? null;
    $item_name = trim($input['item_name'] ?? '');
    $category = $input['category'] ?? '';
    $qty = $input['qty'] ?? null;
    $expiry_date = $input['expiry_date'] ?? '';
    $orig_price = $input['orig_price'] ?? null;
    $image_url = $input['image_url'] ?? null;

    if (!$donor_id || !$item_name || !$category || !$qty || !$expiry_date || !$orig_price) {
        send_error("INVALID_INPUT", "Missing required fields", 400);
    }

    // Auto-calc discount using donor's discount_rules based on days left
    $days_left = (strtotime($expiry_date) - strtotime(date('Y-m-d'))) / 86400;
    $rule_stmt = $pdo->prepare("SELECT discount_percent FROM discount_rules WHERE donor_id = ? AND days_threshold >= ? ORDER BY days_threshold ASC LIMIT 1");
    $rule_stmt->execute([$donor_id, $days_left]);
    $rule = $rule_stmt->fetch();
    $discount_percent = $rule ? $rule['discount_percent'] : 0;
    $discount_price = round($orig_price * (1 - $discount_percent / 100), 2);

    $stmt = $pdo->prepare("INSERT INTO listings (donor_id, item_name, category, qty, expiry_date, orig_price, discount_price, image_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
    $stmt->execute([$donor_id, $item_name, $category, $qty, $expiry_date, $orig_price, $discount_price, $image_url]);

    send_success(["listing_id" => $pdo->lastInsertId(), "discount_price" => $discount_price], "Listing created");

} elseif ($action === 'browse') {
    $stmt = $pdo->query("SELECT id, item_name, category, qty, expiry_date, orig_price, discount_price, image_url, status FROM listings WHERE status = 'available' ORDER BY expiry_date ASC");
    send_success($stmt->fetchAll());

} elseif ($action === 'my_listings') {
    $donor_id = $_GET['donor_id'] ?? null;
    if (!$donor_id) send_error("INVALID_INPUT", "donor_id required", 400);
    $stmt = $pdo->prepare("SELECT * FROM listings WHERE donor_id = ? ORDER BY created_at DESC");
    $stmt->execute([$donor_id]);
    send_success($stmt->fetchAll());

} else {
    send_error("INVALID_ACTION", "Unknown action", 400);
}