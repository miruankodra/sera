<?php

namespace Database\Seeders;

use App\Models\Alert;
use App\Models\AutomationRule;
use App\Models\Device;
use App\Models\DeviceCommand;
use App\Models\Greenhouse;
use App\Models\Sensor;
use App\Models\SensorReading;
use App\Models\Task;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    // Sensor type definitions: [base, amplitude, peakHour, min, max]
    private const SENSOR_PROFILES = [
        'temperature' => ['base' => 22.0, 'amplitude' => 6.0,  'peak' => 14, 'min' => 10.0,  'max' => 40.0,  'unit' => '°C'],
        'humidity' => ['base' => 65.0, 'amplitude' => -12.0, 'peak' => 14, 'min' => 30.0,  'max' => 95.0,  'unit' => '%'],
        'soil_moisture' => ['base' => 60.0, 'amplitude' => 5.0,  'peak' => 8,  'min' => 20.0,  'max' => 90.0,  'unit' => '%'],
        'light' => ['base' => 0.0,  'amplitude' => 800.0, 'peak' => 13, 'min' => 0.0,   'max' => 1200.0, 'unit' => 'lux'],
    ];

    // Automation rules: sensor type → [operator, threshold, device type, action]
    private const RULE_TEMPLATES = [
        ['sensor' => 'temperature',   'operator' => 'gt', 'threshold' => 28.0, 'device' => 'fan',        'action' => 'turn_on'],
        ['sensor' => 'temperature',   'operator' => 'lt', 'threshold' => 15.0, 'device' => 'heater',     'action' => 'turn_on'],
        ['sensor' => 'humidity',      'operator' => 'gt', 'threshold' => 85.0, 'device' => 'fan',        'action' => 'turn_on'],
        ['sensor' => 'soil_moisture', 'operator' => 'lt', 'threshold' => 35.0, 'device' => 'irrigation', 'action' => 'turn_on'],
        ['sensor' => 'light',         'operator' => 'lt', 'threshold' => 200.0, 'device' => 'light',      'action' => 'turn_on'],
    ];

    public function run(): void
    {
        DB::statement('SET FOREIGN_KEY_CHECKS=0');

        // Fixed dev account so there is always a known login after reseeding.
        $devUser = User::factory()->create([
            'name' => 'Miruan Kodra',
            'email' => 'miruan@example.com',
            'password' => Hash::make('password'),
        ]);

        $users = collect([$devUser])->concat(User::factory(1)->create());

        foreach ($users as $user) {
            $this->seedUser($user);
        }

        DB::statement('SET FOREIGN_KEY_CHECKS=1');
    }

    private function seedUser(User $user): void
    {
        $greenhouses = Greenhouse::factory(3)->for($user)->create();

        foreach ($greenhouses as $greenhouse) {
            $this->seedGreenhouse($greenhouse, $user);
        }
    }

    private function seedGreenhouse(Greenhouse $greenhouse, User $user): void
    {
        // 4 sensors — one of each type
        $sensors = collect(array_keys(self::SENSOR_PROFILES))->map(
            fn (string $type) => Sensor::factory()->for($greenhouse)->ofType($type)->create()
        );

        // 4 devices — one of each type
        $deviceTypes = ['fan', 'heater', 'irrigation', 'light'];
        $devices = collect($deviceTypes)->map(
            fn (string $type) => Device::factory()->for($greenhouse)->ofType($type)->create()
        )->keyBy('type');

        // Sensor readings — 30 days × 24 hours, inserted in chunks
        $this->seedReadings($sensors);

        // Automation rules
        $this->seedAutomationRules($greenhouse, $sensors->keyBy('type'), $devices);

        // Device command history
        $this->seedDeviceCommands($devices, $user);

        // Alerts
        $this->seedAlerts($greenhouse, $sensors->keyBy('type'));

        // Tasks
        $this->seedTasks($greenhouse, $devices);
    }

    private function seedReadings(Collection $sensors): void
    {
        $now = Carbon::now();
        $start = $now->copy()->subDays(30)->startOfDay();
        $rows = [];

        foreach ($sensors as $sensor) {
            $profile = self::SENSOR_PROFILES[$sensor->type];
            $soilMoisture = $profile['base']; // tracked across time for soil_moisture drift

            $current = $start->copy();
            while ($current->lessThanOrEqualTo($now)) {
                $value = $this->diurnalValue($sensor->type, $profile, $current, $soilMoisture);

                // Soil moisture drifts down ~0.3% per hour, irrigated at 06:00 daily
                if ($sensor->type === 'soil_moisture') {
                    if ($current->hour === 6) {
                        $soilMoisture = min($profile['max'], $soilMoisture + rand(15, 25));
                    }
                    $soilMoisture = max($profile['min'], $soilMoisture - 0.3);
                    $value = round(max($profile['min'], min($profile['max'], $soilMoisture + rand(-3, 3) / 10)), 4);
                }

                $rows[] = [
                    'sensor_id' => $sensor->id,
                    'value' => $value,
                    'recorded_at' => $current->toDateTimeString(),
                    'created_at' => $current->toDateTimeString(),
                    'updated_at' => $current->toDateTimeString(),
                ];

                if (count($rows) >= 500) {
                    SensorReading::insert($rows);
                    $rows = [];
                }

                $current->addHour();
            }
        }

        if ($rows) {
            SensorReading::insert($rows);
        }
    }

    private function diurnalValue(string $type, array $profile, Carbon $time, float $soilBase = 0): float
    {
        if ($type === 'soil_moisture') {
            return $soilBase;
        }

        if ($type === 'light') {
            // Light is only present between 06:00 and 20:00
            $hour = $time->hour + $time->minute / 60;
            if ($hour < 6 || $hour > 20) {
                return 0.0;
            }
            $dayFraction = ($hour - 6) / 14; // 0→1 over the daylight window
            $value = $profile['amplitude'] * sin(M_PI * $dayFraction);
        } else {
            // Sinusoidal with peak at $profile['peak']
            $hour = $time->hour + $time->minute / 60;
            $phase = 2 * M_PI * ($hour - $profile['peak']) / 24;
            $value = $profile['base'] + $profile['amplitude'] * cos($phase);
        }

        // ±2% noise
        $noise = ($value * (rand(-20, 20) / 1000));
        $value = round($value + $noise, 4);

        return max($profile['min'], min($profile['max'], $value));
    }

    private function seedAutomationRules(
        Greenhouse $greenhouse,
        Collection $sensors,
        Collection $devices
    ): void {
        foreach (self::RULE_TEMPLATES as $template) {
            $sensor = $sensors->get($template['sensor']);
            $device = $devices->get($template['device']);

            if (! $sensor || ! $device) {
                continue;
            }

            AutomationRule::create([
                'greenhouse_id' => $greenhouse->id,
                'trigger_sensor_id' => $sensor->id,
                'operator' => $template['operator'],
                'threshold' => $template['threshold'],
                'action_device_id' => $device->id,
                'action' => $template['action'],
                'is_active' => true,
            ]);
        }
    }

    private function seedDeviceCommands(Collection $devices, User $user): void
    {
        $rows = [];
        $now = Carbon::now();

        foreach ($devices as $device) {
            $count = rand(5, 15);
            for ($i = 0; $i < $count; $i++) {
                $isManual = rand(0, 1);
                $issuedAt = $now->copy()->subDays(rand(0, 29))->subHours(rand(0, 23));
                $rows[] = [
                    'device_id' => $device->id,
                    'user_id' => $isManual ? $user->id : null,
                    'action' => $i % 2 === 0 ? 'turn_on' : 'turn_off',
                    'source' => $isManual ? 'manual' : 'automation',
                    'issued_at' => $issuedAt->toDateTimeString(),
                    'created_at' => $issuedAt->toDateTimeString(),
                    'updated_at' => $issuedAt->toDateTimeString(),
                ];
            }
        }

        DeviceCommand::insert($rows);
    }

    private function seedAlerts(Greenhouse $greenhouse, Collection $sensors): void
    {
        $alertConfigs = [
            'temperature' => ['operator' => 'gt', 'threshold' => 30.0, 'unit' => '°C',  'min' => 30.5, 'max' => 38.0],
            'humidity' => ['operator' => 'gt', 'threshold' => 85.0, 'unit' => '%',   'min' => 86.0, 'max' => 95.0],
            'soil_moisture' => ['operator' => 'lt', 'threshold' => 30.0, 'unit' => '%',   'min' => 20.0, 'max' => 29.5],
            'light' => ['operator' => 'lt', 'threshold' => 200.0, 'unit' => 'lux', 'min' => 50.0, 'max' => 199.0],
        ];

        $rows = [];
        $now = Carbon::now();

        foreach ($sensors as $type => $sensor) {
            $config = $alertConfigs[$type] ?? null;
            if (! $config) {
                continue;
            }

            $count = rand(3, 8);
            for ($i = 0; $i < $count; $i++) {
                $value = round(rand((int) ($config['min'] * 10), (int) ($config['max'] * 10)) / 10, 4);
                $triggeredAt = $now->copy()->subDays(rand(0, 29))->subHours(rand(0, 23));
                $valueStr = number_format($value, 1);
                $thresholdStr = number_format($config['threshold'], 1);

                $messages = [
                    'temperature' => "Temperature exceeded threshold: {$valueStr}{$config['unit']} (threshold: {$thresholdStr}{$config['unit']}).",
                    'humidity' => "Humidity exceeded threshold: {$valueStr}{$config['unit']} (threshold: {$thresholdStr}{$config['unit']}).",
                    'soil_moisture' => "Soil moisture dropped below threshold: {$valueStr}{$config['unit']} (threshold: {$thresholdStr}{$config['unit']}).",
                    'light' => "Light level dropped below threshold: {$valueStr}{$config['unit']} (threshold: {$thresholdStr}{$config['unit']}).",
                ];

                $rows[] = [
                    'greenhouse_id' => $greenhouse->id,
                    'sensor_id' => $sensor->id,
                    'sensor_type' => $type,
                    'value' => $value,
                    'threshold' => $config['threshold'],
                    'operator' => $config['operator'],
                    'message' => $messages[$type],
                    'is_read' => rand(0, 1),
                    'triggered_at' => $triggeredAt->toDateTimeString(),
                    'created_at' => $triggeredAt->toDateTimeString(),
                    'updated_at' => $triggeredAt->toDateTimeString(),
                ];
            }
        }

        Alert::insert($rows);
    }

    private function seedTasks(Greenhouse $greenhouse, Collection $devices): void
    {
        $now = Carbon::now();
        $reminderTitles = [
            'Check irrigation system',
            'Calibrate sensors',
            'Clean filters',
            'Check temperature levels',
            'Inspect plants',
            'Weekly fertilization',
            'Check soil pH',
            'Fan maintenance',
            'Verify fertilizer doses',
            'Clean greenhouse windows',
        ];

        $rows = [];

        // Past reminders (mostly completed)
        for ($i = 0; $i < 5; $i++) {
            $scheduledAt = $now->copy()->subDays(rand(1, 28));
            $rows[] = [
                'greenhouse_id' => $greenhouse->id,
                'title' => $reminderTitles[array_rand($reminderTitles)],
                'type' => 'reminder',
                'payload' => json_encode(['message' => $reminderTitles[array_rand($reminderTitles)]]),
                'scheduled_at' => $scheduledAt->toDateTimeString(),
                'is_completed' => rand(0, 4) > 0 ? 1 : 0,
                'created_at' => $scheduledAt->copy()->subDays(2)->toDateTimeString(),
                'updated_at' => $scheduledAt->toDateTimeString(),
            ];
        }

        // Upcoming reminders
        for ($i = 0; $i < 4; $i++) {
            $scheduledAt = $now->copy()->addDays(rand(1, 30));
            $rows[] = [
                'greenhouse_id' => $greenhouse->id,
                'title' => $reminderTitles[array_rand($reminderTitles)],
                'type' => 'reminder',
                'payload' => json_encode(['message' => $reminderTitles[array_rand($reminderTitles)]]),
                'scheduled_at' => $scheduledAt->toDateTimeString(),
                'is_completed' => 0,
                'created_at' => $now->toDateTimeString(),
                'updated_at' => $now->toDateTimeString(),
            ];
        }

        // System command tasks
        $deviceList = $devices->values();
        for ($i = 0; $i < 3; $i++) {
            $device = $deviceList[$i % $deviceList->count()];
            $action = rand(0, 1) ? 'turn_on' : 'turn_off';
            $scheduledAt = $now->copy()->addDays(rand(1, 14))->setHour(rand(6, 20))->setMinute(0);
            $rows[] = [
                'greenhouse_id' => $greenhouse->id,
                'title' => 'Command: '.($action === 'turn_on' ? 'Turn on' : 'Turn off').' '.$device->name,
                'type' => 'system_command',
                'payload' => json_encode([
                    'device_id' => $device->id,
                    'action' => $action,
                    'duration' => rand(1, 6) * 30,
                ]),
                'scheduled_at' => $scheduledAt->toDateTimeString(),
                'is_completed' => 0,
                'created_at' => $now->toDateTimeString(),
                'updated_at' => $now->toDateTimeString(),
            ];
        }

        Task::insert($rows);
    }
}
