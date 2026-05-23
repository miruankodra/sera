<?php

namespace Database\Factories;

use App\Models\Greenhouse;
use App\Models\Sensor;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<\App\Models\Alert>
 */
class AlertFactory extends Factory
{
    private static array $thresholds = [
        'temperature'   => ['threshold' => 30.0, 'operator' => 'gt', 'unit' => '°C'],
        'humidity'      => ['threshold' => 85.0, 'operator' => 'gt', 'unit' => '%'],
        'soil_moisture' => ['threshold' => 30.0, 'operator' => 'lt', 'unit' => '%'],
        'light'         => ['threshold' => 200.0, 'operator' => 'lt', 'unit' => 'lux'],
    ];

    public function definition(): array
    {
        $sensorType = fake()->randomElement(array_keys(self::$thresholds));
        $config = self::$thresholds[$sensorType];
        $threshold = $config['threshold'];
        $value = $config['operator'] === 'gt'
            ? fake()->randomFloat(4, $threshold + 0.5, $threshold + 15)
            : fake()->randomFloat(4, max(0, $threshold - 15), $threshold - 0.5);

        $messages = [
            'temperature' => "Temperatura arriti {$value}{$config['unit']}, duke tejkaluar pragun prej {$threshold}{$config['unit']}.",
            'humidity'    => "Lagështia arriti {$value}{$config['unit']}, duke tejkaluar pragun prej {$threshold}{$config['unit']}.",
            'soil_moisture' => "Lagështia e tokës ra në {$value}{$config['unit']}, nën pragun prej {$threshold}{$config['unit']}.",
            'light'       => "Niveli i dritës ra në {$value}{$config['unit']}, nën pragun prej {$threshold}{$config['unit']}.",
        ];

        return [
            'greenhouse_id' => Greenhouse::factory(),
            'sensor_id' => Sensor::factory(),
            'sensor_type' => $sensorType,
            'value' => $value,
            'threshold' => $threshold,
            'operator' => $config['operator'],
            'message' => $messages[$sensorType],
            'is_read' => fake()->boolean(40),
            'triggered_at' => fake()->dateTimeBetween('-30 days', 'now'),
        ];
    }
}
