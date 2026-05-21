<?php

namespace Database\Factories;

use App\Models\Device;
use App\Models\Greenhouse;
use App\Models\Sensor;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<\App\Models\AutomationRule>
 */
class AutomationRuleFactory extends Factory
{
    public function definition(): array
    {
        return [
            'greenhouse_id' => Greenhouse::factory(),
            'trigger_sensor_id' => Sensor::factory(),
            'operator' => fake()->randomElement(['gt', 'lt', 'gte', 'lte']),
            'threshold' => fake()->randomFloat(4, 10, 80),
            'action_device_id' => Device::factory(),
            'action' => fake()->randomElement(['turn_on', 'turn_off']),
            'is_active' => fake()->boolean(80),
        ];
    }
}
