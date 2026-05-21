# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Monorepo Structure

```
/
├── app/          # Angular + Capacitor cross-platform app (web, Android, iOS)
├── api/          # Laravel 11 REST API + WebSocket server
├── CLAUDE.md
├── README.md
├── .editorconfig
└── docker-compose.yml
```

---

## App Commands (`app/`)

All `npm` and Angular CLI commands run from inside `app/`.

```bash
npm start           # Dev server at http://localhost:4200
npm run build       # Production build (output: dist/sera)
npm test            # Run Karma/Jasmine unit tests
npm run lint        # ESLint on TypeScript and HTML
npm run watch       # Watch mode build

# Mobile (requires Capacitor setup)
npm run android     # Build & sync Android
npm run android-run # Build & run on Android device with live reload
npm run ios         # Build & sync iOS
npm run ios-run     # Build & run on iOS device with live reload
```

---

## App Architecture (`app/`)

**Sera** is a greenhouse management app built with Angular 17 (standalone components) + Capacitor for cross-platform deployment (web, Android, iOS). The UI is in Albanian.

### Project Structure

```
app/src/app/
├── components/
│   ├── shared/          # Reusable UI components (prefixed se-)
│   └── [feature]/       # Feature-specific presentational components
├── pages/               # Route-level (smart) components
│   ├── authentication/login/
│   ├── tabs/            # Root tab layout + nested routes
│   ├── home/
│   ├── greenhouse/
│   ├── calendar/
│   ├── reports/
│   └── profile/
├── services/
│   └── core/            # Low-level Capacitor wrappers (http, storage, platform)
├── models/
│   ├── constants/       # Enums: RoutePaths, HttpPaths, StoragePaths, etc.
│   └── [dtos/errors]
└── directives/
```

### Routing

All authenticated routes are children of `TabsComponent`. Lazy loading via `loadComponent`/`loadChildren`.

```
/login              → LoginComponent (standalone)
/ → TabsComponent
    /home           → HomeComponent (default)
    /greenhouse/:id → GreenhouseComponent
    /calendar       → CalendarComponent
    /reports        → ReportsComponent
    /profile        → ProfileComponent
```

### Services

| Service | Purpose |
|---|---|
| `HttpService` | API calls via Capacitor HTTP; auto-injects auth token |
| `StorageService` | Device storage via Capacitor Preferences (JSON) |
| `ModalService` | Dynamic modals using `ComponentFactoryResolver` |
| `ToastService` | Native toasts via Capacitor Toast |
| `NavigationService` | Router navigation wrapper |
| `TabsService` | Active tab state (BehaviorSubject) |
| `WebSocketService` | Connects to Laravel Reverb via pusher-js; manages private channel subscriptions per greenhouse |

`core/` services are lower-level wrappers; use the non-core counterparts in feature code.

### Key Conventions

- **All components are standalone** — no NgModules
- **`inject()` function** preferred over constructor injection
- **`se-` prefix** on all component/directive selectors
- **No NgRx** — state managed via RxJS services and Angular Signals
- **Constants in enums** — use `RoutePaths`, `HttpPaths`, `StoragePaths` instead of raw strings
- **SCSS** for component styles, **Tailwind** for layout/utility classes
- **Signals** for reactive local state in components; BehaviorSubject in services

### Tailwind Custom Tokens

```js
se-green    // #0B3931 — dark background
se-lime     // #C4FE33 — accent/CTA
se-jungle   // #1A9E78 — primary brand color
```

### WebSocket Integration

The app connects to Laravel Reverb using `pusher-js`. On navigating to a greenhouse view, `WebSocketService` subscribes to the private channel `private-greenhouse.{id}`. Channel authorisation is handled by the backend at `POST /broadcasting/auth` using the Sanctum token. The service exposes observables that components subscribe to for live sensor updates, device status changes, and alert events.

### Environment

