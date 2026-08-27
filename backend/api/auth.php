<?php
// backend/api/auth.php
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../utils/helpers.php';

$action = $_GET['action'] ?? '';

if ($action === 'signup') {
    $input = get_json_input();
    $name = trim($input['name'] ?? '');
    $email = trim($input['email'] ?? '');
    $password = $input['password'] ?? '';
    $role = $input['role'] ?? '';
    $buyer_type = $input['buyer_type'] ?? null;

    if (!$name || !$email || !$password || !$role) {
        send_error("INVALID_INPUT", "Name, email, password, and role are required", 400);
    }
    if (!in_array($role, ['donor', 'buyer', 'admin'])) {
        send_error("INVALID_INPUT", "Invalid role", 400);
    }
    if ($role === 'buyer' && !in_array($buyer_type, ['individual', 'ngo', 'orphanage'])) {
        send_error("INVALID_INPUT", "buyer_type required for buyer role", 400);
    }

    $check = $pdo->prepare("SELECT id FROM users WHERE email = ?");
    $check->execute([$email]);
    if ($check->fetch()) {
        send_error("DUPLICATE_EMAIL", "Email already registered", 409);
    }

    $hashed = password_hash($password, PASSWORD_DEFAULT);
    $stmt = $pdo->prepare("INSERT INTO users (name, role, buyer_type, email, password) VALUES (?, ?, ?, ?, ?)");
    $stmt->execute([$name, $role, $role === 'buyer' ? $buyer_type : null, $email, $hashed]);

    send_success(["user_id" => $pdo->lastInsertId()], "Signup successful. Awaiting admin verification.");

} elseif ($action === 'login') {
    $input = get_json_input();
    $email = trim($input['email'] ?? '');
    $password = $input['password'] ?? '';

    if (!$email || !$password) {
        send_error("INVALID_INPUT", "Email and password required", 400);
    }

    $stmt = $pdo->prepare("SELECT * FROM users WHERE email = ?");
    $stmt->execute([$email]);
    $user = $stmt->fetch();

    if (!$user || !password_verify($password, $user['password'])) {
        send_error("INVALID_CREDENTIALS", "Email or password is incorrect", 401);
    }
    if (!$user['verified']) {
        send_error("NOT_VERIFIED", "Account pending admin verification", 403);
    }

    unset($user['password']);
    send_success(["user" => $user], "Login successful");

} else {
    send_error("INVALID_ACTION", "Unknown action", 400);
}