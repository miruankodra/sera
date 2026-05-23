# Task 7: Sensors + Readings Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement all sensor and sensor_reading endpoints, fire `SensorReadingCreated` event on ingestion, and support `?from=&to=` date range filtering on readings.

**Architecture:** Thin controllers delegate nothing (business logic is trivial here) and call `Gate::authorize()` directly — base Controller has no `AuthorizesRequests` trait. A `SensorPolicy` authorises sensor access by checking greenhouse ownership. The ingestion endpoint (`POST /sensors/{id}/readings`) fires an event after INSERT and must stay fast (no sync rule evaluation). All commands run inside Docker: `docker exec sera-app-1 <command>`.

**Tech Stack:** Laravel 11, PHP 8.3, Pest 3, Sanctum, MySQL 8 (inside Docker), `Illuminate\Support\Facades\Gate`

---

## File Map

| Action | Path |
|--------|------|
| Create | `app/Http/Controllers/Api/V1/SensorController.php` |
| Create | `app/Http/Controllers/Api/V1/SensorReadingController.php` |
| Create | `app/Http/Requests/Sensor/StoreSensorRequest.php` |
| Create | `app/Http/Requests/SensorReading/StoreSensorReadingRequest.php` |
| Create | `app/Http/Resources/SensorResource.php` |
| Create | `app/Http/Resources/SensorReadingResource.php` |
| Create | `app/Policies/SensorPolicy.php` |
| Create | `app/Events/SensorReadingCreated.php` |
| Modify | `routes/api.php` |
| Create | `tests/Feature/Api/V1/SensorTest.php` |

---

### Task 1: SensorPolicy

Sensors are accessible only when the authenticated user owns the parent greenhouse.

**Files:**
- Create: `app/Policies/SensorPolicy.php`

- [ ] **Step 1: Write the policy**

```php
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
```

Save to `api/app/Policies/SensorPolicy.php`.

- [ ] **Step 2: Verify Sensor model has `greenhouse` relation with eager-loadable `user_id`**

Run: `docker exec sera-app-1 php artisan tinker --execute="App\Models\Sensor::with('greenhouse')->first()?->greenhouse?->user_id ?? 'ok'"`

Expected: a numeric ID or `null` (no data), never an error about undefined relation.

- [ ] **Step 3: Commit**

```bash
git add api/app/Policies/SensorPolicy.php
git commit -m "feat: add SensorPolicy"
```

---

### Task 2: FormRequests

**Files:**
- Create: `app/Http/Requests/Sensor/StoreSensorRequest.php`
- Create: `app/Http/Requests/SensorReading/StoreSensorReadingRequest.php`

- [ ] **Step 1: Write StoreSensorRequest**

```php
<?php

namespace App\Http\Requests\Sensor;

use Illuminate\Foundation\Http\FormRequest;

class StoreSensorRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // authorization handled in controller via Gate
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'type' => ['required', 'string', 'max:255'],
            'unit' => ['required', 'string', 'max:50'],
            'is_active' => ['sometimes', 'boolean'],
        ];
    }
}
```

Save to `api/app/Http/Requests/Sensor/StoreSensorRequest.php`.

- [ ] **Step 2: Write StoreSensorReadingRequest**

```php
<?php

namespace App\Http\Requests\SensorReading;

use Illuminate\Foundation\Http\FormRequest;

class StoreSensorReadingRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'value' => ['required', 'numeric'],
            'recorded_at' => ['required', 'date'],
        ];
    }
}
```

Save to `api/app/Http/Requests/SensorReading/StoreSensorReadingRequest.php`.

- [ ] **Step 3: Commit**

```bash
git add api/app/Http/Requests/Sensor/StoreSensorRequest.php api/app/Http/Requests/SensorReading/StoreSensorReadingRequest.php
git commit -m "feat: add sensor form requests"
```

---

### Task 3: API Resources

**Files:**
- Create: `app/Http/Resources/SensorResource.php`
- Create: `app/Http/Resources/SensorReadingResource.php`

