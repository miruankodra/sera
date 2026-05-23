<?php

namespace App\Services;

use App\Events\AlertFired;
use App\Events\AutomationRuleTriggered;
use App\Models\AutomationRule;
use App\Models\SensorReading;

class AutomationEngine
{
    public function evaluate(SensorReading $reading): void
    {
        $sensor = $reading->sensor;

        $rules = AutomationRule::with('actionDevice')
            ->where('greenhouse_id', $sensor->greenhouse_id)
            ->where('trigger_sensor_id', $sensor->id)
            ->where('is_active', true)
            ->get();

        foreach ($rules as $rule) {
            if (! $this->conditionMet((float) $reading->value, $rule->operator, (float) $rule->threshold)) {
                continue;
            }

            $device = $rule->actionDevice;
            $newStatus = $rule->action === 'turn_on';
            $now = now();

            $device->update([
                'status' => $newStatus,
                'last_commanded_at' => $now,
            ]);

            $device->commands()->create([
                'user_id' => null,
                'action' => $rule->action,
                'source' => 'automation',
                'issued_at' => $now,
            ]);

            $alert = $sensor->greenhouse->alerts()->create([
                'sensor_id' => $sensor->id,
                'sensor_type' => $sensor->type,
                'value' => $reading->value,
                'threshold' => $rule->threshold,
                'operator' => $rule->operator,
                'message' => $this->buildMessage($sensor->type, $reading->value, $rule->operator, $rule->threshold, $sensor->unit),
                'triggered_at' => $now,
            ]);

            AutomationRuleTriggered::dispatch($rule);
            AlertFired::dispatch($alert);
        }
    }

    private function conditionMet(float $value, string $operator, float $threshold): bool
    {
        return match ($operator) {
            'gt' => $value > $threshold,
            'lt' => $value < $threshold,
            'eq' => $value == $threshold,
            'gte' => $value >= $threshold,
            'lte' => $value <= $threshold,
            default => false,
        };
    }

    private function buildMessage(string $sensorType, mixed $value, string $operator, mixed $threshold, string $unit): string
    {
        $labels = [
            'gt' => 'tejkaloi', 'gte' => 'tejkaloi ose arriti',
            'lt' => 'ra nën', 'lte' => 'ra nën ose arriti',
            'eq' => 'arriti',
        ];

        $label = $labels[$operator] ?? $operator;

        return ucfirst($sensorType)." {$label} pragun: {$value}{$unit} (prag: {$threshold}{$unit}).";
    }
}
