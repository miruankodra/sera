<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\User\UpdatePasswordRequest;
use App\Http\Requests\User\UpdateUserRequest;
use App\Http\Resources\UserResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rules\File;
use OpenApi\Attributes as OA;

class UserController extends Controller
{
    #[OA\Get(
        path: '/user',
        operationId: 'userShow',
        summary: 'Get authenticated user profile',
        security: [['sanctum' => []]],
        tags: ['User'],
        responses: [
            new OA\Response(response: 200, description: 'User profile',
                content: new OA\JsonContent(properties: [
                    new OA\Property(property: 'data', ref: '#/components/schemas/UserResource'),
                ])
            ),
            new OA\Response(response: 401, description: 'Unauthenticated'),
        ]
    )]
    public function show(Request $request): JsonResponse
    {
        return response()->json([
            'data' => new UserResource($request->user()->loadCount('greenhouses')),
        ]);
    }

    #[OA\Put(
        path: '/user',
        operationId: 'userUpdate',
        summary: 'Update user profile',
        security: [['sanctum' => []]],
        tags: ['User'],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(properties: [
                new OA\Property(property: 'name', type: 'string'),
                new OA\Property(property: 'email', type: 'string', format: 'email'),
                new OA\Property(property: 'timezone', type: 'string'),
                new OA\Property(property: 'locale', type: 'string'),
                new OA\Property(property: 'notification_preferences', type: 'object'),
            ])
        ),
        responses: [
            new OA\Response(response: 200, description: 'Updated user',
                content: new OA\JsonContent(properties: [
                    new OA\Property(property: 'data', ref: '#/components/schemas/UserResource'),
                ])
            ),
            new OA\Response(response: 401, description: 'Unauthenticated'),
            new OA\Response(response: 422, description: 'Validation error'),
        ]
    )]
    public function update(UpdateUserRequest $request): JsonResponse
    {
        $request->user()->update($request->validated());

        return response()->json([
            'data' => new UserResource($request->user()->fresh()->loadCount('greenhouses')),
        ]);
    }

    #[OA\Put(
        path: '/user/password',
        operationId: 'userUpdatePassword',
        summary: 'Change password',
        security: [['sanctum' => []]],
        tags: ['User'],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ['current_password', 'password', 'password_confirmation'],
                properties: [
                    new OA\Property(property: 'current_password', type: 'string', format: 'password'),
                    new OA\Property(property: 'password', type: 'string', format: 'password'),
                    new OA\Property(property: 'password_confirmation', type: 'string', format: 'password'),
                ]
            )
        ),
        responses: [
            new OA\Response(response: 204, description: 'Password changed'),
            new OA\Response(response: 401, description: 'Unauthenticated'),
            new OA\Response(response: 422, description: 'Validation error'),
        ]
    )]
    public function updatePassword(UpdatePasswordRequest $request): Response
    {
        $request->user()->update(['password' => Hash::make($request->password)]);

        return response()->noContent();
    }

    #[OA\Post(
        path: '/user/avatar',
        operationId: 'userUploadAvatar',
        summary: 'Upload avatar image',
        security: [['sanctum' => []]],
        tags: ['User'],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\MediaType(
                mediaType: 'multipart/form-data',
                schema: new OA\Schema(
                    required: ['avatar'],
                    properties: [new OA\Property(property: 'avatar', type: 'string', format: 'binary')]
                )
            )
        ),
        responses: [
            new OA\Response(response: 200, description: 'Avatar uploaded',
                content: new OA\JsonContent(properties: [
                    new OA\Property(property: 'data', ref: '#/components/schemas/UserResource'),
                ])
            ),
            new OA\Response(response: 401, description: 'Unauthenticated'),
            new OA\Response(response: 422, description: 'Validation error'),
        ]
    )]
    public function uploadAvatar(Request $request): JsonResponse
    {
        $request->validate([
            'avatar' => ['required', File::types(['jpg', 'jpeg', 'png', 'gif', 'webp'])->max(5 * 1024)],
        ]);

        $user = $request->user();

        if ($user->avatar) {
            Storage::disk('public')->delete($user->avatar);
        }

        $path = $request->file('avatar')->store('avatars', 'public');
        $user->update(['avatar' => $path]);

        return response()->json([
            'data' => new UserResource($user->fresh()->loadCount('greenhouses')),
        ]);
    }

    #[OA\Delete(
        path: '/user/avatar',
        operationId: 'userDeleteAvatar',
        summary: 'Remove avatar',
        security: [['sanctum' => []]],
        tags: ['User'],
        responses: [
            new OA\Response(response: 200, description: 'Avatar removed',
                content: new OA\JsonContent(properties: [
                    new OA\Property(property: 'data', ref: '#/components/schemas/UserResource'),
                ])
            ),
            new OA\Response(response: 401, description: 'Unauthenticated'),
        ]
    )]
    public function deleteAvatar(Request $request): JsonResponse
    {
        $user = $request->user();

        if ($user->avatar) {
            Storage::disk('public')->delete($user->avatar);
        }

        $user->update(['avatar' => null]);

        return response()->json([
            'data' => new UserResource($user->fresh()->loadCount('greenhouses')),
        ]);
    }
}
