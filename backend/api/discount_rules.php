<?php


require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../utils/helpers.php';

$user = require_role(['donor', 'retailer']);

$action = $_GET['action'] ?? 'list';

if ($action === 'list') {
    $stmt = $pdo->prepare("
        SELECT id, donor_id, days_threshold, discount_percent, created_at
        FROM discount_rules
        WHERE donor_id = ?
        ORDER BY days_threshold ASC
    ");
    $stmt->execute([$user['id']]);
    $rules = $stmt->fetchAll();

    foreach ($rules as &$r) {
        $r['id'] = (int)$r['id'];
        $r['donor_id'] = (int)$r['donor_id'];
        $r['days_threshold'] = (int)$r['days_threshold'];
        $r['discount_percent'] = (float)$r['discount_percent'];
    }

    send_success($rules);

} elseif ($action === 'create') {
    $input = get_json_input();
    $days_threshold = isset($input['days_threshold']) ? (int)$input['days_threshold'] : null;
    $discount_percent = isset($input['discount_percent']) ? (float)$input['discount_percent'] : null;

    if ($days_threshold === null || $days_threshold < 0 || $discount_percent === null || $discount_percent < 0 || $discount_percent > 100) {
        send_error("INVALID_INPUT", "days_threshold (>= 0) and discount_percent (0–100) are required", 400);
    }


    $check = $pdo->prepare("SELECT id FROM discount_rules WHERE donor_id = ? AND days_threshold = ?");
    $check->execute([$user['id'], $days_threshold]);
    if ($check->fetch()) {
        send_error("DUPLICATE_RULE", "A discount rule for {$days_threshold} days threshold already exists", 409);
    }

    $stmt = $pdo->prepare("
        INSERT INTO discount_rules (donor_id, days_threshold, discount_percent, created_at)
        VALUES (?, ?, ?, NOW())
        RETURNING id
    ");
    $stmt->execute([$user['id'], $days_threshold, $discount_percent]);
    $ruleId = (int)$stmt->fetchColumn();

    send_success([
        "id"               => $ruleId,
        "days_threshold"   => $days_threshold,
        "discount_percent" => $discount_percent
    ], "Discount rule created successfully", 201);

} elseif ($action === 'update') {
    $input = get_json_input();
    $id = isset($input['id']) ? (int)$input['id'] : (int)($_GET['id'] ?? 0);
    $days_threshold = isset($input['days_threshold']) ? (int)$input['days_threshold'] : null;
    $discount_percent = isset($input['discount_percent']) ? (float)$input['discount_percent'] : null;

    if (!$id) {
        send_error("INVALID_INPUT", "Rule ID is required", 400);
    }

    $check = $pdo->prepare("SELECT id, donor_id FROM discount_rules WHERE id = ?");
    $check->execute([$id]);
    $rule = $check->fetch();

    if (!$rule) {
        send_error("NOT_FOUND", "Discount rule not found", 404);
    }

    if ((int)$rule['donor_id'] !== (int)$user['id'] && $user['role'] !== 'admin') {
        send_error("FORBIDDEN", "You do not have permission to modify this rule", 403);
    }

    $fields = [];
    $params = [];

    if ($days_threshold !== null && $days_threshold >= 0) {
        $fields[] = "days_threshold = ?";
        $params[] = $days_threshold;
    }
    if ($discount_percent !== null && $discount_percent >= 0 && $discount_percent <= 100) {
        $fields[] = "discount_percent = ?";
        $params[] = $discount_percent;
    }

    if (empty($fields)) {
        send_error("INVALID_INPUT", "At least one valid field (days_threshold or discount_percent) required", 400);
    }

    $params[] = $id;
    $sql = "UPDATE discount_rules SET " . implode(', ', $fields) . " WHERE id = ?";
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);

    send_success(["id" => $id], "Discount rule updated successfully");

} elseif ($action === 'delete') {
    $id = isset($_GET['id']) ? (int)$_GET['id'] : (int)(get_json_input()['id'] ?? 0);

    if (!$id) {
        send_error("INVALID_INPUT", "Rule ID is required", 400);
    }

    $check = $pdo->prepare("SELECT id, donor_id FROM discount_rules WHERE id = ?");
    $check->execute([$id]);
    $rule = $check->fetch();

    if (!$rule) {
        send_error("NOT_FOUND", "Discount rule not found", 404);
    }

    if ((int)$rule['donor_id'] !== (int)$user['id'] && $user['role'] !== 'admin') {
        send_error("FORBIDDEN", "You do not have permission to delete this rule", 403);
    }

    $del = $pdo->prepare("DELETE FROM discount_rules WHERE id = ?");
    $del->execute([$id]);

    send_success(["id" => $id], "Discount rule deleted successfully");

} else {
    send_error("INVALID_ACTION", "Unrecognized discount_rules action: {$action}", 400);
}
