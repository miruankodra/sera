<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Task\StoreTaskRequest;
use App\Http\Requests\Task\UpdateTaskRequest;
use App\Http\Resources\TaskResource;
use App\Models\Greenhouse;
use App\Models\Task;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Gate;
use OpenApi\Attributes as OA;

class TaskController extends Controller
{
    #[OA\Get(
        path: '/greenhouses/{greenhouse}/tasks',
        operationId: 'taskIndex',
        summary: 'List tasks for a greenhouse (ordered by scheduled_at)',
        security: [['sanctum' => []]],
        tags: ['Tasks'],
        parameters: [new OA\Parameter(name: 'greenhouse', in: 'path', required: true, schema: new OA\Schema(type: 'integer'))],
        responses: [
            new OA\Response(response: 200, description: 'List of tasks'),
            new OA\Response(response: 401, description: 'Unauthenticated'),
            new OA\Response(response: 403, description: 'Forbidden'),
        ]
    )]
    public function index(Greenhouse $greenhouse): JsonResponse
    {
        Gate::authorize('view', $greenhouse);

        return response()->json([
            'data' => TaskResource::collection($greenhouse->tasks()->orderBy('scheduled_at')->get()),
        ]);
    }

    #[OA\Post(
        path: '/greenhouses/{greenhouse}/tasks',
        operationId: 'taskStore',
        summary: 'Create a task',
        security: [['sanctum' => []]],
        tags: ['Tasks'],
        parameters: [new OA\Parameter(name: 'greenhouse', in: 'path', required: true, schema: new OA\Schema(type: 'integer'))],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ['title', 'type', 'payload', 'scheduled_at'],
                properties: [
                    new OA\Property(property: 'title', type: 'string', example: 'Water plants'),
                    new OA\Property(property: 'type', type: 'string', enum: ['reminder', 'system_command']),
                    new OA\Property(property: 'payload', type: 'object'),
                    new OA\Property(property: 'scheduled_at', type: 'string', format: 'date-time'),
                ]
            )
        ),
        responses: [
            new OA\Response(response: 201, description: 'Task created',
                content: new OA\JsonContent(properties: [
                    new OA\Property(property: 'data', ref: '#/components/schemas/TaskResource'),
                ])
            ),
            new OA\Response(response: 401, description: 'Unauthenticated'),
            new OA\Response(response: 403, description: 'Forbidden'),
            new OA\Response(response: 422, description: 'Validation error'),
        ]
    )]
    public function store(StoreTaskRequest $request, Greenhouse $greenhouse): JsonResponse
    {
        Gate::authorize('view', $greenhouse);

        $task = $greenhouse->tasks()->create($request->validated());

        return response()->json(['data' => new TaskResource($task->fresh())], 201);
    }

    #[OA\Put(
        path: '/tasks/{task}',
        operationId: 'taskUpdate',
        summary: 'Update a task',
        security: [['sanctum' => []]],
        tags: ['Tasks'],
        parameters: [new OA\Parameter(name: 'task', in: 'path', required: true, schema: new OA\Schema(type: 'integer'))],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(properties: [
                new OA\Property(property: 'title', type: 'string'),
                new OA\Property(property: 'type', type: 'string', enum: ['reminder', 'system_command']),
                new OA\Property(property: 'payload', type: 'object'),
                new OA\Property(property: 'scheduled_at', type: 'string', format: 'date-time'),
                new OA\Property(property: 'is_completed', type: 'boolean'),
            ])
        ),
        responses: [
            new OA\Response(response: 200, description: 'Updated task',
                content: new OA\JsonContent(properties: [
                    new OA\Property(property: 'data', ref: '#/components/schemas/TaskResource'),
                ])
            ),
            new OA\Response(response: 401, description: 'Unauthenticated'),
            new OA\Response(response: 403, description: 'Forbidden'),
            new OA\Response(response: 404, description: 'Not found'),
            new OA\Response(response: 422, description: 'Validation error'),
        ]
    )]
    public function update(UpdateTaskRequest $request, Task $task): JsonResponse
    {
        Gate::authorize('update', $task);

        $task->update($request->validated());

        return response()->json(['data' => new TaskResource($task->fresh())]);
    }

    #[OA\Delete(
        path: '/tasks/{task}',
        operationId: 'taskDestroy',
        summary: 'Delete a task',
        security: [['sanctum' => []]],
        tags: ['Tasks'],
        parameters: [new OA\Parameter(name: 'task', in: 'path', required: true, schema: new OA\Schema(type: 'integer'))],
        responses: [
            new OA\Response(response: 204, description: 'Deleted'),
            new OA\Response(response: 401, description: 'Unauthenticated'),
            new OA\Response(response: 403, description: 'Forbidden'),
            new OA\Response(response: 404, description: 'Not found'),
        ]
    )]
    public function destroy(Task $task): Response
    {
        Gate::authorize('delete', $task);

        $task->delete();

        return response()->noContent();
    }
}
