<?php

namespace Database\Factories;

use App\Models\Sensor;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<\App\Models\SensorReading>
 */
class SensorReadingFactory extends Factory
{
    public function definition(): array
    {
        return [
            'sensor_id' => Sensor::factory(),
            'value' => fake()->randomFloat(4, 0, 100),
            'recorded_at' => fake()->dateTimeBetween('-30 days', 'now'),
        ];
    }
}
