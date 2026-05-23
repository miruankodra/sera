<?php

use App\Models\Greenhouse;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;

// ── GET /api/v1/user ─────────────────────────────────────────────────────────

describe('GET /api/v1/user', function () {
    it('returns the authenticated user profile with correct shape', function () {
        $user = actingAsUser();
        Greenhouse::factory()->count(3)->for($user)->create();

        $this->getJson('/api/v1/user')
            ->assertOk()
            ->assertJsonStructure([
                'data' => [
                    'id', 'name', 'email', 'avatar_url',
                    'timezone', 'locale', 'notification_preferences',
                    'greenhouses_count', 'created_at',
                ],
            ])
            ->assertJsonPath('data.greenhouses_count', 3)
            ->assertJsonPath('data.email', $user->email);
    });

    it('returns 401 when unauthenticated', function () {
        $this->getJson('/api/v1/user')->assertUnauthorized();
    });
});

// ── PUT /api/v1/user ──────────────────────────────────────────────────────────

describe('PUT /api/v1/user', function () {
    it('updates name, email, timezone, locale and notification_preferences', function () {
        $user = actingAsUser();

        $this->putJson('/api/v1/user', [
            'name' => 'Elona Hoxha',
            'email' => 'elona@example.com',
            'timezone' => 'Europe/Tirane',
            'locale' => 'sq',
            'notification_preferences' => ['alerts' => false, 'automation' => true, 'tasks' => true],
        ])
            ->assertOk()
            ->assertJsonPath('data.name', 'Elona Hoxha')
            ->assertJsonPath('data.email', 'elona@example.com')
            ->assertJsonPath('data.timezone', 'Europe/Tirane')
            ->assertJsonPath('data.locale', 'sq')
            ->assertJsonPath('data.notification_preferences.alerts', false);

        $this->assertDatabaseHas('users', ['id' => $user->id, 'name' => 'Elona Hoxha']);
    });

    it('returns 422 when email is taken by another user', function () {
        User::factory()->create(['email' => 'taken@example.com']);
        actingAsUser();

        $this->putJson('/api/v1/user', ['name' => 'X', 'email' => 'taken@example.com'])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['email']);
    });

    it('allows keeping the same email', function () {
        $user = actingAsUser(['email' => 'same@example.com']);

        $this->putJson('/api/v1/user', ['name' => 'New Name', 'email' => 'same@example.com'])
            ->assertOk()
            ->assertJsonPath('data.email', 'same@example.com');
    });

    it('returns 401 when unauthenticated', function () {
        $this->putJson('/api/v1/user', ['name' => 'X'])->assertUnauthorized();
    });
});

// ── PUT /api/v1/user/password ─────────────────────────────────────────────────

describe('PUT /api/v1/user/password', function () {
    it('changes password when current_password is correct', function () {
        $user = actingAsUser(['password' => Hash::make('oldpassword')]);

        $this->putJson('/api/v1/user/password', [
            'current_password' => 'oldpassword',
            'password' => 'newpassword1',
            'password_confirmation' => 'newpassword1',
        ])->assertNoContent();

        expect(Hash::check('newpassword1', $user->fresh()->password))->toBeTrue();
    });

    it('returns 422 when current_password is wrong', function () {
        actingAsUser(['password' => Hash::make('correctpassword')]);

        $this->putJson('/api/v1/user/password', [
            'current_password' => 'wrongpassword',
            'password' => 'newpassword1',
            'password_confirmation' => 'newpassword1',
        ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['current_password']);
    });

    it('returns 422 when new password confirmation does not match', function () {
        actingAsUser(['password' => Hash::make('oldpassword')]);

        $this->putJson('/api/v1/user/password', [
            'current_password' => 'oldpassword',
            'password' => 'newpassword1',
            'password_confirmation' => 'different',
        ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['password']);
    });

    it('returns 401 when unauthenticated', function () {
        $this->putJson('/api/v1/user/password', [])->assertUnauthorized();
    });
});

// ── POST /api/v1/user/avatar ──────────────────────────────────────────────────

describe('POST /api/v1/user/avatar', function () {
    it('stores the avatar and returns the public URL', function () {
        Storage::fake('public');
        $user = actingAsUser();

        $file = UploadedFile::fake()->create('avatar.jpg', 100, 'image/jpeg');

        $this->postJson('/api/v1/user/avatar', ['avatar' => $file])
            ->assertOk()
            ->assertJsonStructure(['data' => ['avatar_url']])
            ->assertJsonPath('data.avatar_url', fn ($url) => str_contains($url, 'avatars/'));

        $this->assertNotNull($user->fresh()->avatar);
        Storage::disk('public')->assertExists('avatars/' . basename($user->fresh()->avatar));
    });

    it('deletes the old avatar before storing the new one', function () {
        Storage::fake('public');
        $user = actingAsUser(['avatar' => 'avatars/old-avatar.jpg']);
        Storage::disk('public')->put('avatars/old-avatar.jpg', 'old content');

        $this->postJson('/api/v1/user/avatar', ['avatar' => UploadedFile::fake()->create('new.jpg', 100, 'image/jpeg')])
            ->assertOk();

        Storage::disk('public')->assertMissing('avatars/old-avatar.jpg');
    });

    it('returns 422 when no file is provided', function () {
        actingAsUser();

        $this->postJson('/api/v1/user/avatar', [])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['avatar']);
    });

    it('returns 422 when file is not an image', function () {
        actingAsUser();

        $file = UploadedFile::fake()->create('document.pdf', 100, 'application/pdf');

        $this->postJson('/api/v1/user/avatar', ['avatar' => $file])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['avatar']);
    });

    it('returns 401 when unauthenticated', function () {
        $this->postJson('/api/v1/user/avatar', [])->assertUnauthorized();
    });
});

// ── DELETE /api/v1/user/avatar ────────────────────────────────────────────────

describe('DELETE /api/v1/user/avatar', function () {
    it('removes the avatar and sets avatar_url to null', function () {
        Storage::fake('public');
        $user = actingAsUser(['avatar' => 'avatars/existing.jpg']);
        Storage::disk('public')->put('avatars/existing.jpg', 'content');

        $this->deleteJson('/api/v1/user/avatar')
            ->assertOk()
            ->assertJsonPath('data.avatar_url', null);

        $this->assertNull($user->fresh()->avatar);
        Storage::disk('public')->assertMissing('avatars/existing.jpg');
    });

    it('succeeds even when no avatar is set', function () {
        actingAsUser(['avatar' => null]);

        $this->deleteJson('/api/v1/user/avatar')
            ->assertOk()
            ->assertJsonPath('data.avatar_url', null);
    });

    it('returns 401 when unauthenticated', function () {
        $this->deleteJson('/api/v1/user/avatar')->assertUnauthorized();
    });
});
