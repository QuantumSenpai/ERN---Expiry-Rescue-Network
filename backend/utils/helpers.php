<?php
// backend/utils/helpers.php
// Shared helper functions used by auth.php, listings.php, requests.php, admin.php

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}
function get_json_input(): array {
    $raw = file_get_contents('php://input');
    $data = json_decode($raw, true);
    return is_array($data) ? $data : [];
}

function send_success($data = [], string $message = ""): void {
    echo json_encode([
        "success" => true,
        "message" => $message,
        "data"    => $data
    ]);
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
    ]);
    exit;
}