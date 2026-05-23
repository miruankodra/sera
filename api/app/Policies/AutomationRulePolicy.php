<?php

namespace App\Policies;

use App\Models\AutomationRule;
use App\Models\User;

class AutomationRulePolicy
{
    public function update(User $user, AutomationRule $rule): bool
    {
        return $user->id === $rule->greenhouse->user_id;
    }

    public function delete(User $user, AutomationRule $rule): bool
    {
        return $user->id === $rule->greenhouse->user_id;
    }
}
