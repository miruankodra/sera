<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<\App\Models\Greenhouse>
 */
class GreenhouseFactory extends Factory
{
    public function definition(): array
    {
        $names = [
            'Serrë Kryesore', 'Serrë Jugore', 'Serrë Veriore', 'Serrë Lindore',
            'Serrë Perëndimore', 'Serrë e Domates', 'Serrë e Specit', 'Serrë e Kastravecit',
            'Serrë Hidroponi', 'Serrë Organike', 'Serrë Eksperimentale',
        ];

        $locations = [
            'Tiranë', 'Durrës', 'Vlorë', 'Shkodër', 'Elbasan',
            'Fier', 'Korçë', 'Berat', 'Lushnjë', 'Kavajë',
        ];

        return [
            'user_id' => User::factory(),
            'name' => fake()->unique()->randomElement($names),
            'description' => fake()->optional(0.8)->sentence(10),
            'location' => fake()->randomElement($locations),
        ];
    }
}
