<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use OpenApi\Attributes as OA;

#[OA\Schema(
    schema: 'TaskResource',
    properties: [
        new OA\Property(property: 'id', type: 'integer', example: 1),
        new OA\Property(property: 'greenhouse_id', type: 'integer', example: 1),
        new OA\Property(property: 'title', type: 'string', example: 'Water plants'),
        new OA\Property(property: 'type', type: 'string', enum: ['reminder', 'system_command'], example: 'reminder'),
        new OA\Property(property: 'payload', type: 'object'),
        new OA\Property(property: 'scheduled_at', type: 'string', format: 'date-time'),
        new OA\Property(property: 'is_completed', type: 'boolean', example: false),
        new OA\Property(property: 'created_at', type: 'string', format: 'date-time'),
        new OA\Property(property: 'updated_at', type: 'string', format: 'date-time'),
    ]
)]
class TaskResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'greenhouse_id' => $this->greenhouse_id,
            'title' => $this->title,
            'type' => $this->type,
            'payload' => $this->payload,
            'scheduled_at' => $this->scheduled_at->toIso8601String(),
            'is_completed' => $this->is_completed,
            'created_at' => $this->created_at->toIso8601String(),
            'updated_at' => $this->updated_at->toIso8601String(),
        ];
    }
}
