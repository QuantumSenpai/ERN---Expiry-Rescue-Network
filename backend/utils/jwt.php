<?php


function base64url_encode(string $data): string {
    return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
}

function base64url_decode(string $data): string {
    $remainder = strlen($data) % 4;
    if ($remainder > 0) {
        $data .= str_repeat('=', 4 - $remainder);
    }
    return base64_decode(strtr($data, '-_', '+/'));
}

function jwt_encode(array $payload, string $secret): string {
    $header = [
        'alg' => 'HS256',
        'typ' => 'JWT'
    ];

    $encodedHeader  = base64url_encode(json_encode($header, JSON_UNESCAPED_SLASHES));
    $encodedPayload = base64url_encode(json_encode($payload, JSON_UNESCAPED_SLASHES));

    $signature = hash_hmac('sha256', "{$encodedHeader}.{$encodedPayload}", $secret, true);
    $encodedSignature = base64url_encode($signature);

    return "{$encodedHeader}.{$encodedPayload}.{$encodedSignature}";
}

function jwt_decode(string $token, string $secret): ?array {
    $parts = explode('.', $token);
    if (count($parts) !== 3) {
        return null;
    }

    [$encodedHeader, $encodedPayload, $encodedSignature] = $parts;

    $expectedSignature = hash_hmac('sha256', "{$encodedHeader}.{$encodedPayload}", $secret, true);
    $givenSignature = base64url_decode($encodedSignature);

    if (!hash_equals($expectedSignature, $givenSignature)) {
        return null;
    }

    $payloadJson = base64url_decode($encodedPayload);
    if ($payloadJson === false) {
        return null;
    }

    $payload = json_decode($payloadJson, true);
    if (!is_array($payload)) {
        return null;
    }


    if (isset($payload['exp']) && $payload['exp'] < time()) {
        return null;
    }

    return $payload;
}
