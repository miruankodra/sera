<?php

namespace Database\Factories;

use App\Models\Device;
use App\Models\Greenhouse;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<\App\Models\Task>
 */
class TaskFactory extends Factory
{
    private static array $reminderTitles = [
        'Kontrollo sistemin e ujitjes',
        'Kalibrimi i sensorëve',
        'Pastrim i filtrave',
        'Kontroll i temperaturës',
        'Inspektim i bimëve',
        'Fertilizim javor',
        'Kontroll i pH të tokës',
        'Mirëmbajtje e ventilatorit',
        'Verifikim i dozave të plehut',
        'Pastrim i xhamave të serrës',
    ];

    public function definition(): array
    {
        $type = fake()->randomElement(['reminder', 'system_command']);
        $scheduledAt = fake()->dateTimeBetween('-5 days', '+30 days');
        $isCompleted = $scheduledAt < now() && fake()->boolean(70);

        $payload = $type === 'reminder'
            ? ['message' => fake()->randomElement(self::$reminderTitles)]
            : [
                'device_id' => fake()->numberBetween(1, 10),
                'action' => fake()->randomElement(['turn_on', 'turn_off']),
                'duration' => fake()->randomElement([30, 60, 120, 300]),
            ];

        return [
            'greenhouse_id' => Greenhouse::factory(),
            'title' => $type === 'reminder'
                ? fake()->randomElement(self::$reminderTitles)
                : 'Komandë Automatike: ' . ($payload['action'] === 'turn_on' ? 'Ndiz' : 'Fik') . ' pajisjen',
            'type' => $type,
            'payload' => $payload,
            'scheduled_at' => $scheduledAt,
            'is_completed' => $isCompleted,
        ];
    }
}
