<?php

require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../utils/helpers.php';

try {
    $driver = $pdo->getAttribute(PDO::ATTR_DRIVER_NAME);
    if ($driver === 'sqlite') {
        $stmt = $pdo->query("SELECT 1 AS alive, datetime('now') AS server_time, version() AS pg_version");
    } else {
        $stmt = $pdo->query("SELECT 1 AS alive, CURRENT_TIMESTAMP AS server_time, version() AS pg_version");
    }
    $health = $stmt->fetch();

    send_success([
        "database"    => "connected",
        "driver"      => $driver,
        "ssl"         => "active",
        "server_time" => $health['server_time'] ?? null,
        "pg_version"  => $health['pg_version'] ?? null,
    ], "Database health check passed");
} catch (Throwable $e) {
    send_error("HEALTH_CHECK_FAILED", "Database connection check failed: " . $e->getMessage(), 500);
}
