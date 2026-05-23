<?php

namespace App\Listeners;

use App\Events\SensorReadingCreated;
use App\Jobs\EvaluateAutomationRules;
use Illuminate\Events\Attributes\AsEventListener;

#[AsEventListener(event: SensorReadingCreated::class)]
class DispatchAutomationRuleEvaluation
{
    public function handle(SensorReadingCreated $event): void
    {
        EvaluateAutomationRules::dispatch($event->reading);
    }
}
