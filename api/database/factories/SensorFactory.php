<?php

namespace Database\Factories;

use App\Models\Greenhouse;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<\App\Models\Sensor>
 */
class SensorFactory extends Factory
{
    private static array $typeConfig = [
        'temperature'   => ['unit' => '°C',  'name' => 'Sensor Temperature'],
        'humidity'      => ['unit' => '%',   'name' => 'Sensor Lagështie'],
        'soil_moisture' => ['unit' => '%',   'name' => 'Sensor Lagështie Toke'],
        'light'         => ['unit' => 'lux', 'name' => 'Sensor Drite'],
    ];

    public function definition(): array
    {
        $type = fake()->randomElement(array_keys(self::$typeConfig));
        $config = self::$typeConfig[$type];

        return [
            'greenhouse_id' => Greenhouse::factory(),
            'name' => $config['name'],
            'type' => $type,
            'unit' => $config['unit'],
            'is_active' => fake()->boolean(90),
        ];
    }

    public function ofType(string $type): static
    {
        $config = self::$typeConfig[$type];

        return $this->state([
            'type' => $type,
            'unit' => $config['unit'],
            'name' => $config['name'],
        ]);
    }
}