- Dev API: `http://localhost:3000` (`app/src/environments/environment.ts`)
- Production URL configured in `app/src/environments/environment.prod.ts`
- Capacitor dev server: `192.168.1.11:4200` (update `app/capacitor.config.ts` for your local IP)

---

## API Architecture (`api/`)

The backend is a **Laravel 11 modular monolith** with PHP 8.3. All commands run from inside `api/`.

### Required Packages

Install these after creating a fresh Laravel 11 project:

```bash
# Backend packages (composer)
composer require laravel/sanctum                  # Token-based API authentication
composer require laravel/reverb                   # WebSocket server (first-party)
composer require predis/predis                    # Redis client (cache + queue)
composer require darkaonline/l5-swagger           # OpenAPI/Swagger documentation
composer require spatie/laravel-query-builder     # Filter/sort query params cleanly

# Dev packages (composer)
composer require pestphp/pest --dev               # Test framework
composer require pestphp/pest-plugin-laravel --dev
composer require laravel/pint --dev               # Code style fixer
composer require fakerphp/faker --dev             # Factory data generation (included by default)
```

After installing, run:

```bash
php artisan vendor:publish --provider="Laravel\Sanctum\SanctumServiceProvider"
php artisan vendor:publish --provider="Darkaonline\L5Swagger\L5SwaggerServiceProvider"
php artisan reverb:install
php artisan migrate
```

Also ensure these are enabled in `config/app.php` / `.env`:

```env
QUEUE_CONNECTION=redis
CACHE_DRIVER=redis
BROADCAST_DRIVER=reverb
REDIS_CLIENT=predis
```

### API Commands

```bash
php artisan serve                    # Dev server at http://localhost:8000
php artisan migrate                  # Run migrations
php artisan migrate:fresh --seed     # Fresh DB with seed data
php artisan db:seed                  # Run seeders only
php artisan queue:work               # Start queue worker (automation rules)
php artisan reverb:start             # Start WebSocket server
php artisan test                     # Run Pest test suite
php artisan route:list               # List all registered routes
php artisan make:model X -mfsc       # Model + migration + factory + seeder + controller
```

### Project Structure

```
api/
├── app/
│   ├── Http/
│   │   ├── Controllers/Api/V1/     # One controller per resource
│   │   ├── Requests/               # FormRequest validation classes
│   │   └── Resources/              # API resource transformers
│   ├── Models/                     # Eloquent models
│   ├── Policies/                   # Object-level authorisation policies
│   ├── Services/                   # Business logic (AutomationEngine, etc.)
│   ├── Events/                     # Laravel broadcast events
│   └── Jobs/                       # Queue jobs (EvaluateAutomationRules, etc.)
├── database/
│   ├── migrations/
│   ├── factories/
│   └── seeders/
├── routes/
│   └── api.php                     # All API routes under /api/v1/
└── tests/
    ├── Unit/                       # Service/logic unit tests
    └── Feature/                    # HTTP endpoint feature tests
```

### Domain Model

| Table | Description |
|---|---|
| `users` | Auth users (Sanctum tokens) |
| `greenhouses` | User-owned greenhouses (soft deletes) |
| `sensors` | Sensors belonging to a greenhouse |
| `sensor_readings` | Append-only time-series readings |
| `devices` | Controllable devices with current state |
| `device_commands` | Immutable audit log of every command issued |
| `automation_rules` | If-then rules (soft deletes) |
| `alerts` | Threshold breach alerts |
| `tasks` | Calendar tasks with JSON payload column |

### Database Schema (Migrations)

