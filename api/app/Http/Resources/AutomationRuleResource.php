<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use OpenApi\Attributes as OA;

#[OA\Schema(
    schema: 'AutomationRuleResource',
    properties: [
        new OA\Property(property: 'id', type: 'integer', example: 1),
        new OA\Property(property: 'greenhouse_id', type: 'integer', example: 1),
        new OA\Property(property: 'trigger_sensor_id', type: 'integer', example: 2),
        new OA\Property(property: 'operator', type: 'string', enum: ['gt', 'lt', 'eq', 'gte', 'lte'], example: 'gt'),
        new OA\Property(property: 'threshold', type: 'number', format: 'float', example: 30.0),
        new OA\Property(property: 'action_device_id', type: 'integer', example: 1),
        new OA\Property(property: 'action', type: 'string', enum: ['turn_on', 'turn_off'], example: 'turn_on'),
        new OA\Property(property: 'is_active', type: 'boolean', example: true),
        new OA\Property(property: 'created_at', type: 'string', format: 'date-time'),
        new OA\Property(property: 'updated_at', type: 'string', format: 'date-time'),
    ]
)]
class AutomationRuleResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'greenhouse_id' => $this->greenhouse_id,
            'trigger_sensor_id' => $this->trigger_sensor_id,
            'operator' => $this->operator,
            'threshold' => $this->threshold,
            'action_device_id' => $this->action_device_id,
            'action' => $this->action,
            'is_active' => $this->is_active,
            'created_at' => $this->created_at->toIso8601String(),
            'updated_at' => $this->updated_at->toIso8601String(),
        ];
    }
}
