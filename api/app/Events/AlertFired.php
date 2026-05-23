<?php

namespace App\Events;

use App\Models\Alert;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class AlertFired implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(public readonly Alert $alert) {}

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('greenhouse.'.$this->alert->greenhouse_id),
        ];
    }

    public function broadcastWith(): array
    {
        return [
            'alert_id' => $this->alert->id,
            'greenhouse_id' => $this->alert->greenhouse_id,
            'sensor_type' => $this->alert->sensor_type,
            'value' => $this->alert->value,
            'threshold' => $this->alert->threshold,
            'message' => $this->alert->message,
        ];
    }
}
