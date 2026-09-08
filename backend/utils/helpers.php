<?php


require_once __DIR__ . '/jwt.php';


$allowedOrigin = getenv('CORS_ALLOWED_ORIGIN');
if (!$allowedOrigin || $allowedOrigin === '') {
    $allowedOrigin = '*';
}

header("Access-Control-Allow-Origin: {$allowedOrigin}");
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Content-Type: application/json; charset=utf-8');


if (isset($_SERVER['REQUEST_METHOD']) && $_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

function get_json_input(): array {
    $raw = file_get_contents('php://input');
    if (!$raw) {
        return [];
    }
    $data = json_decode($raw, true);
    return is_array($data) ? $data : [];
}

function send_success($data = [], string $message = "", int $status = 200): void {
    http_response_code($status);
    echo json_encode([
        "success" => true,
        "message" => $message,
        "data"    => $data
    ], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    exit;
}

function send_error(string $code, string $message, int $http_status = 400): void {
    http_response_code($http_status);
    echo json_encode([
        "success" => false,
        "error" => [
            "code"    => $code,
            "message" => $message
        ]
    ], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    exit;
}

function get_jwt_secret(): string {
    $secret = getenv('JWT_SECRET');
    if (!$secret || $secret === '') {
        return 'ern_default_jwt_secret_dev_key_2026';
    }
    return $secret;
}

function get_bearer_token(): ?string {
    $authHeader = null;

    if (!empty($_SERVER['HTTP_AUTHORIZATION'])) {
        $authHeader = $_SERVER['HTTP_AUTHORIZATION'];
    } elseif (!empty($_SERVER['REDIRECT_HTTP_AUTHORIZATION'])) {
        $authHeader = $_SERVER['REDIRECT_HTTP_AUTHORIZATION'];
    } elseif (function_exists('apache_request_headers')) {
        $headers = apache_request_headers();
        $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? null;
    } elseif (function_exists('getallheaders')) {
        $headers = getallheaders();
        $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? null;
    }

    if (!$authHeader) {
        return null;
    }

    if (preg_match('/^Bearer\s+(\S+)$/i', trim($authHeader), $matches)) {
        return $matches[1];
    }

    return null;
}

function require_auth(): array {
    $token = get_bearer_token();
    if (!$token) {
        send_error("AUTH_REQUIRED", "Authorization Bearer token is required", 401);
    }

    $secret = get_jwt_secret();
    $payload = jwt_decode($token, $secret);

    if (!$payload) {
        send_error("INVALID_TOKEN", "Session token is invalid or expired. Please sign in again.", 401);
    }

    return $payload;
}

function require_role($roles): array {
    $user = require_auth();
    $allowed = is_array($roles) ? $roles : [$roles];


    $normalizedAllowed = [];
    foreach ($allowed as $r) {
        $normalizedAllowed[] = $r;
        if ($r === 'donor') $normalizedAllowed[] = 'retailer';
        if ($r === 'retailer') $normalizedAllowed[] = 'donor';
        if ($r === 'buyer') $normalizedAllowed[] = 'customer';
        if ($r === 'customer') $normalizedAllowed[] = 'buyer';
    }

    if (!in_array($user['role'], $normalizedAllowed, true)) {
        send_error("FORBIDDEN", "You do not have permission to perform this action.", 403);
    }

    return $user;
}