- [ ] **Step 1: Write SensorResource**

```php
<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SensorResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'greenhouse_id' => $this->greenhouse_id,
            'name' => $this->name,
            'type' => $this->type,
            'unit' => $this->unit,
            'is_active' => $this->is_active,
            'created_at' => $this->created_at->toIso8601String(),
            'updated_at' => $this->updated_at->toIso8601String(),
        ];
    }
}
```

Save to `api/app/Http/Resources/SensorResource.php`.

- [ ] **Step 2: Write SensorReadingResource**

```php
<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SensorReadingResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'sensor_id' => $this->sensor_id,
            'value' => $this->value,
            'recorded_at' => $this->recorded_at->toIso8601String(),
            'created_at' => $this->created_at->toIso8601String(),
        ];
    }
}
```

Save to `api/app/Http/Resources/SensorReadingResource.php`.

- [ ] **Step 3: Commit**

```bash
git add api/app/Http/Resources/SensorResource.php api/app/Http/Resources/SensorReadingResource.php
git commit -m "feat: add sensor API resources"
```

---

### Task 4: SensorReadingCreated Event

**Files:**
- Create: `app/Events/SensorReadingCreated.php`

NOTE: The `app/Events/` directory does not exist yet — create it.

- [ ] **Step 1: Create the Events directory and write the event**

```php
<?php

namespace App\Events;

use App\Models\SensorReading;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class SensorReadingCreated
{
    use Dispatchable, SerializesModels;

    public function __construct(public readonly SensorReading $reading) {}
}
```

Save to `api/app/Events/SensorReadingCreated.php`.

- [ ] **Step 2: Verify class loads cleanly**

Run: `docker exec sera-app-1 php artisan tinker --execute="new App\Events\SensorReadingCreated(new App\Models\SensorReading(['sensor_id'=>1,'value'=>22.5,'recorded_at'=>now()])); echo 'ok';"`

Expected: `ok` with no errors.

- [ ] **Step 3: Commit**

```bash
git add api/app/Events/SensorReadingCreated.php
git commit -m "feat: add SensorReadingCreated event"
```

---

### Task 5: SensorController

**Files:**
- Create: `app/Http/Controllers/Api/V1/SensorController.php`

The controller handles 4 endpoints:
- `GET /greenhouses/{greenhouse}/sensors` — list
- `POST /greenhouses/{greenhouse}/sensors` — store (authorize that user owns greenhouse)
- `GET /sensors/{sensor}` — show
- `DELETE /sensors/{sensor}` — destroy

Authorization uses `Gate::authorize()` because the base Controller has no `AuthorizesRequests` trait.

- [ ] **Step 1: Write SensorController**

```php
<?php

namespace App\Http\Controllers\Api\V1;

use App\Events\SensorReadingCreated;
use App\Http\Controllers\Controller;
use App\Http\Requests\Sensor\StoreSensorRequest;
use App\Http\Resources\SensorResource;
use App\Models\Greenhouse;
use App\Models\Sensor;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Gate;

class SensorController extends Controller
{
    public function index(Greenhouse $greenhouse): JsonResponse
    {
        Gate::authorize('view', $greenhouse);

        return response()->json([
            'data' => SensorResource::collection($greenhouse->sensors),
        ]);
    }

    public function store(StoreSensorRequest $request, Greenhouse $greenhouse): JsonResponse
    {
        Gate::authorize('view', $greenhouse);

        $sensor = $greenhouse->sensors()->create($request->validated());

        return response()->json(['data' => new SensorResource($sensor)], 201);
    }

    public function show(Sensor $sensor): JsonResponse
    {
        Gate::authorize('view', $sensor);

        return response()->json(['data' => new SensorResource($sensor)]);
    }

    public function destroy(Sensor $sensor): Response
    {
        Gate::authorize('delete', $sensor);

        $sensor->delete();

        return response()->noContent();
    }
}
```

Save to `api/app/Http/Controllers/Api/V1/SensorController.php`.

