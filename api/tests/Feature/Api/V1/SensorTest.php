<?php

use App\Events\SensorReadingCreated;
use App\Models\Greenhouse;
use App\Models\Sensor;
use App\Models\SensorReading;
use Illuminate\Support\Facades\Event;

// ── Sensor list ───────────────────────────────────────────────────────────────

test('authenticated user can list sensors for their greenhouse', function () {
    $user = actingAsUser();
    $greenhouse = Greenhouse::factory()->for($user)->create();
    Sensor::factory()->for($greenhouse)->count(3)->create();

    $this->getJson("/api/v1/greenhouses/{$greenhouse->id}/sensors")
        ->assertOk()
        ->assertJsonCount(3, 'data');
});

test('listing sensors returns 401 when unauthenticated', function () {
    $greenhouse = Greenhouse::factory()->create();

    $this->getJson("/api/v1/greenhouses/{$greenhouse->id}/sensors")
        ->assertUnauthorized();
});

test('listing sensors returns 403 for another user greenhouse', function () {
    actingAsUser();
    $other = Greenhouse::factory()->create();

    $this->getJson("/api/v1/greenhouses/{$other->id}/sensors")
        ->assertForbidden();
});

// ── Sensor store ──────────────────────────────────────────────────────────────

test('authenticated user can create a sensor', function () {
    $user = actingAsUser();
    $greenhouse = Greenhouse::factory()->for($user)->create();

    $this->postJson("/api/v1/greenhouses/{$greenhouse->id}/sensors", [
        'name' => 'Temp Sensor A',
        'type' => 'temperature',
        'unit' => '°C',
    ])
        ->assertCreated()
        ->assertJsonPath('data.name', 'Temp Sensor A')
        ->assertJsonPath('data.type', 'temperature')
        ->assertJsonPath('data.unit', '°C')
        ->assertJsonPath('data.is_active', true);

    $this->assertDatabaseHas('sensors', [
        'name' => 'Temp Sensor A',
        'greenhouse_id' => $greenhouse->id,
    ]);
});

test('creating sensor returns 401 when unauthenticated', function () {
    $greenhouse = Greenhouse::factory()->create();

    $this->postJson("/api/v1/greenhouses/{$greenhouse->id}/sensors", [
        'name' => 'X', 'type' => 'temperature', 'unit' => '°C',
    ])->assertUnauthorized();
});

test('creating sensor returns 403 for another user greenhouse', function () {
    actingAsUser();
    $other = Greenhouse::factory()->create();

    $this->postJson("/api/v1/greenhouses/{$other->id}/sensors", [
        'name' => 'X', 'type' => 'temperature', 'unit' => '°C',
    ])->assertForbidden();
});

test('creating sensor returns 422 when required fields are missing', function () {
    $user = actingAsUser();
    $greenhouse = Greenhouse::factory()->for($user)->create();

    $this->postJson("/api/v1/greenhouses/{$greenhouse->id}/sensors", [])
        ->assertUnprocessable();
});

// ── Sensor show ───────────────────────────────────────────────────────────────

test('authenticated user can view their sensor', function () {
    $user = actingAsUser();
    $greenhouse = Greenhouse::factory()->for($user)->create();
    $sensor = Sensor::factory()->for($greenhouse)->create();

    $this->getJson("/api/v1/sensors/{$sensor->id}")
        ->assertOk()
        ->assertJsonPath('data.id', $sensor->id);
});

test('viewing sensor returns 401 when unauthenticated', function () {
    $sensor = Sensor::factory()->create();

    $this->getJson("/api/v1/sensors/{$sensor->id}")->assertUnauthorized();
});

test('viewing sensor returns 403 for another user sensor', function () {
    actingAsUser();
    $other = Sensor::factory()->create();

    $this->getJson("/api/v1/sensors/{$other->id}")->assertForbidden();
});

// ── Sensor destroy ────────────────────────────────────────────────────────────

test('authenticated user can delete their sensor', function () {
    $user = actingAsUser();
    $greenhouse = Greenhouse::factory()->for($user)->create();
    $sensor = Sensor::factory()->for($greenhouse)->create();

    $this->deleteJson("/api/v1/sensors/{$sensor->id}")->assertNoContent();

    $this->assertDatabaseMissing('sensors', ['id' => $sensor->id]);
});

test('deleting sensor returns 401 when unauthenticated', function () {
    $sensor = Sensor::factory()->create();

    $this->deleteJson("/api/v1/sensors/{$sensor->id}")->assertUnauthorized();
});

test('deleting sensor returns 403 for another user sensor', function () {
    actingAsUser();
    $other = Sensor::factory()->create();

    $this->deleteJson("/api/v1/sensors/{$other->id}")->assertForbidden();
});

// ── Reading ingestion ─────────────────────────────────────────────────────────

