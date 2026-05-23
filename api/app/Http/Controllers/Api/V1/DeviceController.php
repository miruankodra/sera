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

class DeviceController extends Controller
{
    public function index(Greenhouse $greenhouse): JsonResponse
    {
        Gate::authorize('view', $greenhouse);

        return response()->json([
            'data' => DeviceResource::collection($greenhouse->devices),
        ]);
    }

    public function store(StoreDeviceRequest $request, Greenhouse $greenhouse): JsonResponse
    {
        Gate::authorize('view', $greenhouse);

        $device = $greenhouse->devices()->create($request->validated());

        return response()->json(['data' => new DeviceResource($device->fresh())], 201);
    }

    public function show(Device $device): JsonResponse
    {
        Gate::authorize('view', $device);

        return response()->json(['data' => new DeviceResource($device)]);
    }

    public function update(UpdateDeviceRequest $request, Device $device): JsonResponse
    {
        Gate::authorize('update', $device);

        $device->update($request->validated());

        return response()->json(['data' => new DeviceResource($device->fresh())]);
    }

    public function destroy(Device $device): Response
    {
        Gate::authorize('delete', $device);

        $device->delete();

        return response()->noContent();
    }

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
