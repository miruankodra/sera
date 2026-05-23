<?php

use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\GreenhouseController;
use App\Http\Controllers\Api\V1\UserController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {
    Route::prefix('auth')->group(function () {
        Route::post('register', [AuthController::class, 'register']);
        Route::post('login', [AuthController::class, 'login']);
        Route::post('logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');
    });

    Route::middleware('auth:sanctum')->group(function () {
        Route::get('user', [UserController::class, 'show']);
        Route::put('user', [UserController::class, 'update']);
        Route::put('user/password', [UserController::class, 'updatePassword']);
        Route::post('user/avatar', [UserController::class, 'uploadAvatar']);
        Route::delete('user/avatar', [UserController::class, 'deleteAvatar']);

        Route::get('greenhouses', [GreenhouseController::class, 'index']);
        Route::post('greenhouses', [GreenhouseController::class, 'store']);
        Route::get('greenhouses/{greenhouse}', [GreenhouseController::class, 'show']);
        Route::put('greenhouses/{greenhouse}', [GreenhouseController::class, 'update']);
        Route::delete('greenhouses/{greenhouse}', [GreenhouseController::class, 'destroy']);
    });
});
