<?php


require_once __DIR__ . '/../utils/helpers.php';
require_once __DIR__ . '/../config/db.php';

$action = $_GET['action'] ?? '';

if ($action === 'signup') {
    $input = get_json_input();
    $name = trim($input['name'] ?? '');
    $email = strtolower(trim($input['email'] ?? ''));
    $password = $input['password'] ?? '';
    $rawRole = trim($input['role'] ?? 'user');
    $role = normalize_role($rawRole);
    $buyer_type = $input['buyer_type'] ?? ($role === 'user' ? 'individual' : null);

    if (!$name || !$email || !$password) {
        send_error("INVALID_INPUT", "Name, email, and password are required", 400);
    }

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        send_error("INVALID_EMAIL", "A valid email address is required", 400);
    }

    if (strlen($password) < 6 || !preg_match('/[A-Za-z]/', $password) || !preg_match('/[0-9]/', $password)) {
        send_error("WEAK_PASSWORD", "Password must be at least 6 characters long and contain both letters and numbers", 400);
    }

    if ($role === 'admin') {
        $adminInviteKey = trim($input['admin_invite_key'] ?? '');
        $expectedKey = getenv('ADMIN_INVITE_KEY') ?: ($_ENV['ADMIN_INVITE_KEY'] ?? ($_SERVER['ADMIN_INVITE_KEY'] ?? ''));
        if (empty($expectedKey)) {
            send_error("SERVER_CONFIG_ERROR", "Administrator registration is disabled or unconfigured on this server.", 500);
        }
        if (!$adminInviteKey || !hash_equals($expectedKey, $adminInviteKey)) {
            send_error("FORBIDDEN", "Invalid or missing Admin Invite Key. Administrator registration requires authorized clearance.", 403);
        }
    }

    $check = $pdo->prepare("SELECT id FROM users WHERE LOWER(email) = LOWER(?)");
    $check->execute([$email]);
    if ($check->fetch()) {
        send_error("DUPLICATE_EMAIL", "An account with this email address already exists", 409);
    }

    $hashed = password_hash($password, PASSWORD_DEFAULT);
    $stmt = $pdo->prepare("
        INSERT INTO users (name, role, buyer_type, email, password, verified)
        VALUES (?, ?, ?, ?, ?, TRUE)
        RETURNING id
    ");
    $stmt->execute([$name, $role, $role === 'user' ? $buyer_type : null, $email, $hashed]);
    $userId = $stmt->fetchColumn();

    send_success(
        ["user_id" => (int)$userId, "role" => $role],
        "Account created successfully. You may now sign in.",
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
    $user['role'] = normalize_role($user['role']);
    $user['verified'] = true;


    $ttl = get_role_token_ttl($user['role']);
    $tokenPayload = [
        'sub'        => $user['id'],
        'id'         => $user['id'],
        'email'      => $user['email'],
        'name'       => $user['name'],
        'role'       => $user['role'],
        'buyer_type' => $user['buyer_type'],
        'iat'        => time(),
        'exp'        => time() + $ttl,
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
    $user['role'] = normalize_role($user['role']);
    $user['verified'] = ($user['verified'] === true || $user['verified'] === 't' || $user['verified'] === 1 || $user['verified'] === '1');

    send_success(["user" => $user], "Session active");

} else {
    send_error("INVALID_ACTION", "Unrecognized auth action: {$action}", 400);
}