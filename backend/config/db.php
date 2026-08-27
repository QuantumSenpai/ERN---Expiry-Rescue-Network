<?php
// backend/config/db.php
// Update these 4 values with your InfinityFree MySQL credentials
$DB_HOST = "sql111.infinityfree.com";
$DB_NAME = "if0_42638550_kyzenn";
$DB_USER = "if0_42638550";
$DB_PASS = "aNKcpTBixWiCXof";

try {
    $pdo = new PDO(
        "mysql:host=$DB_HOST;dbname=$DB_NAME;charset=utf8mb4",
        $DB_USER,
        $DB_PASS,
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        ]
    );
} catch (PDOException $e) {
    http_response_code(500);
    header('Content-Type: application/json');
    echo json_encode(["success" => false, "error" => ["code" => "DB_CONNECTION_FAILED", "message" => "Could not connect to database"]]);
    exit;
}