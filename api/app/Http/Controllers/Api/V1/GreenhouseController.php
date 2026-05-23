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
use OpenApi\Attributes as OA;

class GreenhouseController extends Controller
{
    #[OA\Get(
        path: '/greenhouses',
        operationId: 'greenhouseIndex',
        summary: 'List all greenhouses for the authenticated user',
        security: [['sanctum' => []]],
        tags: ['Greenhouses'],
        responses: [
            new OA\Response(response: 200, description: 'List of greenhouses'),
            new OA\Response(response: 401, description: 'Unauthenticated'),
        ]
    )]
    public function index(Request $request): JsonResponse
    {
        return response()->json([
            'data' => GreenhouseResource::collection($request->user()->greenhouses),
        ]);
    }

    #[OA\Post(
        path: '/greenhouses',
        operationId: 'greenhouseStore',
        summary: 'Create a greenhouse',
        security: [['sanctum' => []]],
        tags: ['Greenhouses'],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ['name'],
                properties: [
                    new OA\Property(property: 'name', type: 'string', example: 'Greenhouse A'),
                    new OA\Property(property: 'description', type: 'string'),
                    new OA\Property(property: 'location', type: 'string'),
                ]
            )
        ),
        responses: [
            new OA\Response(response: 201, description: 'Greenhouse created',
                content: new OA\JsonContent(properties: [
                    new OA\Property(property: 'data', ref: '#/components/schemas/GreenhouseResource'),
                ])
            ),
            new OA\Response(response: 401, description: 'Unauthenticated'),
            new OA\Response(response: 422, description: 'Validation error'),
        ]
    )]
    public function store(StoreGreenhouseRequest $request): JsonResponse
    {
        $greenhouse = $request->user()->greenhouses()->create($request->validated());

        return response()->json([
            'data' => new GreenhouseResource($greenhouse),
        ], 201);
    }

    #[OA\Get(
        path: '/greenhouses/{id}',
        operationId: 'greenhouseShow',
        summary: 'Get a greenhouse',
        security: [['sanctum' => []]],
        tags: ['Greenhouses'],
        parameters: [new OA\Parameter(name: 'id', in: 'path', required: true, schema: new OA\Schema(type: 'integer'))],
        responses: [
            new OA\Response(response: 200, description: 'Greenhouse',
                content: new OA\JsonContent(properties: [
                    new OA\Property(property: 'data', ref: '#/components/schemas/GreenhouseResource'),
                ])
            ),
            new OA\Response(response: 401, description: 'Unauthenticated'),
            new OA\Response(response: 403, description: 'Forbidden'),
            new OA\Response(response: 404, description: 'Not found'),
        ]
    )]
    public function show(Request $request, Greenhouse $greenhouse): JsonResponse
    {
        Gate::authorize('view', $greenhouse);

        return response()->json([
            'data' => new GreenhouseResource($greenhouse),
        ]);
    }

    #[OA\Put(
        path: '/greenhouses/{id}',
        operationId: 'greenhouseUpdate',
        summary: 'Update a greenhouse',
        security: [['sanctum' => []]],
        tags: ['Greenhouses'],
        parameters: [new OA\Parameter(name: 'id', in: 'path', required: true, schema: new OA\Schema(type: 'integer'))],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(properties: [
                new OA\Property(property: 'name', type: 'string'),
                new OA\Property(property: 'description', type: 'string'),
                new OA\Property(property: 'location', type: 'string'),
            ])
        ),
        responses: [
            new OA\Response(response: 200, description: 'Updated greenhouse',
                content: new OA\JsonContent(properties: [
                    new OA\Property(property: 'data', ref: '#/components/schemas/GreenhouseResource'),
                ])
            ),
            new OA\Response(response: 401, description: 'Unauthenticated'),
            new OA\Response(response: 403, description: 'Forbidden'),
            new OA\Response(response: 404, description: 'Not found'),
            new OA\Response(response: 422, description: 'Validation error'),
        ]
    )]
    public function update(UpdateGreenhouseRequest $request, Greenhouse $greenhouse): JsonResponse
    {
        Gate::authorize('update', $greenhouse);

        $greenhouse->update($request->validated());

        return response()->json([
            'data' => new GreenhouseResource($greenhouse->fresh()),
        ]);
    }

    #[OA\Delete(
        path: '/greenhouses/{id}',
        operationId: 'greenhouseDestroy',
        summary: 'Delete a greenhouse (soft delete)',
        security: [['sanctum' => []]],
        tags: ['Greenhouses'],
        parameters: [new OA\Parameter(name: 'id', in: 'path', required: true, schema: new OA\Schema(type: 'integer'))],
        responses: [
            new OA\Response(response: 204, description: 'Deleted'),
            new OA\Response(response: 401, description: 'Unauthenticated'),
            new OA\Response(response: 403, description: 'Forbidden'),
            new OA\Response(response: 404, description: 'Not found'),
        ]
    )]
    public function destroy(Request $request, Greenhouse $greenhouse): Response
    {
        Gate::authorize('delete', $greenhouse);

        $greenhouse->delete();

        return response()->noContent();
    }
}
