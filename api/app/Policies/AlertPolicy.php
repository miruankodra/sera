<?php

namespace App\Policies;

use App\Models\Alert;
use App\Models\User;

class AlertPolicy
{
    public function markRead(User $user, Alert $alert): bool
    {
        return $user->id === $alert->greenhouse->user_id;
    }
}
