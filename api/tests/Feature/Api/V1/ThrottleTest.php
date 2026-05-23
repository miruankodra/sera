<?php

use App\Models\Greenhouse;
use App\Models\Sensor;

// ── Auth throttle (5 per minute) ──────────────────────────────────────────────

test('register returns 429 after 5 attempts', function () {
    $payload = ['name' => 'Test', 'email' => 'x@x.com', 'password' => 'password', 'password_confirmation' => 'password'];

    foreach (range(1, 5) as $i) {
        $this->postJson('/api/v1/auth/register', $payload);
    }

    $this->postJson('/api/v1/auth/register', $payload)
        ->assertTooManyRequests();
});

test('login returns 429 after 5 attempts', function () {
    $payload = ['email' => 'nobody@example.com', 'password' => 'wrong'];

    foreach (range(1, 5) as $i) {
        $this->postJson('/api/v1/auth/login', $payload);
    }

    $this->postJson('/api/v1/auth/login', $payload)
        ->assertTooManyRequests();
});

// ── Ingestion throttle (60/min in prod, 2 in tests via INGESTION_RATE_LIMIT) ──

test('sensor ingestion returns 429 after rate limit exceeded', function () {
    $user = actingAsUser();
    $greenhouse = Greenhouse::factory()->for($user)->create();
    $sensor = Sensor::factory()->for($greenhouse)->create();

    $payload = ['value' => 22.5, 'recorded_at' => now()->toIso8601String()];

    // INGESTION_RATE_LIMIT=2 in phpunit.xml — exhaust with 2 successful requests
    $this->postJson("/api/v1/sensors/{$sensor->id}/readings", $payload)->assertCreated();
    $this->postJson("/api/v1/sensors/{$sensor->id}/readings", $payload)->assertCreated();

    $this->postJson("/api/v1/sensors/{$sensor->id}/readings", $payload)
        ->assertTooManyRequests();
});
