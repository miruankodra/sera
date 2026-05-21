<?php

namespace Database\Factories;

use App\Models\Greenhouse;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<\App\Models\Device>
 */
class DeviceFactory extends Factory
{
    private static array $typeNames = [
        'fan'        => 'Ventilator',
        'heater'     => 'Ngrohës',
        'irrigation' => 'Sistem Ujitjeje',
        'light'      => 'Dritë Artificiale',
    ];

    public function definition(): array
    {
        $type = fake()->randomElement(array_keys(self::$typeNames));
        $commandedAt = fake()->optional(0.7)->dateTimeBetween('-7 days', 'now');

        return [
            'greenhouse_id' => Greenhouse::factory(),
            'name' => self::$typeNames[$type],
            'type' => $type,
            'status' => fake()->boolean(30),
            'last_commanded_at' => $commandedAt,
        ];
    }

    public function ofType(string $type): static
    {
        return $this->state([
            'type' => $type,
            'name' => self::$typeNames[$type],
        ]);
    }
}
