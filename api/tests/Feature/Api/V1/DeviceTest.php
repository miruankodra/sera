<?php

use App\Events\DeviceStatusChanged;
use App\Models\Device;
use App\Models\Greenhouse;
use Illuminate\Support\Facades\Event;

// ── Device list ───────────────────────────────────────────────────────────────

test('authenticated user can list devices for their greenhouse', function () {
    $user = actingAsUser();
    $greenhouse = Greenhouse::factory()->for($user)->create();
    Device::factory()->for($greenhouse)->count(3)->create();

    $this->getJson("/api/v1/greenhouses/{$greenhouse->id}/devices")
        ->assertOk()
        ->assertJsonCount(3, 'data');
});

test('listing devices returns 401 when unauthenticated', function () {
    $greenhouse = Greenhouse::factory()->create();

    $this->getJson("/api/v1/greenhouses/{$greenhouse->id}/devices")
        ->assertUnauthorized();
});

test('listing devices returns 403 for another user greenhouse', function () {
    actingAsUser();
    $other = Greenhouse::factory()->create();

    $this->getJson("/api/v1/greenhouses/{$other->id}/devices")
        ->assertForbidden();
});

// ── Device store ──────────────────────────────────────────────────────────────

test('authenticated user can create a device', function () {
    $user = actingAsUser();
    $greenhouse = Greenhouse::factory()->for($user)->create();

    $this->postJson("/api/v1/greenhouses/{$greenhouse->id}/devices", [
        'name' => 'Ventilator 1',
        'type' => 'fan',
    ])
        ->assertCreated()
        ->assertJsonPath('data.name', 'Ventilator 1')
        ->assertJsonPath('data.type', 'fan')
        ->assertJsonPath('data.status', false);

    $this->assertDatabaseHas('devices', ['name' => 'Ventilator 1', 'greenhouse_id' => $greenhouse->id]);
});

test('creating device returns 401 when unauthenticated', function () {
    $greenhouse = Greenhouse::factory()->create();

    $this->postJson("/api/v1/greenhouses/{$greenhouse->id}/devices", [
        'name' => 'X', 'type' => 'fan',
    ])->assertUnauthorized();
});

test('creating device returns 403 for another user greenhouse', function () {
    actingAsUser();
    $other = Greenhouse::factory()->create();

    $this->postJson("/api/v1/greenhouses/{$other->id}/devices", [
        'name' => 'X', 'type' => 'fan',
    ])->assertForbidden();
});

test('creating device returns 422 when required fields are missing', function () {
    $user = actingAsUser();
    $greenhouse = Greenhouse::factory()->for($user)->create();

    $this->postJson("/api/v1/greenhouses/{$greenhouse->id}/devices", [])
        ->assertUnprocessable();
});

// ── Device show ───────────────────────────────────────────────────────────────

test('authenticated user can view their device', function () {
    $user = actingAsUser();
    $greenhouse = Greenhouse::factory()->for($user)->create();
    $device = Device::factory()->for($greenhouse)->create();

    $this->getJson("/api/v1/devices/{$device->id}")
        ->assertOk()
        ->assertJsonPath('data.id', $device->id);
});

test('viewing device returns 401 when unauthenticated', function () {
    $device = Device::factory()->create();

    $this->getJson("/api/v1/devices/{$device->id}")->assertUnauthorized();
});

test('viewing device returns 403 for another user device', function () {
    actingAsUser();
    $other = Device::factory()->create();

    $this->getJson("/api/v1/devices/{$other->id}")->assertForbidden();
});

// ── Device update ─────────────────────────────────────────────────────────────

test('authenticated user can update their device', function () {
    $user = actingAsUser();
    $greenhouse = Greenhouse::factory()->for($user)->create();
    $device = Device::factory()->for($greenhouse)->create(['name' => 'Old Name']);

    $this->putJson("/api/v1/devices/{$device->id}", ['name' => 'New Name'])
        ->assertOk()
        ->assertJsonPath('data.name', 'New Name');
});

test('updating device returns 401 when unauthenticated', function () {
    $device = Device::factory()->create();

    $this->putJson("/api/v1/devices/{$device->id}", ['name' => 'X'])->assertUnauthorized();
});

