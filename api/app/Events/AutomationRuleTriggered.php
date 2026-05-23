<?php

namespace App\Events;

use App\Models\AutomationRule;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class AutomationRuleTriggered implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(public readonly AutomationRule $rule) {}

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('greenhouse.'.$this->rule->greenhouse_id),
        ];
    }

    public function broadcastWith(): array
    {
        return [
            'rule_id' => $this->rule->id,
            'device_id' => $this->rule->action_device_id,
            'action' => $this->rule->action,
            'triggered_at' => now()->toIso8601String(),
        ];
    }
}
