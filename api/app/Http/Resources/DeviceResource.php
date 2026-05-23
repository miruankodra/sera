<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use OpenApi\Attributes as OA;

#[OA\Schema(
    schema: 'DeviceResource',
    properties: [
        new OA\Property(property: 'id', type: 'integer', example: 1),
        new OA\Property(property: 'greenhouse_id', type: 'integer', example: 1),
        new OA\Property(property: 'name', type: 'string', example: 'Fan 1'),
        new OA\Property(property: 'type', type: 'string', example: 'fan'),
        new OA\Property(property: 'status', type: 'boolean', example: false),
        new OA\Property(property: 'last_commanded_at', type: 'string', format: 'date-time', nullable: true),
        new OA\Property(property: 'created_at', type: 'string', format: 'date-time'),
        new OA\Property(property: 'updated_at', type: 'string', format: 'date-time'),
    ]
)]
class DeviceResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'greenhouse_id' => $this->greenhouse_id,
            'name' => $this->name,
            'type' => $this->type,
            'status' => $this->status,
            'last_commanded_at' => $this->last_commanded_at?->toIso8601String(),
            'created_at' => $this->created_at->toIso8601String(),
            'updated_at' => $this->updated_at->toIso8601String(),
        ];
    }
}