- [ ] **Step 2: Commit**

```bash
git add api/app/Http/Controllers/Api/V1/SensorController.php
git commit -m "feat: add SensorController"
```

---

### Task 6: SensorReadingController

**Files:**
- Create: `app/Http/Controllers/Api/V1/SensorReadingController.php`

Handles 2 endpoints:
- `POST /sensors/{sensor}/readings` — ingest; fires `SensorReadingCreated` event; must be fast (no sync rule evaluation)
- `GET /sensors/{sensor}/readings` — list with optional `?from=` and `?to=` ISO date filters

- [ ] **Step 1: Write SensorReadingController**

```php
<?php

namespace App\Http\Controllers\Api\V1;

use App\Events\SensorReadingCreated;
use App\Http\Controllers\Controller;
use App\Http\Requests\SensorReading\StoreSensorReadingRequest;
use App\Http\Resources\SensorReadingResource;
use App\Models\Sensor;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class SensorReadingController extends Controller
{
    public function store(StoreSensorReadingRequest $request, Sensor $sensor): JsonResponse
    {
        Gate::authorize('storeReading', $sensor);

        $reading = $sensor->readings()->create($request->validated());

        SensorReadingCreated::dispatch($reading);

        return response()->json(['data' => new SensorReadingResource($reading)], 201);
    }

    public function index(Request $request, Sensor $sensor): JsonResponse
    {
        Gate::authorize('viewReadings', $sensor);

        $query = $sensor->readings()->orderBy('recorded_at', 'desc');

        if ($request->filled('from')) {
            $query->where('recorded_at', '>=', $request->input('from'));
        }

        if ($request->filled('to')) {
            $query->where('recorded_at', '<=', $request->input('to'));
        }

        return response()->json([
            'data' => SensorReadingResource::collection($query->get()),
        ]);
    }
}
```

Save to `api/app/Http/Controllers/Api/V1/SensorReadingController.php`.

- [ ] **Step 2: Commit**

```bash
git add api/app/Http/Controllers/Api/V1/SensorReadingController.php
git commit -m "feat: add SensorReadingController"
```

---

### Task 7: Routes

**Files:**
- Modify: `routes/api.php`

Add sensor and sensor reading routes inside the existing `auth:sanctum` middleware group.

- [ ] **Step 1: Read current routes/api.php to identify insertion point**

The file currently ends with greenhouse routes. Add after them, before the closing `});` of the `auth:sanctum` group.

- [ ] **Step 2: Add the imports and routes**

Add to the top of `routes/api.php` (with existing `use` statements):
```php
use App\Http\Controllers\Api\V1\SensorController;
use App\Http\Controllers\Api\V1\SensorReadingController;
```

Add inside the `auth:sanctum` middleware group after the greenhouse routes:
```php
Route::get('greenhouses/{greenhouse}/sensors', [SensorController::class, 'index']);
Route::post('greenhouses/{greenhouse}/sensors', [SensorController::class, 'store']);
Route::get('sensors/{sensor}', [SensorController::class, 'show']);
Route::delete('sensors/{sensor}', [SensorController::class, 'destroy']);
Route::post('sensors/{sensor}/readings', [SensorReadingController::class, 'store']);
Route::get('sensors/{sensor}/readings', [SensorReadingController::class, 'index']);
```

- [ ] **Step 3: Verify routes are registered**

Run: `docker exec sera-app-1 php artisan route:list --path=api/v1/sensor`

Expected: 6 rows including the sensor and reading routes.

- [ ] **Step 4: Commit**

```bash
git add api/routes/api.php
git commit -m "feat: register sensor and reading routes"
```

---

### Task 8: Pest Feature Tests

**Files:**
- Create: `tests/Feature/Api/V1/SensorTest.php`

Tests run inside Docker: `docker exec sera-app-1 php artisan test --compact --filter=SensorTest`

The `actingAsUser()` helper is defined in `tests/Pest.php` and creates + authenticates a Sanctum user.

