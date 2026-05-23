<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;
use OpenApi\Attributes as OA;

#[OA\Schema(
    schema: 'UserResource',
    properties: [
        new OA\Property(property: 'id', type: 'integer', example: 1),
        new OA\Property(property: 'name', type: 'string', example: 'Miruan Kodra'),
        new OA\Property(property: 'email', type: 'string', format: 'email', example: 'miruan@example.com'),
        new OA\Property(property: 'avatar_url', type: 'string', nullable: true),
        new OA\Property(property: 'timezone', type: 'string', example: 'Europe/Tirane'),
        new OA\Property(property: 'locale', type: 'string', example: 'sq'),
        new OA\Property(property: 'notification_preferences', type: 'object', nullable: true),
        new OA\Property(property: 'greenhouses_count', type: 'integer', example: 3),
        new OA\Property(property: 'created_at', type: 'string', format: 'date-time'),
    ]
)]
class UserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'avatar_url' => $this->avatar
                ? Storage::disk('public')->url($this->avatar)
                : null,
            'timezone' => $this->timezone,
            'locale' => $this->locale,
            'notification_preferences' => $this->notification_preferences,
            'greenhouses_count' => $this->greenhouses_count ?? $this->greenhouses()->count(),
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
