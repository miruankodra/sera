<?php

use App\Models\Greenhouse;
use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});

Broadcast::channel('greenhouse.{id}', function ($user, $id) {
    $greenhouse = Greenhouse::find($id);

    return $greenhouse && (int) $user->id === (int) $greenhouse->user_id;
});