- [ ] **Step 1: Write the test file**

```php
<?php

use App\Models\Greenhouse;
use App\Models\Sensor;
use App\Models\SensorReading;
use App\Events\SensorReadingCreated;
use Illuminate\Support\Facades\Event;

// ── Sensor CRUD ──────────────────────────────────────────────────────────────

test('authenticated user can list sensors for their greenhouse', function () {
    $user = actingAsUser();
    $greenhouse = Greenhouse::factory()->for($user)->create();
    Sensor::factory()->for($greenhouse)->count(3)->create();

    $response = $this->getJson("/api/v1/greenhouses/{$greenhouse->id}/sensors");

    $response->assertOk()->assertJsonCount(3, 'data');
});

test('listing sensors returns 401 when unauthenticated', function () {
    $greenhouse = Greenhouse::factory()->create();

    $this->getJson("/api/v1/greenhouses/{$greenhouse->id}/sensors")
        ->assertUnauthorized();
});

test('listing sensors returns 403 for another user greenhouse', function () {
    actingAsUser();
    $other = Greenhouse::factory()->create();

    $this->getJson("/api/v1/greenhouses/{$other->id}/sensors")
        ->assertForbidden();
});

test('authenticated user can create a sensor', function () {
    $user = actingAsUser();
    $greenhouse = Greenhouse::factory()->for($user)->create();

    $payload = [
        'name' => 'Temp Sensor A',
        'type' => 'temperature',
        'unit' => '°C',
    ];

    $response = $this->postJson("/api/v1/greenhouses/{$greenhouse->id}/sensors", $payload);

    $response->assertCreated()
        ->assertJsonPath('data.name', 'Temp Sensor A')
        ->assertJsonPath('data.type', 'temperature')
        ->assertJsonPath('data.unit', '°C')
        ->assertJsonPath('data.is_active', true);

    $this->assertDatabaseHas('sensors', ['name' => 'Temp Sensor A', 'greenhouse_id' => $greenhouse->id]);
});

test('creating sensor returns 401 when unauthenticated', function () {
    $greenhouse = Greenhouse::factory()->create();

    $this->postJson("/api/v1/greenhouses/{$greenhouse->id}/sensors", [
        'name' => 'X', 'type' => 'temperature', 'unit' => '°C',
    ])->assertUnauthorized();
});

test('creating sensor returns 403 for another user greenhouse', function () {
    actingAsUser();
    $other = Greenhouse::factory()->create();

    $this->postJson("/api/v1/greenhouses/{$other->id}/sensors", [
        'name' => 'X', 'type' => 'temperature', 'unit' => '°C',
    ])->assertForbidden();
});

test('creating sensor returns 422 when required fields are missing', function () {
    $user = actingAsUser();
    $greenhouse = Greenhouse::factory()->for($user)->create();

    $this->postJson("/api/v1/greenhouses/{$greenhouse->id}/sensors", [])
        ->assertUnprocessable();
});

test('authenticated user can view their sensor', function () {
    $user = actingAsUser();
    $greenhouse = Greenhouse::factory()->for($user)->create();
    $sensor = Sensor::factory()->for($greenhouse)->create();

    $this->getJson("/api/v1/sensors/{$sensor->id}")
        ->assertOk()
        ->assertJsonPath('data.id', $sensor->id);
});

test('viewing sensor returns 401 when unauthenticated', function () {
    $sensor = Sensor::factory()->create();

    $this->getJson("/api/v1/sensors/{$sensor->id}")->assertUnauthorized();
});

test('viewing sensor returns 403 for another user sensor', function () {
    actingAsUser();
    $other = Sensor::factory()->create();

    $this->getJson("/api/v1/sensors/{$other->id}")->assertForbidden();
});

test('authenticated user can delete their sensor', function () {
    $user = actingAsUser();
    $greenhouse = Greenhouse::factory()->for($user)->create();
    $sensor = Sensor::factory()->for($greenhouse)->create();

    $this->deleteJson("/api/v1/sensors/{$sensor->id}")->assertNoContent();

    $this->assertDatabaseMissing('sensors', ['id' => $sensor->id]);
});

test('deleting sensor returns 401 when unauthenticated', function () {
    $sensor = Sensor::factory()->create();

    $this->deleteJson("/api/v1/sensors/{$sensor->id}")->assertUnauthorized();
});

test('deleting sensor returns 403 for another user sensor', function () {
    actingAsUser();
    $other = Sensor::factory()->create();

    $this->deleteJson("/api/v1/sensors/{$other->id}")->assertForbidden();
});

// ── Sensor Readings ───────────────────────────────────────────────────────────

test('ingesting a reading fires SensorReadingCreated event', function () {
    Event::fake([SensorReadingCreated::class]);

    $user = actingAsUser();
    $greenhouse = Greenhouse::factory()->for($user)->create();
    $sensor = Sensor::factory()->for($greenhouse)->create();

    $this->postJson("/api/v1/sensors/{$sensor->id}/readings", [
        'value' => 22.5,
        'recorded_at' => now()->toIso8601String(),
    ])->assertCreated();

    Event::assertDispatched(SensorReadingCreated::class);
});

test('ingesting a reading persists to database', function () {
    $user = actingAsUser();
    $greenhouse = Greenhouse::factory()->for($user)->create();
    $sensor = Sensor::factory()->for($greenhouse)->create();

    $this->postJson("/api/v1/sensors/{$sensor->id}/readings", [
        'value' => 18.75,
        'recorded_at' => '2026-05-23T10:00:00Z',
    ])->assertCreated()
        ->assertJsonPath('data.value', '18.7500')
        ->assertJsonPath('data.sensor_id', $sensor->id);

    $this->assertDatabaseHas('sensor_readings', [
        'sensor_id' => $sensor->id,
        'value' => '18.7500',
    ]);
});

test('ingesting reading returns 401 when unauthenticated', function () {
    $sensor = Sensor::factory()->create();

    $this->postJson("/api/v1/sensors/{$sensor->id}/readings", [
        'value' => 22.5, 'recorded_at' => now()->toIso8601String(),
    ])->assertUnauthorized();
});

test('ingesting reading returns 403 for another user sensor', function () {
    actingAsUser();
    $other = Sensor::factory()->create();

    $this->postJson("/api/v1/sensors/{$other->id}/readings", [
        'value' => 22.5, 'recorded_at' => now()->toIso8601String(),
    ])->assertForbidden();
});

test('ingesting reading returns 422 when value is missing', function () {
    $user = actingAsUser();
    $greenhouse = Greenhouse::factory()->for($user)->create();
    $sensor = Sensor::factory()->for($greenhouse)->create();

    $this->postJson("/api/v1/sensors/{$sensor->id}/readings", [
        'recorded_at' => now()->toIso8601String(),
    ])->assertUnprocessable();
});

test('authenticated user can list readings for their sensor', function () {
    $user = actingAsUser();
    $greenhouse = Greenhouse::factory()->for($user)->create();
    $sensor = Sensor::factory()->for($greenhouse)->create();
    SensorReading::factory()->for($sensor)->count(5)->create();

    $this->getJson("/api/v1/sensors/{$sensor->id}/readings")
        ->assertOk()
        ->assertJsonCount(5, 'data');
});

test('readings support from date filter', function () {
    $user = actingAsUser();
    $greenhouse = Greenhouse::factory()->for($user)->create();
    $sensor = Sensor::factory()->for($greenhouse)->create();

    SensorReading::factory()->for($sensor)->create(['recorded_at' => '2026-05-20 10:00:00']);
    SensorReading::factory()->for($sensor)->create(['recorded_at' => '2026-05-22 10:00:00']);
    SensorReading::factory()->for($sensor)->create(['recorded_at' => '2026-05-23 10:00:00']);

    $this->getJson("/api/v1/sensors/{$sensor->id}/readings?from=2026-05-22")
        ->assertOk()
        ->assertJsonCount(2, 'data');
});

test('readings support to date filter', function () {
    $user = actingAsUser();
    $greenhouse = Greenhouse::factory()->for($user)->create();
    $sensor = Sensor::factory()->for($greenhouse)->create();

    SensorReading::factory()->for($sensor)->create(['recorded_at' => '2026-05-20 10:00:00']);
    SensorReading::factory()->for($sensor)->create(['recorded_at' => '2026-05-22 10:00:00']);
    SensorReading::factory()->for($sensor)->create(['recorded_at' => '2026-05-23 10:00:00']);

    $this->getJson("/api/v1/sensors/{$sensor->id}/readings?to=2026-05-21")
        ->assertOk()
        ->assertJsonCount(1, 'data');
});

test('readings support from+to date range filter', function () {
    $user = actingAsUser();
    $greenhouse = Greenhouse::factory()->for($user)->create();
    $sensor = Sensor::factory()->for($greenhouse)->create();

    SensorReading::factory()->for($sensor)->create(['recorded_at' => '2026-05-19 10:00:00']);
    SensorReading::factory()->for($sensor)->create(['recorded_at' => '2026-05-21 10:00:00']);
    SensorReading::factory()->for($sensor)->create(['recorded_at' => '2026-05-23 10:00:00']);

    $this->getJson("/api/v1/sensors/{$sensor->id}/readings?from=2026-05-20&to=2026-05-22")
        ->assertOk()
        ->assertJsonCount(1, 'data');
});

test('listing readings returns 401 when unauthenticated', function () {
    $sensor = Sensor::factory()->create();

    $this->getJson("/api/v1/sensors/{$sensor->id}/readings")->assertUnauthorized();
});

test('listing readings returns 403 for another user sensor', function () {
    actingAsUser();
    $other = Sensor::factory()->create();

    $this->getJson("/api/v1/sensors/{$other->id}/readings")->assertForbidden();
});
```

