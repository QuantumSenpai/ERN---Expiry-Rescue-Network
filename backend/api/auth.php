<?php


require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../utils/helpers.php';

$action = $_GET['action'] ?? '';

if ($action === 'signup') {
    $input = get_json_input();
    $name = trim($input['name'] ?? '');
    $email = strtolower(trim($input['email'] ?? ''));
    $password = $input['password'] ?? '';
    $role = trim($input['role'] ?? '');
    $buyer_type = $input['buyer_type'] ?? null;


    if ($role === 'retailer') $role = 'donor';
    if ($role === 'customer') $role = 'buyer';

    if (!$name || !$email || !$password || !$role) {
        send_error("INVALID_INPUT", "Name, email, password, and role are required", 400);
    }

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        send_error("INVALID_EMAIL", "A valid email address is required", 400);
    }

    if (strlen($password) < 8) {
        send_error("WEAK_PASSWORD", "Password must be at least 8 characters long", 400);
    }

    if (!in_array($role, ['donor', 'buyer', 'admin'], true)) {
        send_error("INVALID_ROLE", "Role must be donor, buyer, or admin", 400);
    }

    if ($role === 'buyer' && !in_array($buyer_type, ['individual', 'ngo', 'orphanage'], true)) {
        send_error("INVALID_BUYER_TYPE", "buyer_type ('individual', 'ngo', 'orphanage') is required for buyers", 400);
    }


    $check = $pdo->prepare("SELECT id FROM users WHERE LOWER(email) = LOWER(?)");
    $check->execute([$email]);
    if ($check->fetch()) {
        send_error("DUPLICATE_EMAIL", "An account with this email address already exists", 409);
    }

    $hashed = password_hash($password, PASSWORD_DEFAULT);
    $stmt = $pdo->prepare("
        INSERT INTO users (name, role, buyer_type, email, password, verified)
        VALUES (?, ?, ?, ?, ?, FALSE)
        RETURNING id
    ");
    $stmt->execute([$name, $role, $role === 'buyer' ? $buyer_type : null, $email, $hashed]);
    $userId = $stmt->fetchColumn();

    send_success(
        ["user_id" => (int)$userId],
        "Account created successfully. Awaiting administrative verification before portal activation.",
        201
    );

} elseif ($action === 'login') {
    $input = get_json_input();
    $email = strtolower(trim($input['email'] ?? ''));
    $password = $input['password'] ?? '';

    if (!$email || !$password) {
        send_error("INVALID_INPUT", "Email and password are required", 400);
    }

    $stmt = $pdo->prepare("SELECT id, name, role, buyer_type, email, password, verified FROM users WHERE LOWER(email) = LOWER(?)");
    $stmt->execute([$email]);
    $user = $stmt->fetch();

    if (!$user || !password_verify($password, $user['password'])) {
        send_error("INVALID_CREDENTIALS", "Invalid email address or password", 401);
    }


    $isVerified = ($user['verified'] === true || $user['verified'] === 't' || $user['verified'] === 1 || $user['verified'] === '1');
    if (!$isVerified) {
        send_error("NOT_VERIFIED", "Account is pending administrative verification. You will be notified once activated.", 403);
    }


    unset($user['password']);
    $user['id'] = (int)$user['id'];
    $user['verified'] = true;


    $tokenPayload = [
        'sub'        => $user['id'],
        'id'         => $user['id'],
        'email'      => $user['email'],
        'name'       => $user['name'],
        'role'       => $user['role'],
        'buyer_type' => $user['buyer_type'],
        'iat'        => time(),
        'exp'        => time() + (86400 * 7),
    ];

    $token = jwt_encode($tokenPayload, get_jwt_secret());

    send_success([
        "token" => $token,
        "user"  => $user
    ], "Sign in successful");

} elseif ($action === 'me' || $action === 'validate') {

    $tokenUser = require_auth();

    $stmt = $pdo->prepare("SELECT id, name, role, buyer_type, email, verified, created_at FROM users WHERE id = ?");
    $stmt->execute([$tokenUser['id']]);
    $user = $stmt->fetch();

    if (!$user) {
        send_error("USER_NOT_FOUND", "User account no longer exists", 401);
    }

    $user['id'] = (int)$user['id'];
    $user['verified'] = ($user['verified'] === true || $user['verified'] === 't' || $user['verified'] === 1 || $user['verified'] === '1');

    send_success(["user" => $user], "Session active");

} else {
    send_error("INVALID_ACTION", "Unrecognized auth action: {$action}", 400);
}