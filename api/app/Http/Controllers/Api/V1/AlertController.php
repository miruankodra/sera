<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\AlertResource;
use App\Models\Alert;
use App\Models\Greenhouse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Gate;
use OpenApi\Attributes as OA;

class AlertController extends Controller
{
    #[OA\Get(
        path: '/greenhouses/{greenhouse}/alerts',
        operationId: 'alertIndex',
        summary: 'List alerts for a greenhouse (newest first)',
        security: [['sanctum' => []]],
        tags: ['Alerts'],
        parameters: [new OA\Parameter(name: 'greenhouse', in: 'path', required: true, schema: new OA\Schema(type: 'integer'))],
        responses: [
            new OA\Response(response: 200, description: 'List of alerts'),
            new OA\Response(response: 401, description: 'Unauthenticated'),
            new OA\Response(response: 403, description: 'Forbidden'),
        ]
    )]
    public function index(Greenhouse $greenhouse): JsonResponse
    {
        Gate::authorize('view', $greenhouse);

        return response()->json([
            'data' => AlertResource::collection($greenhouse->alerts()->orderBy('triggered_at', 'desc')->get()),
        ]);
    }

    #[OA\Post(
        path: '/alerts/{alert}/read',
        operationId: 'alertMarkRead',
        summary: 'Mark an alert as read',
        security: [['sanctum' => []]],
        tags: ['Alerts'],
        parameters: [new OA\Parameter(name: 'alert', in: 'path', required: true, schema: new OA\Schema(type: 'integer'))],
        responses: [
            new OA\Response(response: 204, description: 'Marked as read'),
            new OA\Response(response: 401, description: 'Unauthenticated'),
            new OA\Response(response: 403, description: 'Forbidden'),
            new OA\Response(response: 404, description: 'Not found'),
        ]
    )]
    public function markRead(Alert $alert): Response
    {
        Gate::authorize('markRead', $alert);

        $alert->update(['is_read' => true]);

        return response()->noContent();
    }
}
