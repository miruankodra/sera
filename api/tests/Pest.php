<?php

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

pest()->extend(TestCase::class)
    ->use(RefreshDatabase::class)
    ->in('Feature');

expect()->extend('toBeOne', function () {
    return $this->toBe(1);
});

function actingAsUser(?array $overrides = []): User
{
    $user = User::factory()->create($overrides);
    test()->actingAs($user, 'sanctum');

    return $user;
}
