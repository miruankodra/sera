<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class FirebaseService
{
    private const FCM_URL = 'https://fcm.googleapis.com/v1/projects/sera-app-25bf5/messages:send';

    private const TOKEN_URL = 'https://oauth2.googleapis.com/token';

    public function sendToToken(string $deviceToken, string $title, string $body): void
    {
        try {
            $accessToken = $this->getAccessToken();

            Http::withToken($accessToken)->post(self::FCM_URL, [
                'message' => [
                    'token' => $deviceToken,
                    'notification' => [
                        'title' => $title,
                        'body' => $body,
                    ],
                    'android' => [
                        'priority' => 'high',
                    ],
                    'webpush' => [
                        'headers' => ['Urgency' => 'high'],
                    ],
                ],
            ]);
        } catch (\Throwable $e) {
            Log::error('FCM send failed', ['token' => substr($deviceToken, 0, 20), 'error' => $e->getMessage()]);
        }
    }

    private function getAccessToken(): string
    {
        $sa = json_decode(file_get_contents(storage_path('app/firebase-service-account.json')), true);

        $now = time();
        $header = $this->base64url(json_encode(['alg' => 'RS256', 'typ' => 'JWT']));
        $claims = $this->base64url(json_encode([
            'iss' => $sa['client_email'],
            'scope' => 'https://www.googleapis.com/auth/firebase.messaging',
            'aud' => self::TOKEN_URL,
            'iat' => $now,
            'exp' => $now + 3600,
        ]));

        $payload = "$header.$claims";
        $signature = '';
        openssl_sign($payload, $signature, $sa['private_key'], 'SHA256');
        $jwt = "$payload.".$this->base64url($signature);

        $response = Http::asForm()->post(self::TOKEN_URL, [
            'grant_type' => 'urn:ietf:params:oauth:grant-type:jwt-bearer',
            'assertion' => $jwt,
        ]);

        return $response->json('access_token');
    }

    private function base64url(string $data): string
    {
        return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
    }
}
