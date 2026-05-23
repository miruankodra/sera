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

class AutomationRuleController extends Controller
{
    public function index(Greenhouse $greenhouse): JsonResponse
    {
        Gate::authorize('view', $greenhouse);

        return response()->json([
            'data' => AutomationRuleResource::collection($greenhouse->automationRules),
        ]);
    }

    public function store(StoreAutomationRuleRequest $request, Greenhouse $greenhouse): JsonResponse
    {
        Gate::authorize('view', $greenhouse);

        $rule = $greenhouse->automationRules()->create($request->validated());

        return response()->json(['data' => new AutomationRuleResource($rule->fresh())], 201);
    }

    public function update(UpdateAutomationRuleRequest $request, AutomationRule $automationRule): JsonResponse
    {
        Gate::authorize('update', $automationRule);

        $automationRule->update($request->validated());

        return response()->json(['data' => new AutomationRuleResource($automationRule->fresh())]);
    }

    public function destroy(AutomationRule $automationRule): Response
    {
        Gate::authorize('delete', $automationRule);

        $automationRule->delete();

        return response()->noContent();
    }
}
