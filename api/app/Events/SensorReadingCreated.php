<?php

namespace App\Events;

use App\Models\SensorReading;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class SensorReadingCreated
{
    use Dispatchable, SerializesModels;

    public function __construct(public readonly SensorReading $reading) {}
}
