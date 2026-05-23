<?php

namespace App\Http\Controllers\Api\V1;

use App\Events\DeviceStatusChanged;
use App\Http\Controllers\Controller;
use App\Http\Requests\Device\SendDeviceCommandRequest;
use App\Http\Requests\Device\StoreDeviceRequest;
use App\Http\Requests\Device\UpdateDeviceRequest;
use App\Http\Resources\DeviceResource;
use App\Models\Device;
use App\Models\Greenhouse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Gate;
use OpenApi\Attributes as OA;

class DeviceController extends Controller
{
    #[OA\Get(
        path: '/greenhouses/{greenhouse}/devices',
        operationId: 'deviceIndex',
        summary: 'List devices for a greenhouse',
        security: [['sanctum' => []]],
        tags: ['Devices'],
        parameters: [new OA\Parameter(name: 'greenhouse', in: 'path', required: true, schema: new OA\Schema(type: 'integer'))],
        responses: [
            new OA\Response(response: 200, description: 'List of devices'),
            new OA\Response(response: 401, description: 'Unauthenticated'),
            new OA\Response(response: 403, description: 'Forbidden'),
        ]
    )]
    public function index(Greenhouse $greenhouse): JsonResponse
    {
        Gate::authorize('view', $greenhouse);

        return response()->json([
            'data' => DeviceResource::collection($greenhouse->devices),
        ]);
    }

    #[OA\Post(
        path: '/greenhouses/{greenhouse}/devices',
        operationId: 'deviceStore',
        summary: 'Create a device',
        security: [['sanctum' => []]],
        tags: ['Devices'],
        parameters: [new OA\Parameter(name: 'greenhouse', in: 'path', required: true, schema: new OA\Schema(type: 'integer'))],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ['name', 'type'],
                properties: [
                    new OA\Property(property: 'name', type: 'string', example: 'Fan 1'),
                    new OA\Property(property: 'type', type: 'string', example: 'fan'),
                ]
            )
        ),
        responses: [
            new OA\Response(response: 201, description: 'Device created',
                content: new OA\JsonContent(properties: [
                    new OA\Property(property: 'data', ref: '#/components/schemas/DeviceResource'),
                ])
            ),
            new OA\Response(response: 401, description: 'Unauthenticated'),
            new OA\Response(response: 403, description: 'Forbidden'),
            new OA\Response(response: 422, description: 'Validation error'),
        ]
    )]
    public function store(StoreDeviceRequest $request, Greenhouse $greenhouse): JsonResponse
    {
        Gate::authorize('view', $greenhouse);

        $device = $greenhouse->devices()->create($request->validated());

        return response()->json(['data' => new DeviceResource($device->fresh())], 201);
    }

    #[OA\Get(
        path: '/devices/{device}',
        operationId: 'deviceShow',
        summary: 'Get a device',
        security: [['sanctum' => []]],
        tags: ['Devices'],
        parameters: [new OA\Parameter(name: 'device', in: 'path', required: true, schema: new OA\Schema(type: 'integer'))],
        responses: [
            new OA\Response(response: 200, description: 'Device',
                content: new OA\JsonContent(properties: [
                    new OA\Property(property: 'data', ref: '#/components/schemas/DeviceResource'),
                ])
            ),
            new OA\Response(response: 401, description: 'Unauthenticated'),
            new OA\Response(response: 403, description: 'Forbidden'),
            new OA\Response(response: 404, description: 'Not found'),
        ]
    )]
    public function show(Device $device): JsonResponse
    {
        Gate::authorize('view', $device);

        return response()->json(['data' => new DeviceResource($device)]);
    }

    #[OA\Put(
        path: '/devices/{device}',
        operationId: 'deviceUpdate',
        summary: 'Update a device',
        security: [['sanctum' => []]],
        tags: ['Devices'],
        parameters: [new OA\Parameter(name: 'device', in: 'path', required: true, schema: new OA\Schema(type: 'integer'))],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(properties: [
                new OA\Property(property: 'name', type: 'string'),
                new OA\Property(property: 'type', type: 'string'),
            ])
        ),
        responses: [
            new OA\Response(response: 200, description: 'Updated device',
                content: new OA\JsonContent(properties: [
                    new OA\Property(property: 'data', ref: '#/components/schemas/DeviceResource'),
                ])
            ),
            new OA\Response(response: 401, description: 'Unauthenticated'),
            new OA\Response(response: 403, description: 'Forbidden'),
            new OA\Response(response: 404, description: 'Not found'),
            new OA\Response(response: 422, description: 'Validation error'),
        ]
    )]
    public function update(UpdateDeviceRequest $request, Device $device): JsonResponse
    {
        Gate::authorize('update', $device);

        $device->update($request->validated());

        return response()->json(['data' => new DeviceResource($device->fresh())]);
    }

    #[OA\Delete(
        path: '/devices/{device}',
        operationId: 'deviceDestroy',
        summary: 'Delete a device',
        security: [['sanctum' => []]],
        tags: ['Devices'],
        parameters: [new OA\Parameter(name: 'device', in: 'path', required: true, schema: new OA\Schema(type: 'integer'))],
        responses: [
            new OA\Response(response: 204, description: 'Deleted'),
            new OA\Response(response: 401, description: 'Unauthenticated'),
            new OA\Response(response: 403, description: 'Forbidden'),
            new OA\Response(response: 404, description: 'Not found'),
        ]
    )]
    public function destroy(Device $device): Response
    {
        Gate::authorize('delete', $device);

        $device->delete();

        return response()->noContent();
    }

    #[OA\Post(
        path: '/devices/{device}/command',
        operationId: 'deviceCommand',
        summary: 'Send a command to a device',
        security: [['sanctum' => []]],
        tags: ['Devices'],
        parameters: [new OA\Parameter(name: 'device', in: 'path', required: true, schema: new OA\Schema(type: 'integer'))],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ['action'],
                properties: [
                    new OA\Property(property: 'action', type: 'string', enum: ['turn_on', 'turn_off'], example: 'turn_on'),
                ]
            )
        ),
        responses: [
            new OA\Response(response: 200, description: 'Device after command',
                content: new OA\JsonContent(properties: [
                    new OA\Property(property: 'data', ref: '#/components/schemas/DeviceResource'),
                ])
            ),
            new OA\Response(response: 401, description: 'Unauthenticated'),
            new OA\Response(response: 403, description: 'Forbidden'),
            new OA\Response(response: 422, description: 'Validation error'),
        ]
    )]
    public function command(SendDeviceCommandRequest $request, Device $device): JsonResponse
    {
        Gate::authorize('sendCommand', $device);

        $action = $request->validated('action');
        $newStatus = $action === 'turn_on';
        $now = now();

        $device->update([
            'status' => $newStatus,
            'last_commanded_at' => $now,
        ]);

        $device->commands()->create([
            'user_id' => $request->user()->id,
            'action' => $action,
            'source' => 'manual',
            'issued_at' => $now,
        ]);

        DeviceStatusChanged::dispatch($device->fresh());

        return response()->json(['data' => new DeviceResource($device->fresh())]);
    }
}
