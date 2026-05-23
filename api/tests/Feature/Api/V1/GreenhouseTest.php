<?php

use App\Models\Greenhouse;
use App\Models\User;

// ── GET /api/v1/greenhouses ──────────────────────────────────────────────────

describe('GET /api/v1/greenhouses', function () {
    it('returns only the authenticated user\'s greenhouses', function () {
        $user = actingAsUser();
        Greenhouse::factory()->count(2)->for($user)->create();
        Greenhouse::factory()->create();

        $this->getJson('/api/v1/greenhouses')
            ->assertOk()
            ->assertJsonCount(2, 'data')
            ->assertJsonStructure([
                'data' => [
                    '*' => ['id', 'user_id', 'name', 'description', 'location', 'created_at', 'updated_at'],
                ],
            ]);
    });

    it('does not return other users\' greenhouses', function () {
        $user = actingAsUser();
        $other = User::factory()->create();
        Greenhouse::factory()->for($other)->create();

        $this->getJson('/api/v1/greenhouses')
            ->assertOk()
            ->assertJsonCount(0, 'data');
    });

    it('returns 401 when unauthenticated', function () {
        $this->getJson('/api/v1/greenhouses')->assertUnauthorized();
    });
});

// ── POST /api/v1/greenhouses ─────────────────────────────────────────────────

describe('POST /api/v1/greenhouses', function () {
    it('creates a greenhouse and returns 201 with correct shape', function () {
        $user = actingAsUser();

        $this->postJson('/api/v1/greenhouses', [
            'name' => 'Serrë Kryesore',
            'description' => 'Main greenhouse',
            'location' => 'Tiranë',
        ])
            ->assertCreated()
            ->assertJsonStructure(['data' => ['id', 'user_id', 'name', 'description', 'location', 'created_at', 'updated_at']])
            ->assertJsonPath('data.name', 'Serrë Kryesore')
            ->assertJsonPath('data.user_id', $user->id);

        $this->assertDatabaseHas('greenhouses', ['name' => 'Serrë Kryesore', 'user_id' => $user->id]);
    });

    it('returns 422 when name is missing', function () {
        actingAsUser();

        $this->postJson('/api/v1/greenhouses', ['location' => 'Tiranë'])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['name']);
    });

    it('returns 401 when unauthenticated', function () {
        $this->postJson('/api/v1/greenhouses', ['name' => 'Test'])->assertUnauthorized();
    });
});

// ── GET /api/v1/greenhouses/{id} ─────────────────────────────────────────────

describe('GET /api/v1/greenhouses/{id}', function () {
    it('returns the greenhouse for its owner', function () {
        $user = actingAsUser();
        $greenhouse = Greenhouse::factory()->for($user)->create();

        $this->getJson("/api/v1/greenhouses/{$greenhouse->id}")
            ->assertOk()
            ->assertJsonPath('data.id', $greenhouse->id)
            ->assertJsonPath('data.name', $greenhouse->name);
    });

    it('returns 403 when accessing another user\'s greenhouse', function () {
        actingAsUser();
        $other = Greenhouse::factory()->create();

        $this->getJson("/api/v1/greenhouses/{$other->id}")->assertForbidden();
    });

    it('returns 401 when unauthenticated', function () {
        $greenhouse = Greenhouse::factory()->create();

        $this->getJson("/api/v1/greenhouses/{$greenhouse->id}")->assertUnauthorized();
    });
});

// ── PUT /api/v1/greenhouses/{id} ─────────────────────────────────────────────

describe('PUT /api/v1/greenhouses/{id}', function () {
    it('updates the greenhouse and returns 200', function () {
        $user = actingAsUser();
        $greenhouse = Greenhouse::factory()->for($user)->create();

        $this->putJson("/api/v1/greenhouses/{$greenhouse->id}", [
            'name' => 'Updated Name',
            'location' => 'Durrës',
        ])
            ->assertOk()
            ->assertJsonPath('data.name', 'Updated Name')
            ->assertJsonPath('data.location', 'Durrës');

        $this->assertDatabaseHas('greenhouses', ['id' => $greenhouse->id, 'name' => 'Updated Name']);
    });

    it('returns 403 when updating another user\'s greenhouse', function () {
        actingAsUser();
        $other = Greenhouse::factory()->create();

        $this->putJson("/api/v1/greenhouses/{$other->id}", ['name' => 'Hack'])->assertForbidden();
    });

    it('returns 422 when name exceeds max length', function () {
        $user = actingAsUser();
        $greenhouse = Greenhouse::factory()->for($user)->create();

        $this->putJson("/api/v1/greenhouses/{$greenhouse->id}", ['name' => str_repeat('a', 256)])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['name']);
    });

    it('returns 401 when unauthenticated', function () {
        $greenhouse = Greenhouse::factory()->create();

        $this->putJson("/api/v1/greenhouses/{$greenhouse->id}", ['name' => 'X'])->assertUnauthorized();
    });
});

// ── DELETE /api/v1/greenhouses/{id} ──────────────────────────────────────────

describe('DELETE /api/v1/greenhouses/{id}', function () {
    it('soft deletes the greenhouse and returns 204', function () {
        $user = actingAsUser();
        $greenhouse = Greenhouse::factory()->for($user)->create();

        $this->deleteJson("/api/v1/greenhouses/{$greenhouse->id}")->assertNoContent();

        $this->assertSoftDeleted('greenhouses', ['id' => $greenhouse->id]);
    });

    it('returns 403 when deleting another user\'s greenhouse', function () {
        actingAsUser();
        $other = Greenhouse::factory()->create();

        $this->deleteJson("/api/v1/greenhouses/{$other->id}")->assertForbidden();
    });

    it('returns 401 when unauthenticated', function () {
        $greenhouse = Greenhouse::factory()->create();

        $this->deleteJson("/api/v1/greenhouses/{$greenhouse->id}")->assertUnauthorized();
    });
});
