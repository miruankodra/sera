<?php

namespace App\Policies;

use App\Models\Greenhouse;
use App\Models\User;

class GreenhousePolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, Greenhouse $greenhouse): bool
    {
        return $user->id === $greenhouse->user_id;
    }

    public function create(User $user): bool
    {
        return true;
    }

    public function update(User $user, Greenhouse $greenhouse): bool
    {
        return $user->id === $greenhouse->user_id;
    }

    public function delete(User $user, Greenhouse $greenhouse): bool
    {
        return $user->id === $greenhouse->user_id;
    }
}
