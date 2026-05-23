# Greenhouse Endpoints Design

**Date:** 2026-05-23
**Status:** Approved

## Overview

Implement full CRUD REST API endpoints for greenhouses. Users may only access their own greenhouses. Soft deletes must work. All endpoints live under `/api/v1/` and require Sanctum authentication.

## Routes

Added inside the existing `auth:sanctum` middleware group in `routes/api.php`:

| Method | URI | Handler |
|--------|-----|---------|
| GET | `/api/v1/greenhouses` | `GreenhouseController@index` |
| POST | `/api/v1/greenhouses` | `GreenhouseController@store` |
| GET | `/api/v1/greenhouses/{greenhouse}` | `GreenhouseController@show` |
| PUT | `/api/v1/greenhouses/{greenhouse}` | `GreenhouseController@update` |
| DELETE | `/api/v1/greenhouses/{greenhouse}` | `GreenhouseController@destroy` |

Route model binding resolves `Greenhouse` by id; soft-deleted records are excluded automatically.

## Components

### GreenhousePolicy (`app/Policies/GreenhousePolicy.php`)

| Method | Rule |
|--------|------|
| `viewAny` | `true` — any authenticated user |
| `view` | `$user->id === $greenhouse->user_id` |
| `create` | `true` |
| `update` | `$user->id === $greenhouse->user_id` |
| `delete` | `$user->id === $greenhouse->user_id` |

### GreenhouseController (`app/Http/Controllers/Api/V1/GreenhouseController.php`)

- `index` — returns `GreenhouseResource::collection($request->user()->greenhouses)`, 200
- `store` — creates greenhouse via `$request->user()->greenhouses()->create(...)`, returns `GreenhouseResource`, 201
- `show` — `authorize('view', $greenhouse)`, returns `GreenhouseResource`, 200
- `update` — `authorize('update', $greenhouse)`, updates, returns `GreenhouseResource`, 200
- `destroy` — `authorize('delete', $greenhouse)`, soft deletes, returns 204

### StoreGreenhouseRequest (`app/Http/Requests/Greenhouse/StoreGreenhouseRequest.php`)

```php
'name'        => ['required', 'string', 'max:255'],
'description' => ['nullable', 'string'],
'location'    => ['nullable', 'string', 'max:255'],
```

### UpdateGreenhouseRequest (`app/Http/Requests/Greenhouse/UpdateGreenhouseRequest.php`)

```php
'name'        => ['sometimes', 'string', 'max:255'],
'description' => ['sometimes', 'nullable', 'string'],
'location'    => ['sometimes', 'nullable', 'string', 'max:255'],
```

### GreenhouseResource (`app/Http/Resources/GreenhouseResource.php`)

Fields returned:
- `id`, `user_id`, `name`, `description`, `location`
- `created_at` — ISO 8601
- `updated_at` — ISO 8601

## Data Model

The `greenhouses` table already exists with `SoftDeletes` on the model and `softDeletes()` in the migration. No new migration needed.

## Error Handling

- 401 — unauthenticated (Sanctum middleware)
- 403 — policy denies access (`$this->authorize()` throws `AuthorizationException`)
- 404 — greenhouse not found or soft-deleted
- 422 — validation failure

## Tests (`tests/Feature/Api/V1/GreenhouseTest.php`)

Uses `RefreshDatabase` (via `Pest.php`) and the `actingAsUser()` helper defined in `UserTest.php`.

| Describe block | Cases |
|----------------|-------|
| `GET /api/v1/greenhouses` | returns only own greenhouses; does not return other users'; 401 unauthenticated |
| `POST /api/v1/greenhouses` | 201 with correct shape; 422 on missing name; 401 |
| `GET /api/v1/greenhouses/{id}` | 200 own greenhouse; 403 other user's; 401 |
| `PUT /api/v1/greenhouses/{id}` | 200 updated values; 403 other user's; 422 validation; 401 |
| `DELETE /api/v1/greenhouses/{id}` | 204 no content; record soft-deleted (deleted_at set, row still in DB); 403 other user's; 401 |
