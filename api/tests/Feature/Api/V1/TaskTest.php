<?php

use App\Models\Greenhouse;
use App\Models\Task;

// ── List ──────────────────────────────────────────────────────────────────────

test('authenticated user can list tasks for their greenhouse', function () {
    $user = actingAsUser();
    $greenhouse = Greenhouse::factory()->for($user)->create();
    Task::factory()->for($greenhouse)->count(3)->create();

    $this->getJson("/api/v1/greenhouses/{$greenhouse->id}/tasks")
        ->assertOk()
        ->assertJsonCount(3, 'data');
});

test('listing tasks returns 401 when unauthenticated', function () {
    $greenhouse = Greenhouse::factory()->create();

    $this->getJson("/api/v1/greenhouses/{$greenhouse->id}/tasks")
        ->assertUnauthorized();
});

test('listing tasks returns 403 for another user greenhouse', function () {
    actingAsUser();
    $other = Greenhouse::factory()->create();

    $this->getJson("/api/v1/greenhouses/{$other->id}/tasks")
        ->assertForbidden();
});

// ── Store ─────────────────────────────────────────────────────────────────────

test('authenticated user can create a reminder task', function () {
    $user = actingAsUser();
    $greenhouse = Greenhouse::factory()->for($user)->create();

    $this->postJson("/api/v1/greenhouses/{$greenhouse->id}/tasks", [
        'title' => 'Check irrigation',
        'type' => 'reminder',
        'payload' => ['message' => 'Check the drip lines'],
        'scheduled_at' => '2026-06-01T08:00:00Z',
    ])
        ->assertCreated()
        ->assertJsonPath('data.title', 'Check irrigation')
        ->assertJsonPath('data.type', 'reminder')
        ->assertJsonPath('data.payload.message', 'Check the drip lines')
        ->assertJsonPath('data.is_completed', false);

    $this->assertDatabaseHas('tasks', ['title' => 'Check irrigation', 'greenhouse_id' => $greenhouse->id]);
});

test('authenticated user can create a system_command task', function () {
    $user = actingAsUser();
    $greenhouse = Greenhouse::factory()->for($user)->create();

    $this->postJson("/api/v1/greenhouses/{$greenhouse->id}/tasks", [
        'title' => 'Auto-irrigate',
        'type' => 'system_command',
        'payload' => ['device_id' => 1, 'action' => 'turn_on', 'duration' => 60],
        'scheduled_at' => '2026-06-01T08:00:00Z',
    ])
        ->assertCreated()
        ->assertJsonPath('data.payload.action', 'turn_on');
});

test('task payload is stored and returned as array', function () {
    $user = actingAsUser();
    $greenhouse = Greenhouse::factory()->for($user)->create();

    $response = $this->postJson("/api/v1/greenhouses/{$greenhouse->id}/tasks", [
        'title' => 'Test',
        'type' => 'reminder',
        'payload' => ['message' => 'hello'],
        'scheduled_at' => '2026-06-01T08:00:00Z',
    ])->assertCreated();

    expect($response->json('data.payload'))->toBeArray();
    expect($response->json('data.payload.message'))->toBe('hello');
});

test('creating task returns 401 when unauthenticated', function () {
    $greenhouse = Greenhouse::factory()->create();

    $this->postJson("/api/v1/greenhouses/{$greenhouse->id}/tasks", [
        'title' => 'X', 'type' => 'reminder', 'payload' => ['message' => 'x'],
        'scheduled_at' => '2026-06-01T08:00:00Z',
    ])->assertUnauthorized();
});

test('creating task returns 403 for another user greenhouse', function () {
    actingAsUser();
    $other = Greenhouse::factory()->create();

    $this->postJson("/api/v1/greenhouses/{$other->id}/tasks", [
        'title' => 'X', 'type' => 'reminder', 'payload' => ['message' => 'x'],
        'scheduled_at' => '2026-06-01T08:00:00Z',
    ])->assertForbidden();
});

test('creating task returns 422 with invalid type', function () {
    $user = actingAsUser();
    $greenhouse = Greenhouse::factory()->for($user)->create();

    $this->postJson("/api/v1/greenhouses/{$greenhouse->id}/tasks", [
        'title' => 'X', 'type' => 'invalid', 'payload' => ['message' => 'x'],
        'scheduled_at' => '2026-06-01T08:00:00Z',
    ])->assertUnprocessable();
});

test('creating task returns 422 when required fields are missing', function () {
    $user = actingAsUser();
    $greenhouse = Greenhouse::factory()->for($user)->create();

    $this->postJson("/api/v1/greenhouses/{$greenhouse->id}/tasks", [])
        ->assertUnprocessable();
});

// ── Update ────────────────────────────────────────────────────────────────────

test('authenticated user can update their task', function () {
    $user = actingAsUser();
    $greenhouse = Greenhouse::factory()->for($user)->create();
    $task = Task::factory()->for($greenhouse)->create(['is_completed' => false]);

    $this->putJson("/api/v1/tasks/{$task->id}", ['is_completed' => true])
        ->assertOk()
        ->assertJsonPath('data.is_completed', true);
});

test('updating task payload replaces it as array', function () {
    $user = actingAsUser();
    $greenhouse = Greenhouse::factory()->for($user)->create();
    $task = Task::factory()->for($greenhouse)->create([
        'type' => 'reminder',
        'payload' => ['message' => 'old'],
    ]);

    $response = $this->putJson("/api/v1/tasks/{$task->id}", [
        'payload' => ['message' => 'updated'],
    ])->assertOk();

    expect($response->json('data.payload.message'))->toBe('updated');
});

test('updating task returns 401 when unauthenticated', function () {
    $task = Task::factory()->create();

    $this->putJson("/api/v1/tasks/{$task->id}", ['is_completed' => true])
        ->assertUnauthorized();
});

test('updating task returns 403 for another user task', function () {
    actingAsUser();
    $other = Task::factory()->create();

    $this->putJson("/api/v1/tasks/{$other->id}", ['is_completed' => true])
        ->assertForbidden();
});

// ── Destroy ───────────────────────────────────────────────────────────────────

test('authenticated user can delete their task', function () {
    $user = actingAsUser();
    $greenhouse = Greenhouse::factory()->for($user)->create();
    $task = Task::factory()->for($greenhouse)->create();

    $this->deleteJson("/api/v1/tasks/{$task->id}")->assertNoContent();

    $this->assertDatabaseMissing('tasks', ['id' => $task->id]);
});

test('deleting task returns 401 when unauthenticated', function () {
    $task = Task::factory()->create();

    $this->deleteJson("/api/v1/tasks/{$task->id}")->assertUnauthorized();
});

test('deleting task returns 403 for another user task', function () {
    actingAsUser();
    $other = Task::factory()->create();

    $this->deleteJson("/api/v1/tasks/{$other->id}")->assertForbidden();
});
