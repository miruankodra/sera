<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\AlertResource;
use App\Models\Alert;
use App\Models\Greenhouse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Gate;

class AlertController extends Controller
{
    public function index(Greenhouse $greenhouse): JsonResponse
    {
        Gate::authorize('view', $greenhouse);

        return response()->json([
            'data' => AlertResource::collection($greenhouse->alerts()->orderBy('triggered_at', 'desc')->get()),
        ]);
    }

    public function markRead(Alert $alert): Response
    {
        Gate::authorize('markRead', $alert);

        $alert->update(['is_read' => true]);

        return response()->noContent();
    }
}
