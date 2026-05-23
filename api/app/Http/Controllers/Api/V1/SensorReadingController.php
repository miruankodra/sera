<?php

namespace App\Http\Controllers\Api\V1;

use App\Events\NewSensorReading;
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
        NewSensorReading::dispatch($reading);

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
