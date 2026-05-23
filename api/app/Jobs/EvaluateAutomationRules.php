<?php

namespace App\Jobs;

use App\Models\SensorReading;
use App\Services\AutomationEngine;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

class EvaluateAutomationRules implements ShouldQueue
{
    use Queueable;

    public function __construct(public readonly SensorReading $reading) {}

    public function handle(AutomationEngine $engine): void
    {
        $engine->evaluate($this->reading);
    }
}
