<?php

use App\Models\Alert;
use App\Models\Greenhouse;
use App\Models\Sensor;

test('authenticated user can list alerts for their greenhouse', function () {
    $user = actingAsUser();
    $greenhouse = Greenhouse::factory()->for($user)->create();
    $sensor = Sensor::factory()->for($greenhouse)->create();
    Alert::factory()->count(3)->create([
        'greenhouse_id' => $greenhouse->id,
        'sensor_id' => $sensor->id,
    ]);

    $this->getJson("/api/v1/greenhouses/{$greenhouse->id}/alerts")
        ->assertOk()
        ->assertJsonCount(3, 'data');
});

test('listing alerts returns 401 when unauthenticated', function () {
    $greenhouse = Greenhouse::factory()->create();

    $this->getJson("/api/v1/greenhouses/{$greenhouse->id}/alerts")
        ->assertUnauthorized();
});

test('listing alerts returns 403 for another user greenhouse', function () {
    actingAsUser();
    $other = Greenhouse::factory()->create();

    $this->getJson("/api/v1/greenhouses/{$other->id}/alerts")
        ->assertForbidden();
});

test('marking alert as read returns 204 and sets is_read to true', function () {
    $user = actingAsUser();
    $greenhouse = Greenhouse::factory()->for($user)->create();
    $sensor = Sensor::factory()->for($greenhouse)->create();
    $alert = Alert::factory()->create([
        'greenhouse_id' => $greenhouse->id,
        'sensor_id' => $sensor->id,
        'is_read' => false,
    ]);

    $this->postJson("/api/v1/alerts/{$alert->id}/read")
        ->assertNoContent();

    $this->assertDatabaseHas('alerts', ['id' => $alert->id, 'is_read' => true]);
});

test('marking alert as read returns 401 when unauthenticated', function () {
    $alert = Alert::factory()->create();

    $this->postJson("/api/v1/alerts/{$alert->id}/read")
        ->assertUnauthorized();
});

test('marking alert as read returns 403 for another user alert', function () {
    actingAsUser();
    $other = Alert::factory()->create();

    $this->postJson("/api/v1/alerts/{$other->id}/read")
        ->assertForbidden();
});

test('alert list is ordered by triggered_at descending', function () {
    $user = actingAsUser();
    $greenhouse = Greenhouse::factory()->for($user)->create();
    $sensor = Sensor::factory()->for($greenhouse)->create();

    $old = Alert::factory()->create([
        'greenhouse_id' => $greenhouse->id,
        'sensor_id' => $sensor->id,
        'triggered_at' => now()->subDays(2),
    ]);
    $new = Alert::factory()->create([
        'greenhouse_id' => $greenhouse->id,
        'sensor_id' => $sensor->id,
        'triggered_at' => now(),
    ]);

    $response = $this->getJson("/api/v1/greenhouses/{$greenhouse->id}/alerts")
        ->assertOk();

    expect($response->json('data.0.id'))->toBe($new->id);
    expect($response->json('data.1.id'))->toBe($old->id);
});