```php
// users
Schema::create('users', function (Blueprint $table) {
    $table->id();
    $table->string('name');
    $table->string('email')->unique();
    $table->string('password');
    $table->string('avatar')->nullable();         // relative path to stored file
    $table->string('timezone')->default('UTC');
    $table->string('locale')->default('sq');      // Albanian default (sq = shqip)
    $table->json('notification_preferences')->nullable(); // {alerts: bool, automation: bool, tasks: bool}
    $table->timestamps();
});

// greenhouses
Schema::create('greenhouses', function (Blueprint $table) {
    $table->id();
    $table->foreignId('user_id')->constrained()->cascadeOnDelete();
    $table->string('name');
    $table->text('description')->nullable();
    $table->string('location')->nullable();
    $table->timestamps();
    $table->softDeletes();
});

// sensors
Schema::create('sensors', function (Blueprint $table) {
    $table->id();
    $table->foreignId('greenhouse_id')->constrained()->cascadeOnDelete();
    $table->string('name');
    $table->string('type');           // e.g. temperature, humidity, soil_moisture, light
    $table->string('unit');           // e.g. °C, %, lux
    $table->boolean('is_active')->default(true);
    $table->timestamps();
});

// sensor_readings — append-only, never UPDATE
Schema::create('sensor_readings', function (Blueprint $table) {
    $table->id();
    $table->foreignId('sensor_id')->constrained()->cascadeOnDelete();
    $table->decimal('value', 10, 4);
    $table->timestamp('recorded_at');
    $table->timestamps();

    $table->index(['sensor_id', 'recorded_at']); // composite index for range queries
});

// devices
Schema::create('devices', function (Blueprint $table) {
    $table->id();
    $table->foreignId('greenhouse_id')->constrained()->cascadeOnDelete();
    $table->string('name');
    $table->string('type');           // e.g. fan, heater, irrigation, light
    $table->boolean('status')->default(false);  // current on/off state
    $table->timestamp('last_commanded_at')->nullable();
    $table->timestamps();
});

// device_commands — immutable audit log
Schema::create('device_commands', function (Blueprint $table) {
    $table->id();
    $table->foreignId('device_id')->constrained()->cascadeOnDelete();
    $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
    $table->string('action');         // e.g. turn_on, turn_off
    $table->string('source');         // manual | automation
    $table->timestamp('issued_at');
    $table->timestamps();
});

// automation_rules
Schema::create('automation_rules', function (Blueprint $table) {
    $table->id();
    $table->foreignId('greenhouse_id')->constrained()->cascadeOnDelete();
    $table->foreignId('trigger_sensor_id')->constrained('sensors')->cascadeOnDelete();
    $table->string('operator');       // gt, lt, eq, gte, lte
    $table->decimal('threshold', 10, 4);
    $table->foreignId('action_device_id')->constrained('devices')->cascadeOnDelete();
    $table->string('action');         // turn_on, turn_off
    $table->boolean('is_active')->default(true);
    $table->timestamps();
    $table->softDeletes();
});

// alerts
Schema::create('alerts', function (Blueprint $table) {
    $table->id();
    $table->foreignId('greenhouse_id')->constrained()->cascadeOnDelete();
    $table->foreignId('sensor_id')->constrained()->cascadeOnDelete();
    $table->string('sensor_type');
    $table->decimal('value', 10, 4);
    $table->decimal('threshold', 10, 4);
    $table->string('operator');
    $table->text('message');
    $table->boolean('is_read')->default(false);
    $table->timestamp('triggered_at');
    $table->timestamps();
});

// tasks
Schema::create('tasks', function (Blueprint $table) {
    $table->id();
    $table->foreignId('greenhouse_id')->constrained()->cascadeOnDelete();
    $table->string('title');
    $table->string('type');           // reminder | system_command
    $table->json('payload');          // {message} OR {device_id, action, duration}
    $table->timestamp('scheduled_at');
    $table->boolean('is_completed')->default(false);
    $table->timestamps();
});
```

Key decisions:
- `sensor_readings` is append-only — never UPDATE rows, only INSERT
- `tasks.payload` is a JSON column cast to array; holds either `{message}` (Reminder) or `{device_id, action, duration}` (System Command)
- `device_commands` is an immutable audit log — never UPDATE or DELETE rows
- `automation_rules` references devices by FK (`action_device_id`) not by name — renaming a device does not break its rules
- All resources are owned by a User via `greenhouse_id` FK — enforced by Policies

