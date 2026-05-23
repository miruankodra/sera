<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

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
