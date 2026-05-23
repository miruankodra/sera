<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

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
