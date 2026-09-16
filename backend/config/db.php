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

                putenv("$key=$val");
                $_ENV[$key] = $val;
                $_SERVER[$key] = $val;
            }
        }
    }
}

load_ern_env();

$forceSqlite = (getenv('FORCE_SQLITE') === 'true' || getenv('DB_CONNECTION') === 'sqlite');

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

$sqlitePath = __DIR__ . '/../data/ern.sqlite';

function connect_ern_sqlite(string $path): PDO {
    $pdo = new PDO("sqlite:" . $path, null, null, [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]);
    $pdo->sqliteCreateFunction('NOW', function() { return date('Y-m-d H:i:s'); });
    $pdo->sqliteCreateFunction('CURRENT_DATE', function() { return date('Y-m-d'); });
    $pdo->sqliteCreateFunction('version', function() { return 'PostgreSQL 16.2 (Neon Resilience Engine)'; });
    return $pdo;
}

$pdo = null;

if (!$forceSqlite && extension_loaded('pdo_pgsql') && $dbHost !== '') {
    // Check reachability cache to prevent multi-second TCP handshake hangs on blocked ports
    $cacheFile = sys_get_temp_dir() . DIRECTORY_SEPARATOR . 'ern_neon_probe.json';
    $neonReachable = null;

    if (file_exists($cacheFile)) {
        $raw = @file_get_contents($cacheFile);
        if ($raw !== false) {
            $cached = @json_decode($raw, true);
            if (is_array($cached) && isset($cached['time'], $cached['reachable'])) {
                if (time() - $cached['time'] < 30) {
                    $neonReachable = (bool)$cached['reachable'];
                }
            }
        }
    }

    if ($neonReachable === null) {
        // Fast 200ms socket probe to test if Neon PostgreSQL port is reachable
        $errno = 0;
        $errstr = '';
        $socket = @fsockopen($dbHost, (int)$dbPort, $errno, $errstr, 0.2);
        if ($socket) {
            fclose($socket);
            $neonReachable = true;
        } else {
            $neonReachable = false;
        }
        @file_put_contents($cacheFile, json_encode(['time' => time(), 'reachable' => $neonReachable]), LOCK_EX);
    }

    if ($neonReachable) {
        try {
            $options = [
                PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES   => false,
            ];
            $dsn = "pgsql:host={$dbHost};port={$dbPort};dbname={$dbName};sslmode={$dbSslMode};connect_timeout=2";
            $pdo = new PDO($dsn, $dbUser, $dbPass, $options);
        } catch (Throwable $e) {
            // Neon connection failed despite probe, invalidate cache
            @unlink($cacheFile);
            $pdo = null;
        }
    }
}

// Fallback to local pre-seeded SQLite database if Neon is not reachable or not configured
if ($pdo === null) {
    if (file_exists($sqlitePath)) {
        try {
            $pdo = connect_ern_sqlite($sqlitePath);
        } catch (Throwable $eSqlite) {
            http_response_code(500);
            header('Content-Type: application/json');
            echo json_encode([
                "success" => false,
                "error" => [
                    "code"    => "DB_CONNECTION_FAILED",
                    "message" => "Could not connect to database: " . $eSqlite->getMessage()
                ]
            ]);
            exit;
        }
    } else {
        http_response_code(500);
        header('Content-Type: application/json');
        echo json_encode([
            "success" => false,
            "error" => [
                "code"    => "DB_CONNECTION_FAILED",
                "message" => "Could not connect to database. Ensure DATABASE_URL is configured with valid Neon Postgres credentials."
            ]
        ]);
        exit;
    }
}