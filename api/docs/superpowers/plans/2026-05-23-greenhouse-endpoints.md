# Greenhouse Endpoints Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement full CRUD REST API endpoints for greenhouses, restricted to the owning user, with soft deletes and complete Pest feature test coverage.

**Architecture:** A standard Laravel resource API under `/api/v1/greenhouses` using a `GreenhousePolicy` for authorization (auto-discovered via Laravel's naming convention), `GreenhouseResource` for response shaping, and two form request classes for validation. All five methods live in a single `GreenhouseController`.

**Tech Stack:** Laravel 13, Sanctum (auth), Eloquent SoftDeletes (already on model + migration), Pest 4

---

## File Map

| Action | Path | Responsibility |
|--------|------|----------------|
| Modify | `tests/Pest.php` | Move `actingAsUser()` here so all test files share it |
| Modify | `tests/Feature/Api/V1/UserTest.php` | Remove local `actingAsUser()` definition |
| Create | `tests/Feature/Api/V1/GreenhouseTest.php` | All greenhouse feature tests |
| Create | `app/Http/Resources/GreenhouseResource.php` | Response shape |
| Create | `app/Http/Requests/Greenhouse/StoreGreenhouseRequest.php` | Create validation |
| Create | `app/Http/Requests/Greenhouse/UpdateGreenhouseRequest.php` | Update validation |
| Create | `app/Policies/GreenhousePolicy.php` | Authorization (auto-discovered, no registration needed) |
| Create | `app/Http/Controllers/Api/V1/GreenhouseController.php` | index, store, show, update, destroy |
| Modify | `routes/api.php` | 5 greenhouse routes inside `auth:sanctum` group |

---

## Task 1: Promote `actingAsUser()` to shared helper

`actingAsUser()` is currently defined in `UserTest.php`. PHP will fatal-error if `GreenhouseTest.php` redeclares it, so it must live in `Pest.php` where it is loaded once and available to all Feature tests.

**Files:**
- Modify: `tests/Pest.php`
- Modify: `tests/Feature/Api/V1/UserTest.php`

- [ ] **Step 1: Add helper to Pest.php**

Open `tests/Pest.php`. Replace the empty `something()` placeholder with:

```php
use App\Models\User;

function actingAsUser(?array $overrides = []): User
{
    $user = User::factory()->create($overrides);
    test()->actingAs($user, 'sanctum');

    return $user;
}
```

The full file should look like:

```php
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
```

- [ ] **Step 2: Remove the duplicate definition from UserTest.php**

Delete lines 9–17 from `tests/Feature/Api/V1/UserTest.php` (the `// ── helpers ──` comment block and the `actingAsUser()` function). The file should begin:

```php
<?php

use App\Models\Greenhouse;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;

// ── GET /api/v1/user ─────────────────────────────────────────────────────────
```

- [ ] **Step 3: Run UserTest to confirm nothing broke**

```bash
cd api && php artisan test --compact --filter=UserTest
```

Expected: all existing user tests still pass (no redeclaration error).

- [ ] **Step 4: Commit**

```bash
git add tests/Pest.php tests/Feature/Api/V1/UserTest.php
git commit -m "refactor: move actingAsUser helper to Pest.php"
```

---

## Task 2: Write failing greenhouse tests

Create the full test file. Every test will fail at this point (routes don't exist yet) — that is correct TDD behaviour.

**Files:**
- Create: `tests/Feature/Api/V1/GreenhouseTest.php`

- [ ] **Step 1: Scaffold the test file**

```bash
php artisan make:test --pest Api/V1/GreenhouseTest
```

- [ ] **Step 2: Replace the scaffolded content with the full test suite**

```php
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
```

- [ ] **Step 3: Run the new tests to confirm they all fail**

```bash
php artisan test --compact --filter=GreenhouseTest
```

Expected: all 16 tests fail (404 — routes do not exist yet).

- [ ] **Step 4: Commit**

```bash
git add tests/Feature/Api/V1/GreenhouseTest.php
git commit -m "test: add failing greenhouse feature tests"
```

---

## Task 3: Create GreenhouseResource

**Files:**
- Create: `app/Http/Resources/GreenhouseResource.php`

- [ ] **Step 1: Scaffold**

```bash
php artisan make:resource GreenhouseResource --no-interaction
```

- [ ] **Step 2: Implement the resource**

Replace the scaffolded body of `app/Http/Resources/GreenhouseResource.php`:

```php
<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class GreenhouseResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'user_id' => $this->user_id,
            'name' => $this->name,
            'description' => $this->description,
            'location' => $this->location,
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
```

- [ ] **Step 3: Commit**

```bash
git add app/Http/Resources/GreenhouseResource.php
git commit -m "feat: add GreenhouseResource"
```

---

## Task 4: Create form requests

**Files:**
- Create: `app/Http/Requests/Greenhouse/StoreGreenhouseRequest.php`
- Create: `app/Http/Requests/Greenhouse/UpdateGreenhouseRequest.php`

- [ ] **Step 1: Scaffold both requests**

```bash
php artisan make:request Greenhouse/StoreGreenhouseRequest --no-interaction
php artisan make:request Greenhouse/UpdateGreenhouseRequest --no-interaction
```

- [ ] **Step 2: Implement StoreGreenhouseRequest**

Replace the body of `app/Http/Requests/Greenhouse/StoreGreenhouseRequest.php`:

```php
<?php

namespace App\Http\Requests\Greenhouse;

use Illuminate\Foundation\Http\FormRequest;

class StoreGreenhouseRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'location' => ['nullable', 'string', 'max:255'],
        ];
    }
}
```

- [ ] **Step 3: Implement UpdateGreenhouseRequest**

Replace the body of `app/Http/Requests/Greenhouse/UpdateGreenhouseRequest.php`:

```php
<?php

namespace App\Http\Requests\Greenhouse;

use Illuminate\Foundation\Http\FormRequest;

class UpdateGreenhouseRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['sometimes', 'string', 'max:255'],
            'description' => ['sometimes', 'nullable', 'string'],
            'location' => ['sometimes', 'nullable', 'string', 'max:255'],
        ];
    }
}
```

- [ ] **Step 4: Commit**

```bash
git add app/Http/Requests/Greenhouse/
git commit -m "feat: add StoreGreenhouseRequest and UpdateGreenhouseRequest"
```

---

## Task 5: Create GreenhousePolicy

Laravel auto-discovers `App\Policies\GreenhousePolicy` for `App\Models\Greenhouse` — no `AuthServiceProvider` registration needed.

**Files:**
- Create: `app/Policies/GreenhousePolicy.php`

- [ ] **Step 1: Scaffold**

```bash
php artisan make:policy GreenhousePolicy --model=Greenhouse --no-interaction
```

- [ ] **Step 2: Implement the policy**

Replace the scaffolded body of `app/Policies/GreenhousePolicy.php`:

```php
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
```

- [ ] **Step 3: Commit**

```bash
git add app/Policies/GreenhousePolicy.php
git commit -m "feat: add GreenhousePolicy"
```

---

## Task 6: Create GreenhouseController

**Files:**
- Create: `app/Http/Controllers/Api/V1/GreenhouseController.php`

- [ ] **Step 1: Scaffold**

```bash
php artisan make:controller Api/V1/GreenhouseController --no-interaction
```

- [ ] **Step 2: Implement all five methods**

Replace the scaffolded body of `app/Http/Controllers/Api/V1/GreenhouseController.php`:

```php
<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Greenhouse\StoreGreenhouseRequest;
use App\Http\Requests\Greenhouse\UpdateGreenhouseRequest;
use App\Http\Resources\GreenhouseResource;
use App\Models\Greenhouse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class GreenhouseController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        return response()->json([
            'data' => GreenhouseResource::collection($request->user()->greenhouses),
        ]);
    }

    public function store(StoreGreenhouseRequest $request): JsonResponse
    {
        $greenhouse = $request->user()->greenhouses()->create($request->validated());

        return response()->json([
            'data' => new GreenhouseResource($greenhouse),
        ], 201);
    }

    public function show(Request $request, Greenhouse $greenhouse): JsonResponse
    {
        $this->authorize('view', $greenhouse);

        return response()->json([
            'data' => new GreenhouseResource($greenhouse),
        ]);
    }

    public function update(UpdateGreenhouseRequest $request, Greenhouse $greenhouse): JsonResponse
    {
        $this->authorize('update', $greenhouse);

        $greenhouse->update($request->validated());

        return response()->json([
            'data' => new GreenhouseResource($greenhouse->fresh()),
        ]);
    }

    public function destroy(Request $request, Greenhouse $greenhouse): Response
    {
        $this->authorize('delete', $greenhouse);

        $greenhouse->delete();

        return response()->noContent();
    }
}
```

- [ ] **Step 3: Commit**

```bash
git add app/Http/Controllers/Api/V1/GreenhouseController.php
git commit -m "feat: add GreenhouseController"
```

---

## Task 7: Register routes

**Files:**
- Modify: `routes/api.php`

- [ ] **Step 1: Add greenhouse routes to api.php**

Open `routes/api.php`. Add the `GreenhouseController` import and five routes inside the existing `auth:sanctum` middleware group. The full file should look like:

```php
<?php

use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\GreenhouseController;
use App\Http\Controllers\Api\V1\UserController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {
    Route::prefix('auth')->group(function () {
        Route::post('register', [AuthController::class, 'register']);
        Route::post('login', [AuthController::class, 'login']);
        Route::post('logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');
    });

    Route::middleware('auth:sanctum')->group(function () {
        Route::get('user', [UserController::class, 'show']);
        Route::put('user', [UserController::class, 'update']);
        Route::put('user/password', [UserController::class, 'updatePassword']);
        Route::post('user/avatar', [UserController::class, 'uploadAvatar']);
        Route::delete('user/avatar', [UserController::class, 'deleteAvatar']);

        Route::get('greenhouses', [GreenhouseController::class, 'index']);
        Route::post('greenhouses', [GreenhouseController::class, 'store']);
        Route::get('greenhouses/{greenhouse}', [GreenhouseController::class, 'show']);
        Route::put('greenhouses/{greenhouse}', [GreenhouseController::class, 'update']);
        Route::delete('greenhouses/{greenhouse}', [GreenhouseController::class, 'destroy']);
    });
});
```

- [ ] **Step 2: Verify routes are registered**

```bash
php artisan route:list --path=greenhouses --except-vendor
```

Expected output shows 5 routes: GET/POST for `/api/v1/greenhouses` and GET/PUT/DELETE for `/api/v1/greenhouses/{greenhouse}`.

- [ ] **Step 3: Commit**

```bash
git add routes/api.php
git commit -m "feat: register greenhouse API routes"
```

---

## Task 8: Run all tests and format

- [ ] **Step 1: Run the full greenhouse test suite**

```bash
php artisan test --compact --filter=GreenhouseTest
```

Expected: all 16 greenhouse tests pass.

- [ ] **Step 2: Run the full suite to check for regressions**

```bash
php artisan test --compact
```

Expected: all tests pass (greenhouse + existing auth/user tests).

- [ ] **Step 3: Run Pint on modified PHP files**

```bash
vendor/bin/pint --dirty --format agent
```

Fix any formatting issues Pint reports, then re-run the tests to confirm they still pass.

- [ ] **Step 4: Commit**

```bash
git add -p  # stage only Pint-touched files
git commit -m "style: apply Pint formatting to greenhouse files"
```
