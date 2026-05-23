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
use Illuminate\Support\Facades\Gate;

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
        Gate::authorize('view', $greenhouse);

        return response()->json([
            'data' => new GreenhouseResource($greenhouse),
        ]);
    }

    public function update(UpdateGreenhouseRequest $request, Greenhouse $greenhouse): JsonResponse
    {
        Gate::authorize('update', $greenhouse);

        $greenhouse->update($request->validated());

        return response()->json([
            'data' => new GreenhouseResource($greenhouse->fresh()),
        ]);
    }

    public function destroy(Request $request, Greenhouse $greenhouse): Response
    {
        Gate::authorize('delete', $greenhouse);

        $greenhouse->delete();

        return response()->noContent();
    }
}
