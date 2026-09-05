<?php
// =========================================================
// Chess Play JWT Helper (HMAC-SHA256)
// Provides secure, zero-dependency JWT token generation & verification
// =========================================================

class JWT {
    // Cryptographic secret key for signing Chess Play tokens
    private static $secret = 'ChessPlay#JwtSecretKey#2026!SaaS_Production_Auth_Hostinger_Token_Signer$';

    /**
     * Base64URL encode string
     */
    private static function base64UrlEncode($data) {
        return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
    }

    /**
     * Base64URL decode string
     */
    private static function base64UrlDecode($data) {
        return base64_decode(strtr($data, '-_', '+/'));
    }

    /**
     * Generate a signed JWT token
     * @param array $payload Token claims (sub, email, role, permissions, etc.)
     * @param int $expirySeconds Duration until token expires (defaults to 7 days)
     * @return string Signed JWT
     */
    public static function sign(array $payload, $expirySeconds = 604800) {
        $header = [
            'typ' => 'JWT',
            'alg' => 'HS256'
        ];

        $payload['iat'] = time();
        $payload['exp'] = time() + $expirySeconds;

        $encodedHeader = self::base64UrlEncode(json_encode($header));
        $encodedPayload = self::base64UrlEncode(json_encode($payload));

        $signature = hash_hmac('sha256', "{$encodedHeader}.{$encodedPayload}", self::$secret, true);
        $encodedSignature = self::base64UrlEncode($signature);

        return "{$encodedHeader}.{$encodedPayload}.{$encodedSignature}";
    }

    /**
     * Verify and decode a JWT token
     * @param string $token Signed JWT
     * @return array|false Returns decoded payload array or false if invalid/expired
     */
    public static function verify($token) {
        $parts = explode('.', $token);
        if (count($parts) !== 3) {
            return false;
        }

        list($encodedHeader, $encodedPayload, $encodedSignature) = $parts;

        // Verify signature
        $expectedSignature = self::base64UrlEncode(
            hash_hmac('sha256', "{$encodedHeader}.{$encodedPayload}", self::$secret, true)
        );

        if (!hash_equals($expectedSignature, $encodedSignature)) {
            return false;
        }

        // Decode payload
        $payload = json_decode(self::base64UrlDecode($encodedPayload), true);
        if (!$payload || !isset($payload['exp'])) {
            return false;
        }

        // Verify expiration
        if (time() >= $payload['exp']) {
            return false; // Token expired
        }

        return $payload;
    }
}
