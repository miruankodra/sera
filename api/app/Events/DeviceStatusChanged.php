<?php

namespace App\Events;

use App\Models\Device;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class DeviceStatusChanged implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(public readonly Device $device) {}

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('greenhouse.'.$this->device->greenhouse_id),
        ];
    }

    public function broadcastWith(): array
    {
        return [
            'device_id' => $this->device->id,
            'status' => $this->device->status,
            'changed_at' => $this->device->last_commanded_at?->toIso8601String(),
        ];
    }
}
