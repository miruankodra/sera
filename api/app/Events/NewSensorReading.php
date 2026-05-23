<?php

namespace App\Events;

use App\Models\SensorReading;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class NewSensorReading implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(public readonly SensorReading $reading) {}

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('greenhouse.'.$this->reading->sensor->greenhouse_id),
        ];
    }

    public function broadcastWith(): array
    {
        $sensor = $this->reading->sensor;

        return [
            'sensor_id' => $this->reading->sensor_id,
            'type' => $sensor->type,
            'value' => $this->reading->value,
            'unit' => $sensor->unit,
            'recorded_at' => $this->reading->recorded_at->toIso8601String(),
        ];
    }
}
