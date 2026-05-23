<?php

namespace App\Http\Controllers\Api\V1;

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

        return response()->json(['data' => new SensorResource($sensor->fresh())], 201);
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