test('updating device returns 403 for another user device', function () {
    actingAsUser();
    $other = Device::factory()->create();

    $this->putJson("/api/v1/devices/{$other->id}", ['name' => 'X'])->assertForbidden();
});

// ── Device destroy ────────────────────────────────────────────────────────────

test('authenticated user can delete their device', function () {
    $user = actingAsUser();
    $greenhouse = Greenhouse::factory()->for($user)->create();
    $device = Device::factory()->for($greenhouse)->create();

    $this->deleteJson("/api/v1/devices/{$device->id}")->assertNoContent();

    $this->assertDatabaseMissing('devices', ['id' => $device->id]);
});

test('deleting device returns 401 when unauthenticated', function () {
    $device = Device::factory()->create();

    $this->deleteJson("/api/v1/devices/{$device->id}")->assertUnauthorized();
});

test('deleting device returns 403 for another user device', function () {
    actingAsUser();
    $other = Device::factory()->create();

    $this->deleteJson("/api/v1/devices/{$other->id}")->assertForbidden();
});

// ── Device command ────────────────────────────────────────────────────────────

test('turn_on command sets status to true and logs to device_commands', function () {
    Event::fake([DeviceStatusChanged::class]);

    $user = actingAsUser();
    $greenhouse = Greenhouse::factory()->for($user)->create();
    $device = Device::factory()->for($greenhouse)->create(['status' => false]);

    $this->postJson("/api/v1/devices/{$device->id}/command", ['action' => 'turn_on'])
        ->assertOk()
        ->assertJsonPath('data.status', true);

    $this->assertDatabaseHas('devices', ['id' => $device->id, 'status' => true]);
    $this->assertDatabaseHas('device_commands', [
        'device_id' => $device->id,
        'user_id' => $user->id,
        'action' => 'turn_on',
        'source' => 'manual',
    ]);
});

test('turn_off command sets status to false', function () {
    Event::fake([DeviceStatusChanged::class]);

    $user = actingAsUser();
    $greenhouse = Greenhouse::factory()->for($user)->create();
    $device = Device::factory()->for($greenhouse)->create(['status' => true]);

    $this->postJson("/api/v1/devices/{$device->id}/command", ['action' => 'turn_off'])
        ->assertOk()
        ->assertJsonPath('data.status', false);

    $this->assertDatabaseHas('devices', ['id' => $device->id, 'status' => false]);
});

test('command broadcasts DeviceStatusChanged event', function () {
    Event::fake([DeviceStatusChanged::class]);

    $user = actingAsUser();
    $greenhouse = Greenhouse::factory()->for($user)->create();
    $device = Device::factory()->for($greenhouse)->create();

    $this->postJson("/api/v1/devices/{$device->id}/command", ['action' => 'turn_on']);

    Event::assertDispatched(DeviceStatusChanged::class);
});

test('command updates last_commanded_at', function () {
    Event::fake([DeviceStatusChanged::class]);

    $user = actingAsUser();
    $greenhouse = Greenhouse::factory()->for($user)->create();
    $device = Device::factory()->for($greenhouse)->create(['last_commanded_at' => null]);

    $this->postJson("/api/v1/devices/{$device->id}/command", ['action' => 'turn_on'])
        ->assertOk();

    $this->assertNotNull($device->fresh()->last_commanded_at);
});

test('command returns 422 for invalid action', function () {
    $user = actingAsUser();
    $greenhouse = Greenhouse::factory()->for($user)->create();
    $device = Device::factory()->for($greenhouse)->create();

    $this->postJson("/api/v1/devices/{$device->id}/command", ['action' => 'explode'])
        ->assertUnprocessable();
});

test('command returns 401 when unauthenticated', function () {
    $device = Device::factory()->create();

    $this->postJson("/api/v1/devices/{$device->id}/command", ['action' => 'turn_on'])
        ->assertUnauthorized();
});

test('command returns 403 for another user device', function () {
    actingAsUser();
    $other = Device::factory()->create();

    $this->postJson("/api/v1/devices/{$other->id}/command", ['action' => 'turn_on'])
        ->assertForbidden();
});
