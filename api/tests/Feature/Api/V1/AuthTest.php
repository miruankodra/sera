<?php

use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Laravel\Sanctum\PersonalAccessToken;

describe('POST /api/v1/auth/register', function () {
    it('registers a new user and returns 201 with user data', function () {
        $response = $this->postJson('/api/v1/auth/register', [
            'name' => 'Arben Krasniqi',
            'email' => 'arben@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ]);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'data' => ['id', 'name', 'email'],
            ]);

        $this->assertDatabaseHas('users', ['email' => 'arben@example.com']);
    });

    it('returns 422 when name is missing', function () {
        $this->postJson('/api/v1/auth/register', [
            'email' => 'arben@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ])->assertStatus(422)->assertJsonValidationErrors(['name']);
    });

    it('returns 422 when email is already taken', function () {
        User::factory()->create(['email' => 'arben@example.com']);

        $this->postJson('/api/v1/auth/register', [
            'name' => 'Arben Krasniqi',
            'email' => 'arben@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ])->assertStatus(422)->assertJsonValidationErrors(['email']);
    });

    it('returns 422 when password confirmation does not match', function () {
        $this->postJson('/api/v1/auth/register', [
            'name' => 'Arben Krasniqi',
            'email' => 'arben@example.com',
            'password' => 'password123',
            'password_confirmation' => 'different',
        ])->assertStatus(422)->assertJsonValidationErrors(['password']);
    });
});

describe('POST /api/v1/auth/login', function () {
    it('returns a token on successful login', function () {
        User::factory()->create([
            'email' => 'arben@example.com',
            'password' => Hash::make('password123'),
        ]);

        $response = $this->postJson('/api/v1/auth/login', [
            'email' => 'arben@example.com',
            'password' => 'password123',
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    'token',
                    'user' => ['id', 'name', 'email'],
                ],
            ]);
    });

    it('returns 422 for invalid credentials', function () {
        User::factory()->create([
            'email' => 'arben@example.com',
            'password' => Hash::make('password123'),
        ]);

        $this->postJson('/api/v1/auth/login', [
            'email' => 'arben@example.com',
            'password' => 'wrongpassword',
        ])->assertStatus(422)->assertJsonValidationErrors(['email']);
    });

    it('returns 422 when email does not exist', function () {
        $this->postJson('/api/v1/auth/login', [
            'email' => 'nobody@example.com',
            'password' => 'password123',
        ])->assertStatus(422)->assertJsonValidationErrors(['email']);
    });

    it('returns 422 when email format is invalid', function () {
        $this->postJson('/api/v1/auth/login', [
            'email' => 'not-an-email',
            'password' => 'password123',
        ])->assertStatus(422)->assertJsonValidationErrors(['email']);
    });
});

describe('POST /api/v1/auth/logout', function () {
    it('logs out and invalidates the token', function () {
        $user = User::factory()->create();
        $token = $user->createToken('test-device')->plainTextToken;

        $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson('/api/v1/auth/logout')
            ->assertStatus(204);

        // Token must no longer exist in the database
        $tokenId = explode('|', $token)[0];
        $this->assertDatabaseMissing('personal_access_tokens', ['id' => $tokenId]);
    });

    it('returns 401 when called without a token', function () {
        $this->postJson('/api/v1/auth/logout')
            ->assertStatus(401);
    });
});
