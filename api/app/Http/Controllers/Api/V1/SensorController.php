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
use OpenApi\Attributes as OA;

class SensorController extends Controller
{
    #[OA\Get(
        path: '/greenhouses/{greenhouse}/sensors',
        operationId: 'sensorIndex',
        summary: 'List sensors for a greenhouse',
        security: [['sanctum' => []]],
        tags: ['Sensors'],
        parameters: [new OA\Parameter(name: 'greenhouse', in: 'path', required: true, schema: new OA\Schema(type: 'integer'))],
        responses: [
            new OA\Response(response: 200, description: 'List of sensors'),
            new OA\Response(response: 401, description: 'Unauthenticated'),
            new OA\Response(response: 403, description: 'Forbidden'),
        ]
    )]
    public function index(Greenhouse $greenhouse): JsonResponse
    {
        Gate::authorize('view', $greenhouse);

        return response()->json([
            'data' => SensorResource::collection($greenhouse->sensors),
        ]);
    }

    #[OA\Post(
        path: '/greenhouses/{greenhouse}/sensors',
        operationId: 'sensorStore',
        summary: 'Create a sensor',
        security: [['sanctum' => []]],
        tags: ['Sensors'],
        parameters: [new OA\Parameter(name: 'greenhouse', in: 'path', required: true, schema: new OA\Schema(type: 'integer'))],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ['name', 'type', 'unit'],
                properties: [
                    new OA\Property(property: 'name', type: 'string', example: 'Temp Sensor 1'),
                    new OA\Property(property: 'type', type: 'string', example: 'temperature'),
                    new OA\Property(property: 'unit', type: 'string', example: '°C'),
                ]
            )
        ),
        responses: [
            new OA\Response(response: 201, description: 'Sensor created',
                content: new OA\JsonContent(properties: [
                    new OA\Property(property: 'data', ref: '#/components/schemas/SensorResource'),
                ])
            ),
            new OA\Response(response: 401, description: 'Unauthenticated'),
            new OA\Response(response: 403, description: 'Forbidden'),
            new OA\Response(response: 422, description: 'Validation error'),
        ]
    )]
    public function store(StoreSensorRequest $request, Greenhouse $greenhouse): JsonResponse
    {
        Gate::authorize('view', $greenhouse);

        $sensor = $greenhouse->sensors()->create($request->validated());

        return response()->json(['data' => new SensorResource($sensor->fresh())], 201);
    }

    #[OA\Get(
        path: '/sensors/{sensor}',
        operationId: 'sensorShow',
        summary: 'Get a sensor',
        security: [['sanctum' => []]],
        tags: ['Sensors'],
        parameters: [new OA\Parameter(name: 'sensor', in: 'path', required: true, schema: new OA\Schema(type: 'integer'))],
        responses: [
            new OA\Response(response: 200, description: 'Sensor',
                content: new OA\JsonContent(properties: [
                    new OA\Property(property: 'data', ref: '#/components/schemas/SensorResource'),
                ])
            ),
            new OA\Response(response: 401, description: 'Unauthenticated'),
            new OA\Response(response: 403, description: 'Forbidden'),
            new OA\Response(response: 404, description: 'Not found'),
        ]
    )]
    public function show(Sensor $sensor): JsonResponse
    {
        Gate::authorize('view', $sensor);

        return response()->json(['data' => new SensorResource($sensor)]);
    }

    #[OA\Delete(
        path: '/sensors/{sensor}',
        operationId: 'sensorDestroy',
        summary: 'Delete a sensor',
        security: [['sanctum' => []]],
        tags: ['Sensors'],
        parameters: [new OA\Parameter(name: 'sensor', in: 'path', required: true, schema: new OA\Schema(type: 'integer'))],
        responses: [
            new OA\Response(response: 204, description: 'Deleted'),
            new OA\Response(response: 401, description: 'Unauthenticated'),
            new OA\Response(response: 403, description: 'Forbidden'),
            new OA\Response(response: 404, description: 'Not found'),
        ]
    )]
    public function destroy(Sensor $sensor): Response
    {
        Gate::authorize('delete', $sensor);

        $sensor->delete();

        return response()->noContent();
    }
}
