<?php

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

uses(TestCase::class, RefreshDatabase::class);

use App\Events\AlertFired;
use App\Events\AutomationRuleTriggered;
use App\Models\AutomationRule;
use App\Models\Device;
use App\Models\Greenhouse;
use App\Models\Sensor;
use App\Models\SensorReading;
use App\Services\AutomationEngine;
use Illuminate\Support\Facades\Event;

function makeScenario(array $ruleOverrides = [], array $readingOverrides = []): array
{
    $greenhouse = Greenhouse::factory()->create();
    $sensor = Sensor::factory()->for($greenhouse)->create(['type' => 'temperature', 'unit' => '°C']);
    $device = Device::factory()->for($greenhouse)->create(['status' => false]);

    $rule = AutomationRule::factory()->create(array_merge([
        'greenhouse_id' => $greenhouse->id,
        'trigger_sensor_id' => $sensor->id,
        'action_device_id' => $device->id,
        'operator' => 'gt',
        'threshold' => 30,
        'action' => 'turn_on',
        'is_active' => true,
    ], $ruleOverrides));

    $reading = SensorReading::factory()->for($sensor)->create(array_merge([
        'value' => 35,
    ], $readingOverrides));

    return compact('greenhouse', 'sensor', 'device', 'rule', 'reading');
}

// ── Operator coverage ─────────────────────────────────────────────────────────

test('gt operator triggers when value is greater than threshold', function () {
    Event::fake();
    ['device' => $device, 'reading' => $reading] = makeScenario(['operator' => 'gt', 'threshold' => 30], ['value' => 35]);

    app(AutomationEngine::class)->evaluate($reading);

    expect($device->fresh()->status)->toBeTrue();
});

test('gt operator does not trigger when value equals threshold', function () {
    Event::fake();
    ['device' => $device, 'reading' => $reading] = makeScenario(['operator' => 'gt', 'threshold' => 30], ['value' => 30]);

    app(AutomationEngine::class)->evaluate($reading);

    expect($device->fresh()->status)->toBeFalse();
});

test('lt operator triggers when value is less than threshold', function () {
    Event::fake();
    ['device' => $device, 'reading' => $reading] = makeScenario(['operator' => 'lt', 'threshold' => 30], ['value' => 25]);

    app(AutomationEngine::class)->evaluate($reading);

    expect($device->fresh()->status)->toBeTrue();
});

test('lt operator does not trigger when value equals threshold', function () {
    Event::fake();
    ['device' => $device, 'reading' => $reading] = makeScenario(['operator' => 'lt', 'threshold' => 30], ['value' => 30]);

    app(AutomationEngine::class)->evaluate($reading);

    expect($device->fresh()->status)->toBeFalse();
});

test('eq operator triggers when value equals threshold', function () {
    Event::fake();
    ['device' => $device, 'reading' => $reading] = makeScenario(['operator' => 'eq', 'threshold' => 30], ['value' => 30]);

    app(AutomationEngine::class)->evaluate($reading);

    expect($device->fresh()->status)->toBeTrue();
});

test('eq operator does not trigger when value differs from threshold', function () {
    Event::fake();
    ['device' => $device, 'reading' => $reading] = makeScenario(['operator' => 'eq', 'threshold' => 30], ['value' => 31]);

    app(AutomationEngine::class)->evaluate($reading);

    expect($device->fresh()->status)->toBeFalse();
});

test('gte operator triggers when value equals threshold', function () {
    Event::fake();
    ['device' => $device, 'reading' => $reading] = makeScenario(['operator' => 'gte', 'threshold' => 30], ['value' => 30]);

    app(AutomationEngine::class)->evaluate($reading);

    expect($device->fresh()->status)->toBeTrue();
});

test('gte operator triggers when value exceeds threshold', function () {
    Event::fake();
    ['device' => $device, 'reading' => $reading] = makeScenario(['operator' => 'gte', 'threshold' => 30], ['value' => 31]);

    app(AutomationEngine::class)->evaluate($reading);

    expect($device->fresh()->status)->toBeTrue();
});

