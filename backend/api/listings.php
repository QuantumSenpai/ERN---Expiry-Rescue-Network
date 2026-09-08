<?php


require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../utils/helpers.php';

$action = $_GET['action'] ?? '';

if ($action === 'browse') {

    $category = $_GET['category'] ?? null;
    $search = trim($_GET['search'] ?? '');

    $sql = "
        SELECT l.id, l.donor_id, l.item_name, l.category, l.qty, l.expiry_date,
               l.orig_price, l.discount_price, l.image_url, l.status, l.created_at,
               u.name AS donor_name,
               ROUND(((l.orig_price - l.discount_price) / NULLIF(l.orig_price, 0)) * 100) AS discount_percent,
               (l.expiry_date - CURRENT_DATE) AS days_remaining
        FROM listings l
        JOIN users u ON l.donor_id = u.id
        WHERE l.status = 'available'
    ";
    $params = [];

    if ($category && $category !== 'All') {
        $sql .= " AND LOWER(l.category) = LOWER(?)";
        $params[] = $category;
    }

    if ($search !== '') {
        $sql .= " AND (LOWER(l.item_name) LIKE ? OR LOWER(u.name) LIKE ?)";
        $searchTerm = '%' . strtolower($search) . '%';
        $params[] = $searchTerm;
        $params[] = $searchTerm;
    }

    $sql .= " ORDER BY l.expiry_date ASC, l.created_at DESC";

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $rows = $stmt->fetchAll();


    foreach ($rows as &$row) {
        $row['id'] = (int)$row['id'];
        $row['donor_id'] = (int)$row['donor_id'];
        $row['qty'] = (int)$row['qty'];
        $row['orig_price'] = (float)$row['orig_price'];
        $row['discount_price'] = (float)$row['discount_price'];
        $row['discount_percent'] = (int)($row['discount_percent'] ?? 0);
        $row['days_remaining'] = (int)$row['days_remaining'];
    }

    send_success($rows);

} elseif ($action === 'get') {

    $id = $_GET['id'] ?? null;
    if (!$id) {
        send_error("INVALID_INPUT", "Listing ID is required", 400);
    }

    $stmt = $pdo->prepare("
        SELECT l.*, u.name AS donor_name, u.email AS donor_email,
               ROUND(((l.orig_price - l.discount_price) / NULLIF(l.orig_price, 0)) * 100) AS discount_percent,
               (l.expiry_date - CURRENT_DATE) AS days_remaining
        FROM listings l
        JOIN users u ON l.donor_id = u.id
        WHERE l.id = ?
    ");
    $stmt->execute([$id]);
    $listing = $stmt->fetch();

    if (!$listing) {
        send_error("NOT_FOUND", "Listing not found", 404);
    }

    $listing['id'] = (int)$listing['id'];
    $listing['donor_id'] = (int)$listing['donor_id'];
    $listing['qty'] = (int)$listing['qty'];
    $listing['orig_price'] = (float)$listing['orig_price'];
    $listing['discount_price'] = (float)$listing['discount_price'];
    $listing['days_remaining'] = (int)$listing['days_remaining'];

    send_success($listing);

} elseif ($action === 'my_listings') {

    $user = require_role(['donor', 'retailer']);

    $stmt = $pdo->prepare("
        SELECT l.*,
               ROUND(((l.orig_price - l.discount_price) / NULLIF(l.orig_price, 0)) * 100) AS discount_percent,
               (l.expiry_date - CURRENT_DATE) AS days_remaining
        FROM listings l
        WHERE l.donor_id = ?
        ORDER BY l.created_at DESC
    ");
    $stmt->execute([$user['id']]);
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

} elseif ($action === 'create') {

    $user = require_role(['donor', 'retailer']);
    $input = get_json_input();

    $item_name = trim($input['item_name'] ?? '');
    $category = trim($input['category'] ?? '');
    $qty = isset($input['qty']) ? (int)$input['qty'] : 0;
    $expiry_date = trim($input['expiry_date'] ?? '');
    $orig_price = isset($input['orig_price']) ? (float)$input['orig_price'] : 0.0;
    $custom_discount_price = isset($input['discount_price']) ? (float)$input['discount_price'] : null;
    $image_url = trim($input['image_url'] ?? '') ?: null;

    if (!$item_name || !$category || $qty <= 0 || !$expiry_date || $orig_price <= 0) {
        send_error("INVALID_INPUT", "item_name, category, qty (>0), expiry_date, and orig_price (>0) are required", 400);
    }


    $days_left = (int)ceil((strtotime($expiry_date) - strtotime(date('Y-m-d'))) / 86400);

    if ($custom_discount_price !== null && $custom_discount_price >= 0) {
        $discount_price = $custom_discount_price;
    } else {
        $rule_stmt = $pdo->prepare("
            SELECT discount_percent
            FROM discount_rules
            WHERE donor_id = ? AND days_threshold >= ?
            ORDER BY days_threshold ASC
            LIMIT 1
        ");
        $rule_stmt->execute([$user['id'], max(0, $days_left)]);
        $rule = $rule_stmt->fetch();

        $discount_percent = $rule ? (float)$rule['discount_percent'] : 0.0;
        $discount_price = round($orig_price * (1 - $discount_percent / 100), 2);
    }

    $stmt = $pdo->prepare("
        INSERT INTO listings (donor_id, item_name, category, qty, expiry_date, orig_price, discount_price, image_url, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'available')
        RETURNING id
    ");
    $stmt->execute([$user['id'], $item_name, $category, $qty, $expiry_date, $orig_price, $discount_price, $image_url]);
    $listing_id = (int)$stmt->fetchColumn();

    send_success([
        "listing_id"     => $listing_id,
        "discount_price" => $discount_price,
        "days_left"      => $days_left
    ], "Listing created successfully", 201);

} elseif ($action === 'update') {

    $user = require_role(['donor', 'retailer']);
    $input = get_json_input();
    $id = isset($input['id']) ? (int)$input['id'] : (int)($_GET['id'] ?? 0);

    if (!$id) {
        send_error("INVALID_INPUT", "Listing ID is required", 400);
    }


    $check = $pdo->prepare("SELECT donor_id FROM listings WHERE id = ?");
    $check->execute([$id]);
    $existing = $check->fetch();

    if (!$existing) {
        send_error("NOT_FOUND", "Listing not found", 404);
    }

    if ((int)$existing['donor_id'] !== (int)$user['id'] && $user['role'] !== 'admin') {
        send_error("FORBIDDEN", "You do not own this listing", 403);
    }

    $fields = [];
    $params = [];

    if (isset($input['item_name'])) {
        $fields[] = "item_name = ?";
        $params[] = trim($input['item_name']);
    }
    if (isset($input['category'])) {
        $fields[] = "category = ?";
        $params[] = trim($input['category']);
    }
    if (isset($input['qty'])) {
        $fields[] = "qty = ?";
        $params[] = (int)$input['qty'];
    }
    if (isset($input['expiry_date'])) {
        $fields[] = "expiry_date = ?";
        $params[] = trim($input['expiry_date']);
    }
    if (isset($input['orig_price'])) {
        $fields[] = "orig_price = ?";
        $params[] = (float)$input['orig_price'];
    }
    if (isset($input['discount_price'])) {
        $fields[] = "discount_price = ?";
        $params[] = (float)$input['discount_price'];
    }
    if (isset($input['image_url'])) {
        $fields[] = "image_url = ?";
        $params[] = trim($input['image_url']);
    }
    if (isset($input['status']) && in_array($input['status'], ['available', 'claimed', 'delivered', 'cancelled'], true)) {
        $fields[] = "status = ?";
        $params[] = $input['status'];
    }

    if (empty($fields)) {
        send_error("INVALID_INPUT", "No updatable fields provided", 400);
    }

    $params[] = $id;
    $sql = "UPDATE listings SET " . implode(', ', $fields) . " WHERE id = ?";
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);

    send_success(["listing_id" => $id], "Listing updated successfully");

} elseif ($action === 'delete') {

    $user = require_role(['donor', 'retailer']);
    $id = isset($_GET['id']) ? (int)$_GET['id'] : (int)(get_json_input()['id'] ?? 0);

    if (!$id) {
        send_error("INVALID_INPUT", "Listing ID is required", 400);
    }

    $check = $pdo->prepare("SELECT donor_id FROM listings WHERE id = ?");
    $check->execute([$id]);
    $existing = $check->fetch();

    if (!$existing) {
        send_error("NOT_FOUND", "Listing not found", 404);
    }

    if ((int)$existing['donor_id'] !== (int)$user['id'] && $user['role'] !== 'admin') {
        send_error("FORBIDDEN", "You do not own this listing", 403);
    }

    $del = $pdo->prepare("DELETE FROM listings WHERE id = ?");
    $del->execute([$id]);

    send_success(["listing_id" => $id], "Listing deleted successfully");

} else {
    send_error("INVALID_ACTION", "Unrecognized listings action: {$action}", 400);
}