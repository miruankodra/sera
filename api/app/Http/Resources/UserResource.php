<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

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
