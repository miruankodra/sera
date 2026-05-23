<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use OpenApi\Attributes as OA;

#[OA\Schema(
    schema: 'SensorReadingResource',
    properties: [
        new OA\Property(property: 'id', type: 'integer', example: 1),
        new OA\Property(property: 'sensor_id', type: 'integer', example: 1),
        new OA\Property(property: 'value', type: 'number', format: 'float', example: 22.5),
        new OA\Property(property: 'recorded_at', type: 'string', format: 'date-time'),
        new OA\Property(property: 'created_at', type: 'string', format: 'date-time'),
    ]
)]
class SensorReadingResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'sensor_id' => $this->sensor_id,
            'value' => $this->value,
            'recorded_at' => $this->recorded_at->toIso8601String(),
            'created_at' => $this->created_at->toIso8601String(),
        ];
    }
}