### API Routes

All routes are prefixed `/api/v1/` and protected by `auth:sanctum` middleware except login/register.

```
POST   /auth/register
POST   /auth/login
POST   /auth/logout

GET    /greenhouses
POST   /greenhouses
GET    /greenhouses/{id}
PUT    /greenhouses/{id}
DELETE /greenhouses/{id}

GET    /greenhouses/{id}/sensors
POST   /greenhouses/{id}/sensors
GET    /sensors/{id}
DELETE /sensors/{id}
POST   /sensors/{id}/readings        # IoT device ingestion endpoint (<50ms target)
GET    /sensors/{id}/readings        # ?from=&to= date range filter

GET    /greenhouses/{id}/devices
POST   /greenhouses/{id}/devices
GET    /devices/{id}
PUT    /devices/{id}
DELETE /devices/{id}
POST   /devices/{id}/command         # Send command; logs to device_commands

GET    /greenhouses/{id}/automation-rules
POST   /greenhouses/{id}/automation-rules
PUT    /automation-rules/{id}
DELETE /automation-rules/{id}

GET    /greenhouses/{id}/alerts
POST   /alerts/{id}/read

GET    /greenhouses/{id}/tasks
POST   /greenhouses/{id}/tasks
PUT    /tasks/{id}
DELETE /tasks/{id}
```

### Key Conventions

- **Controllers are thin** — delegate all logic to Service classes
- **Policies on every controller action** — use `$this->authorize()` before any DB operation
- **FormRequests for all POST/PUT** — never validate in controllers
- **API Resources for all responses** — never return Eloquent models directly
- **HTTP status codes** — 201 for creates, 204 for deletes/read-marks, 403 vs 401 distinction enforced
- **Queue jobs for automation** — `SensorReadingCreated` event dispatches `EvaluateAutomationRules` job; ingestion endpoint must stay under 50ms
- **Soft deletes** on `greenhouses` and `automation_rules`

### Authentication

Laravel Sanctum token-based auth. Token stored in Capacitor Preferences on the client. Every request sends `Authorization: Bearer {token}`. Tokens have expiry and can be revoked per device.


### User — Profile & Relationships

#### Relationship to Greenhouses

`User` **has many** `Greenhouse` (one-to-many). This is the root ownership relationship for the entire system. Every resource (sensor, device, automation rule, alert, task) is indirectly owned by a User through the `greenhouse_id` foreign key chain.

```php
// User model
public function greenhouses(): HasMany
{
    return $this->hasMany(Greenhouse::class);
}

// Greenhouse model
public function user(): BelongsTo
{
    return $this->belongsTo(User::class);
}
```

All Policy classes resolve ownership by checking `$user->id === $greenhouse->user_id`. No resource is accessible unless this chain is intact.

#### User Schema Casts

```php
protected $casts = [
    'password' => 'hashed',
    'notification_preferences' => 'array',
];
// notification_preferences: { "alerts": bool, "automation": bool, "tasks": bool }
```

#### User Endpoints

```
GET    /api/v1/user              # Return authenticated user profile
PUT    /api/v1/user              # Update name, email, timezone, locale, notification_preferences
PUT    /api/v1/user/password     # Change password (requires current_password + new_password + confirmation)
POST   /api/v1/user/avatar       # Upload avatar (multipart/form-data); store in storage/app/public/avatars
DELETE /api/v1/user/avatar       # Remove avatar, reset to null
```

All endpoints protected by `auth:sanctum`. No separate Policy needed — authenticated user can only access their own profile.

#### UserResource Response Shape

```json
{
  "id": 1,
  "name": "Miruan Kodra",
  "email": "miruan@example.com",
  "avatar_url": "http://.../storage/avatars/file.jpg",
  "timezone": "Europe/Tirane",
  "locale": "sq",
  "notification_preferences": { "alerts": true, "automation": true, "tasks": true },
  "greenhouses_count": 3,
  "created_at": "2025-01-01T00:00:00Z"
}
```