test('lte operator triggers when value equals threshold', function () {
    Event::fake();
    ['device' => $device, 'reading' => $reading] = makeScenario(['operator' => 'lte', 'threshold' => 30], ['value' => 30]);

    app(AutomationEngine::class)->evaluate($reading);

    expect($device->fresh()->status)->toBeTrue();
});

test('lte operator triggers when value is below threshold', function () {
    Event::fake();
    ['device' => $device, 'reading' => $reading] = makeScenario(['operator' => 'lte', 'threshold' => 30], ['value' => 29]);

    app(AutomationEngine::class)->evaluate($reading);

    expect($device->fresh()->status)->toBeTrue();
});

// ── Side-effects when triggered ───────────────────────────────────────────────

test('triggered rule creates device_command with source=automation', function () {
    Event::fake();
    ['device' => $device, 'reading' => $reading] = makeScenario();

    app(AutomationEngine::class)->evaluate($reading);

    $this->assertDatabaseHas('device_commands', [
        'device_id' => $device->id,
        'user_id' => null,
        'action' => 'turn_on',
        'source' => 'automation',
    ]);
});

test('triggered rule creates an alert', function () {
    Event::fake();
    ['greenhouse' => $greenhouse, 'sensor' => $sensor, 'reading' => $reading] = makeScenario();

    app(AutomationEngine::class)->evaluate($reading);

    $this->assertDatabaseHas('alerts', [
        'greenhouse_id' => $greenhouse->id,
        'sensor_id' => $sensor->id,
        'sensor_type' => 'temperature',
    ]);
});

test('triggered rule broadcasts AutomationRuleTriggered and AlertFired', function () {
    Event::fake([AutomationRuleTriggered::class, AlertFired::class]);
    ['reading' => $reading] = makeScenario();

    app(AutomationEngine::class)->evaluate($reading);

    Event::assertDispatched(AutomationRuleTriggered::class);
    Event::assertDispatched(AlertFired::class);
});

// ── Edge cases ────────────────────────────────────────────────────────────────

test('no active rules — engine does nothing', function () {
    Event::fake();
    $greenhouse = Greenhouse::factory()->create();
    $sensor = Sensor::factory()->for($greenhouse)->create();
    $reading = SensorReading::factory()->for($sensor)->create(['value' => 99]);

    app(AutomationEngine::class)->evaluate($reading);

    Event::assertNotDispatched(AutomationRuleTriggered::class);
    $this->assertDatabaseCount('device_commands', 0);
});

test('inactive rule is not evaluated', function () {
    Event::fake();
    ['device' => $device, 'reading' => $reading] = makeScenario(['is_active' => false]);

    app(AutomationEngine::class)->evaluate($reading);

    expect($device->fresh()->status)->toBeFalse();
    Event::assertNotDispatched(AutomationRuleTriggered::class);
});

test('rule for different sensor does not fire', function () {
    Event::fake();
    $greenhouse = Greenhouse::factory()->create();
    $sensor = Sensor::factory()->for($greenhouse)->create();
    $otherSensor = Sensor::factory()->for($greenhouse)->create();
    $device = Device::factory()->for($greenhouse)->create(['status' => false]);

    AutomationRule::factory()->create([
        'greenhouse_id' => $greenhouse->id,
        'trigger_sensor_id' => $otherSensor->id,
        'action_device_id' => $device->id,
        'operator' => 'gt',
        'threshold' => 10,
        'is_active' => true,
    ]);

    $reading = SensorReading::factory()->for($sensor)->create(['value' => 99]);

    app(AutomationEngine::class)->evaluate($reading);

    expect($device->fresh()->status)->toBeFalse();
});

test('turn_off action sets device status to false', function () {
    Event::fake();
    ['device' => $device, 'reading' => $reading] = makeScenario(
        ['action' => 'turn_off'],
        ['value' => 35]
    );
    $device->update(['status' => true]);

    app(AutomationEngine::class)->evaluate($reading);

    expect($device->fresh()->status)->toBeFalse();
});
