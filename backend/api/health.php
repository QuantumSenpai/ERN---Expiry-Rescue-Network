<?php


require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../utils/helpers.php';

try {
    $stmt = $pdo->query("SELECT 1 AS alive, CURRENT_TIMESTAMP AS server_time, version() AS pg_version");
    $health = $stmt->fetch();

    send_success([
        "database"    => "connected",
        "driver"      => "pdo_pgsql",
        "ssl"         => "active",
        "server_time" => $health['server_time'] ?? null,
        "pg_version"  => $health['pg_version'] ?? null,
    ], "Database health check passed");
} catch (Throwable $e) {
    send_error("HEALTH_CHECK_FAILED", "Database connection check failed: " . $e->getMessage(), 500);
}