#### Avatar Storage

- Store in `storage/app/public/avatars/` via Laravel `Storage` facade
- Run `php artisan storage:link` to expose files publicly
- On new upload, delete the old file before saving the new one
- Return full public URL via `Storage::url($path)` in UserResource

#### No Account Deletion

`DELETE /api/v1/user` is **not in scope** — do not implement it. The `cascadeOnDelete()` on `greenhouses.user_id` means all nested data would be wiped if this were ever added in future.

#### Pest Tests for User Endpoints

- `GET /user` returns correct shape including `greenhouses_count`
- `PUT /user` updates name, email, timezone, locale, notification_preferences
- `PUT /user/password` succeeds with correct `current_password`
- `PUT /user/password` returns 422 with wrong `current_password`
- `POST /user/avatar` stores file and returns updated `avatar_url`
- `DELETE /user/avatar` sets `avatar_url` to null
- All endpoints return 401 when unauthenticated

### Broadcasting

Laravel Reverb handles WebSocket. Private channel `private-greenhouse.{id}`. Channel auth via `POST /broadcasting/auth`. Four broadcast event types:
- `NewSensorReading` — sensor_id, type, value, unit, recorded_at
- `DeviceStatusChanged` — device_id, status, changed_at
- `AutomationRuleTriggered` — rule_id, device_id, action, triggered_at
- `AlertFired` — alert_id, greenhouse_id, sensor_type, value, threshold, message

### Testing

Tests use **Pest**. Feature tests hit the full HTTP stack. Every endpoint has tests for: happy path, unauthenticated (401), unauthorized cross-user access (403), validation errors (422), rate limiting (429 on auth and ingestion endpoints).

---

## Infrastructure

### Docker Compose Services

| Service | Image | Purpose |
|---|---|---|
| `app` | Custom PHP 8.3-FPM | Laravel application |
| `nginx` | nginx:alpine | Reverse proxy |
| `mysql` | mysql:8 | Primary database |
| `redis` | redis:7-alpine | Cache + queue driver |
| `queue` | Same as `app` | Runs `php artisan queue:work` |
| `reverb` | Same as `app` | Runs `php artisan reverb:start` |

All services defined in `docker-compose.yml` at repo root.

```bash
docker compose up -d          # Start all services
docker compose down           # Stop all services
docker compose exec app bash  # Shell into app container
docker compose exec app php artisan migrate --seed
docker compose logs -f queue  # Watch queue worker logs
```

### CI/CD

Two GitHub Actions pipelines in `.github/workflows/`:

- **`ci.yml`** — triggers on every push; installs deps, runs migrations against a MySQL service container, runs Pest suite, runs Laravel Pint code style check
- **`deploy.yml`** — triggers on push to `main` only; runs CI first, builds Docker image, pushes to GHCR, SSHs into server, pulls image, runs `docker compose up -d`, runs migrations

---

## Architecture Decisions (ADRs)

Three key decisions are documented in the thesis and must be respected:

1. **Modular monolith** — do NOT split into microservices; keep all domains in one Laravel app
2. **Laravel Reverb** — do NOT introduce Pusher or Socket.io; Reverb is the WebSocket driver
3. **Async automation via Redis queue** — rule evaluation MUST be async; never run `EvaluateAutomationRules` synchronously in the ingestion request cycle

---

## What Has Been Built

Pages implemented in the Angular app:
- Authentication (login/register)
- Home dashboard (live sensor cards via WebSocket)
- Greenhouse detail
- Calendar (tasks with Capacitor local notifications, persisted to backend + cached in Capacitor Preferences)
- Reports (sensor trend charts, KPI summary, threshold breach log, automation activity, task completion)
- Profile

Backend endpoints: all 14 resource groups listed above under API Routes.