test('ingesting a reading fires SensorReadingCreated event', function () {
    Event::fake([SensorReadingCreated::class]);

    $user = actingAsUser();
    $greenhouse = Greenhouse::factory()->for($user)->create();
    $sensor = Sensor::factory()->for($greenhouse)->create();

    $this->postJson("/api/v1/sensors/{$sensor->id}/readings", [
        'value' => 22.5,
        'recorded_at' => now()->toIso8601String(),
    ])->assertCreated();

    Event::assertDispatched(SensorReadingCreated::class);
});

test('ingesting a reading persists to database', function () {
    $user = actingAsUser();
    $greenhouse = Greenhouse::factory()->for($user)->create();
    $sensor = Sensor::factory()->for($greenhouse)->create();

    $this->postJson("/api/v1/sensors/{$sensor->id}/readings", [
        'value' => 18.75,
        'recorded_at' => '2026-05-23T10:00:00Z',
    ])
        ->assertCreated()
        ->assertJsonPath('data.sensor_id', $sensor->id);

    $this->assertDatabaseHas('sensor_readings', [
        'sensor_id' => $sensor->id,
        'value' => '18.7500',
    ]);
});

test('ingesting reading returns 401 when unauthenticated', function () {
    $sensor = Sensor::factory()->create();

    $this->postJson("/api/v1/sensors/{$sensor->id}/readings", [
        'value' => 22.5,
        'recorded_at' => now()->toIso8601String(),
    ])->assertUnauthorized();
});

test('ingesting reading returns 403 for another user sensor', function () {
    actingAsUser();
    $other = Sensor::factory()->create();

    $this->postJson("/api/v1/sensors/{$other->id}/readings", [
        'value' => 22.5,
        'recorded_at' => now()->toIso8601String(),
    ])->assertForbidden();
});

test('ingesting reading returns 422 when value is missing', function () {
    $user = actingAsUser();
    $greenhouse = Greenhouse::factory()->for($user)->create();
    $sensor = Sensor::factory()->for($greenhouse)->create();

    $this->postJson("/api/v1/sensors/{$sensor->id}/readings", [
        'recorded_at' => now()->toIso8601String(),
    ])->assertUnprocessable();
});

// ── Reading list ──────────────────────────────────────────────────────────────

test('authenticated user can list readings for their sensor', function () {
    $user = actingAsUser();
    $greenhouse = Greenhouse::factory()->for($user)->create();
    $sensor = Sensor::factory()->for($greenhouse)->create();
    SensorReading::factory()->for($sensor)->count(5)->create();

    $this->getJson("/api/v1/sensors/{$sensor->id}/readings")
        ->assertOk()
        ->assertJsonCount(5, 'data');
});

test('readings support from date filter', function () {
    $user = actingAsUser();
    $greenhouse = Greenhouse::factory()->for($user)->create();
    $sensor = Sensor::factory()->for($greenhouse)->create();

    SensorReading::factory()->for($sensor)->create(['recorded_at' => '2026-05-20 10:00:00']);
    SensorReading::factory()->for($sensor)->create(['recorded_at' => '2026-05-22 10:00:00']);
    SensorReading::factory()->for($sensor)->create(['recorded_at' => '2026-05-23 10:00:00']);

    $this->getJson("/api/v1/sensors/{$sensor->id}/readings?from=2026-05-22")
        ->assertOk()
        ->assertJsonCount(2, 'data');
});

test('readings support to date filter', function () {
    $user = actingAsUser();
    $greenhouse = Greenhouse::factory()->for($user)->create();
    $sensor = Sensor::factory()->for($greenhouse)->create();

    SensorReading::factory()->for($sensor)->create(['recorded_at' => '2026-05-20 10:00:00']);
    SensorReading::factory()->for($sensor)->create(['recorded_at' => '2026-05-22 10:00:00']);
    SensorReading::factory()->for($sensor)->create(['recorded_at' => '2026-05-23 10:00:00']);

    $this->getJson("/api/v1/sensors/{$sensor->id}/readings?to=2026-05-21")
        ->assertOk()
        ->assertJsonCount(1, 'data');
});

test('readings support from+to date range filter', function () {
    $user = actingAsUser();
    $greenhouse = Greenhouse::factory()->for($user)->create();
    $sensor = Sensor::factory()->for($greenhouse)->create();

    SensorReading::factory()->for($sensor)->create(['recorded_at' => '2026-05-19 10:00:00']);
    SensorReading::factory()->for($sensor)->create(['recorded_at' => '2026-05-21 10:00:00']);
    SensorReading::factory()->for($sensor)->create(['recorded_at' => '2026-05-23 10:00:00']);

    $this->getJson("/api/v1/sensors/{$sensor->id}/readings?from=2026-05-20&to=2026-05-22")
        ->assertOk()
        ->assertJsonCount(1, 'data');
});

test('listing readings returns 401 when unauthenticated', function () {
    $sensor = Sensor::factory()->create();

    $this->getJson("/api/v1/sensors/{$sensor->id}/readings")->assertUnauthorized();
});

test('listing readings returns 403 for another user sensor', function () {
    actingAsUser();
    $other = Sensor::factory()->create();

    $this->getJson("/api/v1/sensors/{$other->id}/readings")->assertForbidden();
});
