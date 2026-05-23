<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use OpenApi\Attributes as OA;

#[OA\Schema(
    schema: 'AlertResource',
    properties: [
        new OA\Property(property: 'id', type: 'integer', example: 1),
        new OA\Property(property: 'greenhouse_id', type: 'integer', example: 1),
        new OA\Property(property: 'sensor_id', type: 'integer', example: 2),
        new OA\Property(property: 'sensor_type', type: 'string', example: 'temperature'),
        new OA\Property(property: 'value', type: 'number', format: 'float', example: 35.5),
        new OA\Property(property: 'threshold', type: 'number', format: 'float', example: 30.0),
        new OA\Property(property: 'operator', type: 'string', example: 'gt'),
        new OA\Property(property: 'message', type: 'string'),
        new OA\Property(property: 'is_read', type: 'boolean', example: false),
        new OA\Property(property: 'triggered_at', type: 'string', format: 'date-time'),
        new OA\Property(property: 'created_at', type: 'string', format: 'date-time'),
    ]
)]
class AlertResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'greenhouse_id' => $this->greenhouse_id,
            'sensor_id' => $this->sensor_id,
            'sensor_type' => $this->sensor_type,
            'value' => $this->value,
            'threshold' => $this->threshold,
            'operator' => $this->operator,
            'message' => $this->message,
            'is_read' => $this->is_read,
            'triggered_at' => $this->triggered_at->toIso8601String(),
            'created_at' => $this->created_at->toIso8601String(),
        ];
    }
}
