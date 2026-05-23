<?php

namespace App\Policies;

use App\Models\Sensor;
use App\Models\User;

class SensorPolicy
{
    public function view(User $user, Sensor $sensor): bool
    {
        return $user->id === $sensor->greenhouse->user_id;
    }

    public function store(User $user, Sensor $sensor): bool
    {
        return $user->id === $sensor->greenhouse->user_id;
    }

    public function delete(User $user, Sensor $sensor): bool
    {
        return $user->id === $sensor->greenhouse->user_id;
    }

    public function storeReading(User $user, Sensor $sensor): bool
    {
        return $user->id === $sensor->greenhouse->user_id;
    }

    public function viewReadings(User $user, Sensor $sensor): bool
    {
        return $user->id === $sensor->greenhouse->user_id;
    }
}
