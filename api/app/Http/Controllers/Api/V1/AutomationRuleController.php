<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\AutomationRule\StoreAutomationRuleRequest;
use App\Http\Requests\AutomationRule\UpdateAutomationRuleRequest;
use App\Http\Resources\AutomationRuleResource;
use App\Models\AutomationRule;
use App\Models\Greenhouse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Gate;
use OpenApi\Attributes as OA;

class AutomationRuleController extends Controller
{
    #[OA\Get(
        path: '/greenhouses/{greenhouse}/automation-rules',
        operationId: 'automationRuleIndex',
        summary: 'List automation rules for a greenhouse',
        security: [['sanctum' => []]],
        tags: ['Automation Rules'],
        parameters: [new OA\Parameter(name: 'greenhouse', in: 'path', required: true, schema: new OA\Schema(type: 'integer'))],
        responses: [
            new OA\Response(response: 200, description: 'List of automation rules'),
            new OA\Response(response: 401, description: 'Unauthenticated'),
            new OA\Response(response: 403, description: 'Forbidden'),
        ]
    )]
    public function index(Greenhouse $greenhouse): JsonResponse
    {
        Gate::authorize('view', $greenhouse);

        return response()->json([
            'data' => AutomationRuleResource::collection($greenhouse->automationRules),
        ]);
    }

    #[OA\Post(
        path: '/greenhouses/{greenhouse}/automation-rules',
        operationId: 'automationRuleStore',
        summary: 'Create an automation rule',
        security: [['sanctum' => []]],
        tags: ['Automation Rules'],
        parameters: [new OA\Parameter(name: 'greenhouse', in: 'path', required: true, schema: new OA\Schema(type: 'integer'))],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ['trigger_sensor_id', 'operator', 'threshold', 'action_device_id', 'action'],
                properties: [
                    new OA\Property(property: 'trigger_sensor_id', type: 'integer'),
                    new OA\Property(property: 'operator', type: 'string', enum: ['gt', 'lt', 'eq', 'gte', 'lte']),
                    new OA\Property(property: 'threshold', type: 'number', format: 'float'),
                    new OA\Property(property: 'action_device_id', type: 'integer'),
                    new OA\Property(property: 'action', type: 'string', enum: ['turn_on', 'turn_off']),
                    new OA\Property(property: 'is_active', type: 'boolean'),
                ]
            )
        ),
        responses: [
            new OA\Response(response: 201, description: 'Rule created',
                content: new OA\JsonContent(properties: [
                    new OA\Property(property: 'data', ref: '#/components/schemas/AutomationRuleResource'),
                ])
            ),
            new OA\Response(response: 401, description: 'Unauthenticated'),
            new OA\Response(response: 403, description: 'Forbidden'),
            new OA\Response(response: 422, description: 'Validation error'),
        ]
    )]
    public function store(StoreAutomationRuleRequest $request, Greenhouse $greenhouse): JsonResponse
    {
        Gate::authorize('view', $greenhouse);

        $rule = $greenhouse->automationRules()->create($request->validated());

        return response()->json(['data' => new AutomationRuleResource($rule->fresh())], 201);
    }

    #[OA\Put(
        path: '/automation-rules/{automationRule}',
        operationId: 'automationRuleUpdate',
        summary: 'Update an automation rule',
        security: [['sanctum' => []]],
        tags: ['Automation Rules'],
        parameters: [new OA\Parameter(name: 'automationRule', in: 'path', required: true, schema: new OA\Schema(type: 'integer'))],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(properties: [
                new OA\Property(property: 'operator', type: 'string', enum: ['gt', 'lt', 'eq', 'gte', 'lte']),
                new OA\Property(property: 'threshold', type: 'number', format: 'float'),
                new OA\Property(property: 'action', type: 'string', enum: ['turn_on', 'turn_off']),
                new OA\Property(property: 'is_active', type: 'boolean'),
            ])
        ),
        responses: [
            new OA\Response(response: 200, description: 'Updated rule',
                content: new OA\JsonContent(properties: [
                    new OA\Property(property: 'data', ref: '#/components/schemas/AutomationRuleResource'),
                ])
            ),
            new OA\Response(response: 401, description: 'Unauthenticated'),
            new OA\Response(response: 403, description: 'Forbidden'),
            new OA\Response(response: 404, description: 'Not found'),
            new OA\Response(response: 422, description: 'Validation error'),
        ]
    )]
    public function update(UpdateAutomationRuleRequest $request, AutomationRule $automationRule): JsonResponse
    {
        Gate::authorize('update', $automationRule);

        $automationRule->update($request->validated());

        return response()->json(['data' => new AutomationRuleResource($automationRule->fresh())]);
    }

    #[OA\Delete(
        path: '/automation-rules/{automationRule}',
        operationId: 'automationRuleDestroy',
        summary: 'Delete an automation rule (soft delete)',
        security: [['sanctum' => []]],
        tags: ['Automation Rules'],
        parameters: [new OA\Parameter(name: 'automationRule', in: 'path', required: true, schema: new OA\Schema(type: 'integer'))],
        responses: [
            new OA\Response(response: 204, description: 'Deleted'),
            new OA\Response(response: 401, description: 'Unauthenticated'),
            new OA\Response(response: 403, description: 'Forbidden'),
            new OA\Response(response: 404, description: 'Not found'),
        ]
    )]
    public function destroy(AutomationRule $automationRule): Response
    {
        Gate::authorize('delete', $automationRule);

        $automationRule->delete();

        return response()->noContent();
    }
}
