<?php

use App\Models\AutomationRule;
use App\Models\Device;
use App\Models\Greenhouse;
use App\Models\Sensor;

// ── List ──────────────────────────────────────────────────────────────────────

test('authenticated user can list automation rules for their greenhouse', function () {
    $user = actingAsUser();
    $greenhouse = Greenhouse::factory()->for($user)->create();
    $sensor = Sensor::factory()->for($greenhouse)->create();
    $device = Device::factory()->for($greenhouse)->create();
    AutomationRule::factory()->count(2)->create([
        'greenhouse_id' => $greenhouse->id,
        'trigger_sensor_id' => $sensor->id,
        'action_device_id' => $device->id,
    ]);

    $this->getJson("/api/v1/greenhouses/{$greenhouse->id}/automation-rules")
        ->assertOk()
        ->assertJsonCount(2, 'data');
});

test('listing automation rules returns 401 when unauthenticated', function () {
    $greenhouse = Greenhouse::factory()->create();

    $this->getJson("/api/v1/greenhouses/{$greenhouse->id}/automation-rules")
        ->assertUnauthorized();
});

test('listing automation rules returns 403 for another user greenhouse', function () {
    actingAsUser();
    $other = Greenhouse::factory()->create();

    $this->getJson("/api/v1/greenhouses/{$other->id}/automation-rules")
        ->assertForbidden();
});

// ── Store ─────────────────────────────────────────────────────────────────────

test('authenticated user can create an automation rule', function () {
    $user = actingAsUser();
    $greenhouse = Greenhouse::factory()->for($user)->create();
    $sensor = Sensor::factory()->for($greenhouse)->create();
    $device = Device::factory()->for($greenhouse)->create();

    $this->postJson("/api/v1/greenhouses/{$greenhouse->id}/automation-rules", [
        'trigger_sensor_id' => $sensor->id,
        'operator' => 'gt',
        'threshold' => 30,
        'action_device_id' => $device->id,
        'action' => 'turn_on',
    ])
        ->assertCreated()
        ->assertJsonPath('data.operator', 'gt')
        ->assertJsonPath('data.action', 'turn_on')
        ->assertJsonPath('data.is_active', true);

    $this->assertDatabaseHas('automation_rules', [
        'greenhouse_id' => $greenhouse->id,
        'trigger_sensor_id' => $sensor->id,
    ]);
});

test('creating automation rule returns 401 when unauthenticated', function () {
    $greenhouse = Greenhouse::factory()->create();
    $sensor = Sensor::factory()->for($greenhouse)->create();
    $device = Device::factory()->for($greenhouse)->create();

    $this->postJson("/api/v1/greenhouses/{$greenhouse->id}/automation-rules", [
        'trigger_sensor_id' => $sensor->id,
        'operator' => 'gt',
        'threshold' => 30,
        'action_device_id' => $device->id,
        'action' => 'turn_on',
    ])->assertUnauthorized();
});

test('creating automation rule returns 403 for another user greenhouse', function () {
    actingAsUser();
    $other = Greenhouse::factory()->create();
    $sensor = Sensor::factory()->for($other)->create();
    $device = Device::factory()->for($other)->create();

    $this->postJson("/api/v1/greenhouses/{$other->id}/automation-rules", [
        'trigger_sensor_id' => $sensor->id,
        'operator' => 'gt',
        'threshold' => 30,
        'action_device_id' => $device->id,
        'action' => 'turn_on',
    ])->assertForbidden();
});

test('creating automation rule returns 422 with invalid operator', function () {
    $user = actingAsUser();
    $greenhouse = Greenhouse::factory()->for($user)->create();
    $sensor = Sensor::factory()->for($greenhouse)->create();
    $device = Device::factory()->for($greenhouse)->create();

    $this->postJson("/api/v1/greenhouses/{$greenhouse->id}/automation-rules", [
        'trigger_sensor_id' => $sensor->id,
        'operator' => 'invalid',
        'threshold' => 30,
        'action_device_id' => $device->id,
        'action' => 'turn_on',
    ])->assertUnprocessable();
});

// ── Update ────────────────────────────────────────────────────────────────────

test('authenticated user can update their automation rule', function () {
    $user = actingAsUser();
    $greenhouse = Greenhouse::factory()->for($user)->create();
    $sensor = Sensor::factory()->for($greenhouse)->create();
    $device = Device::factory()->for($greenhouse)->create();
    $rule = AutomationRule::factory()->create([
        'greenhouse_id' => $greenhouse->id,
        'trigger_sensor_id' => $sensor->id,
        'action_device_id' => $device->id,
        'is_active' => true,
    ]);

    $this->putJson("/api/v1/automation-rules/{$rule->id}", ['is_active' => false])
        ->assertOk()
        ->assertJsonPath('data.is_active', false);
});

test('updating automation rule returns 401 when unauthenticated', function () {
    $rule = AutomationRule::factory()->create();

    $this->putJson("/api/v1/automation-rules/{$rule->id}", ['is_active' => false])
        ->assertUnauthorized();
});

test('updating automation rule returns 403 for another user rule', function () {
    actingAsUser();
    $other = AutomationRule::factory()->create();

    $this->putJson("/api/v1/automation-rules/{$other->id}", ['is_active' => false])
        ->assertForbidden();
});

// ── Destroy ───────────────────────────────────────────────────────────────────

test('authenticated user can delete their automation rule', function () {
    $user = actingAsUser();
    $greenhouse = Greenhouse::factory()->for($user)->create();
    $sensor = Sensor::factory()->for($greenhouse)->create();
    $device = Device::factory()->for($greenhouse)->create();
    $rule = AutomationRule::factory()->create([
        'greenhouse_id' => $greenhouse->id,
        'trigger_sensor_id' => $sensor->id,
        'action_device_id' => $device->id,
    ]);

    $this->deleteJson("/api/v1/automation-rules/{$rule->id}")->assertNoContent();

    $this->assertSoftDeleted('automation_rules', ['id' => $rule->id]);
});

test('deleting automation rule returns 401 when unauthenticated', function () {
    $rule = AutomationRule::factory()->create();

    $this->deleteJson("/api/v1/automation-rules/{$rule->id}")->assertUnauthorized();
});

test('deleting automation rule returns 403 for another user rule', function () {
    actingAsUser();
    $other = AutomationRule::factory()->create();

    $this->deleteJson("/api/v1/automation-rules/{$other->id}")->assertForbidden();
});

test('soft-deleted rule returns 404 on subsequent access', function () {
    $user = actingAsUser();
    $greenhouse = Greenhouse::factory()->for($user)->create();
    $sensor = Sensor::factory()->for($greenhouse)->create();
    $device = Device::factory()->for($greenhouse)->create();
    $rule = AutomationRule::factory()->create([
        'greenhouse_id' => $greenhouse->id,
        'trigger_sensor_id' => $sensor->id,
        'action_device_id' => $device->id,
    ]);

    $this->deleteJson("/api/v1/automation-rules/{$rule->id}")->assertNoContent();
    $this->putJson("/api/v1/automation-rules/{$rule->id}", ['is_active' => false])->assertNotFound();
});