Save to `api/tests/Feature/Api/V1/SensorTest.php`.

- [ ] **Step 2: Run tests to see them fail (expected at this point — all tasks must be done first)**

Run: `docker exec sera-app-1 php artisan test --compact --filter=SensorTest`

Expected: failures because controllers/policy/routes not wired yet.

- [ ] **Step 3: After all other tasks are done, run all tests and confirm green**

Run: `docker exec sera-app-1 php artisan test --compact --filter=SensorTest`

Expected: all 26 tests pass.

- [ ] **Step 4: Commit**

```bash
git add api/tests/Feature/Api/V1/SensorTest.php
git commit -m "test: add sensor feature tests"
```

---

### Task 9: SensorReadingFactory date support

Check the `SensorReadingFactory` supports `recorded_at` override (needed by date-filter tests).

**Files:**
- Modify (only if missing): `database/factories/SensorReadingFactory.php`

- [ ] **Step 1: Read the existing SensorReadingFactory**

Check `api/database/factories/SensorReadingFactory.php`. It should define `recorded_at`. If it already does, skip to Step 3.

- [ ] **Step 2: Ensure recorded_at is in the factory definition**

The factory must have:
```php
'recorded_at' => fake()->dateTimeBetween('-30 days', 'now'),
```

This makes `SensorReading::factory()->for($sensor)->create(['recorded_at' => '2026-05-20'])` work correctly.

- [ ] **Step 3: Run full test suite and confirm all 26 sensor tests pass**

Run: `docker exec sera-app-1 php artisan test --compact --filter=SensorTest`

Expected: `26 passed`

- [ ] **Step 4: Run Pint**

Run: `docker exec sera-app-1 vendor/bin/pint --dirty --format agent`

Expected: no errors or auto-formatted output with no failures.

- [ ] **Step 5: Commit any factory changes**

```bash
git add api/database/factories/SensorReadingFactory.php
git commit -m "fix: ensure SensorReadingFactory sets recorded_at"
```

(Skip commit if no changes were needed.)
