<?php

namespace Database\Factories;

use App\Models\Device;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<\App\Models\DeviceCommand>
 */
class DeviceCommandFactory extends Factory
{
    public function definition(): array
    {
        $source = fake()->randomElement(['manual', 'automation']);

        return [
            'device_id' => Device::factory(),
            'user_id' => $source === 'manual' ? User::factory() : null,
            'action' => fake()->randomElement(['turn_on', 'turn_off']),
            'source' => $source,
            'issued_at' => fake()->dateTimeBetween('-30 days', 'now'),
        ];
    }
}
