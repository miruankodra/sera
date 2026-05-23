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
use OpenApi\Attributes as OA;

class SensorReadingController extends Controller
{
    #[OA\Post(
        path: '/sensors/{sensor}/readings',
        operationId: 'sensorReadingStore',
        summary: 'Ingest a sensor reading (IoT endpoint, rate-limited to 60/min)',
        security: [['sanctum' => []]],
        tags: ['Sensors'],
        parameters: [new OA\Parameter(name: 'sensor', in: 'path', required: true, schema: new OA\Schema(type: 'integer'))],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ['value', 'recorded_at'],
                properties: [
                    new OA\Property(property: 'value', type: 'number', format: 'float', example: 22.5),
                    new OA\Property(property: 'recorded_at', type: 'string', format: 'date-time'),
                ]
            )
        ),
        responses: [
            new OA\Response(response: 201, description: 'Reading created',
                content: new OA\JsonContent(properties: [
                    new OA\Property(property: 'data', ref: '#/components/schemas/SensorReadingResource'),
                ])
            ),
            new OA\Response(response: 401, description: 'Unauthenticated'),
            new OA\Response(response: 403, description: 'Forbidden'),
            new OA\Response(response: 422, description: 'Validation error'),
            new OA\Response(response: 429, description: 'Too many requests'),
        ]
    )]
    public function store(StoreSensorReadingRequest $request, Sensor $sensor): JsonResponse
    {
        Gate::authorize('storeReading', $sensor);

        $reading = $sensor->readings()->create($request->validated());

        SensorReadingCreated::dispatch($reading);
        NewSensorReading::dispatch($reading);

        return response()->json(['data' => new SensorReadingResource($reading)], 201);
    }

    #[OA\Get(
        path: '/sensors/{sensor}/readings',
        operationId: 'sensorReadingIndex',
        summary: 'List sensor readings with optional date range filter',
        security: [['sanctum' => []]],
        tags: ['Sensors'],
        parameters: [
            new OA\Parameter(name: 'sensor', in: 'path', required: true, schema: new OA\Schema(type: 'integer')),
            new OA\Parameter(name: 'from', in: 'query', required: false, schema: new OA\Schema(type: 'string', format: 'date-time')),
            new OA\Parameter(name: 'to', in: 'query', required: false, schema: new OA\Schema(type: 'string', format: 'date-time')),
        ],
        responses: [
            new OA\Response(response: 200, description: 'List of readings'),
            new OA\Response(response: 401, description: 'Unauthenticated'),
            new OA\Response(response: 403, description: 'Forbidden'),
        ]
    )]
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
