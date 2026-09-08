<?php
function load_ern_env(): void {
    $candidates = [
        __DIR__ . '/../.env',
        __DIR__ . '/../../.env',
    ];

    foreach ($candidates as $path) {
        if (!file_exists($path) || !is_readable($path)) {
            continue;
        }

        $lines = file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
        foreach ($lines as $line) {
            $line = trim($line);
            if ($line === '' || str_starts_with($line, '#')) {
                continue;
            }

            if (str_contains($line, '=')) {
                [$key, $val] = explode('=', $line, 2);
                $key = trim($key);
                $val = trim($val);

                if ((str_starts_with($val, '"') && str_ends_with($val, '"')) ||
                    (str_starts_with($val, "'") && str_ends_with($val, "'"))) {
                    $val = substr($val, 1, -1);
                }

                if (getenv($key) === false) {
                    putenv("$key=$val");
                    $_ENV[$key] = $val;
                    $_SERVER[$key] = $val;
                }
            }
        }
    }
}

load_ern_env();

if (!extension_loaded('pdo_pgsql')) {
    http_response_code(500);
    header('Content-Type: application/json');
    echo json_encode([
        "success" => false,
        "error" => [
            "code"    => "DB_CONNECTION_FAILED",
            "message" => "The pdo_pgsql PHP extension is not enabled. Please enable extension=pdo_pgsql in php.ini."
        ]
    ]);
    exit;
}

$databaseUrl = getenv('DATABASE_URL') ?: '';
$dbHost = getenv('DB_HOST') ?: '127.0.0.1';
$dbPort = getenv('DB_PORT') ?: '5432';
$dbName = getenv('DB_NAME') ?: 'neondb';
$dbUser = getenv('DB_USER') ?: 'postgres';
$dbPass = getenv('DB_PASS') ?: '';
$dbSslMode = getenv('DB_SSLMODE') ?: 'require';

if ($databaseUrl !== '') {
    $parsed = parse_url($databaseUrl);
    if ($parsed !== false) {
        $dbHost = $parsed['host'] ?? $dbHost;
        $dbPort = isset($parsed['port']) ? (string)$parsed['port'] : $dbPort;
        $dbName = isset($parsed['path']) ? ltrim($parsed['path'], '/') : $dbName;
        $dbUser = isset($parsed['user']) ? urldecode($parsed['user']) : $dbUser;
        $dbPass = isset($parsed['pass']) ? urldecode($parsed['pass']) : $dbPass;

        if (isset($parsed['query'])) {
            parse_str($parsed['query'], $queryParams);
            if (!empty($queryParams['sslmode'])) {
                $dbSslMode = $queryParams['sslmode'];
            }
        }
    }
}

$options = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES   => false,
    PDO::ATTR_TIMEOUT            => 5,
];

$bridgeActive = false;
$checkSocket = @fsockopen('127.0.0.1', 5433, $errno, $errstr, 0.05);
if ($checkSocket) {
    fclose($checkSocket);
    $bridgeActive = true;
}

if ($bridgeActive) {
    $dsn = "pgsql:host=127.0.0.1;port=5433;dbname={$dbName};sslmode=disable";
} else {
    $dsn = "pgsql:host={$dbHost};port={$dbPort};dbname={$dbName};sslmode={$dbSslMode}";
}

try {
    $pdo = new PDO($dsn, $dbUser, $dbPass, $options);
} catch (PDOException $e) {
    http_response_code(500);
    header('Content-Type: application/json');
    echo json_encode([
        "success" => false,
        "error" => [
            "code"    => "DB_CONNECTION_FAILED",
            "message" => "Could not connect to database. Ensure DATABASE_URL is configured with valid Neon Postgres credentials and pdo_pgsql is enabled."
        ]
    ]);
    exit;
}