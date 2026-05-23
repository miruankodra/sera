<?php

use App\Http\Controllers\Api\V1\AlertController;
use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\AutomationRuleController;
use App\Http\Controllers\Api\V1\DeviceController;
use App\Http\Controllers\Api\V1\GreenhouseController;
use App\Http\Controllers\Api\V1\SensorController;
use App\Http\Controllers\Api\V1\SensorReadingController;
use App\Http\Controllers\Api\V1\TaskController;
use App\Http\Controllers\Api\V1\UserController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {
    Route::prefix('auth')->group(function () {
        Route::post('register', [AuthController::class, 'register'])->middleware('throttle:5,1');
        Route::post('login', [AuthController::class, 'login'])->middleware('throttle:5,1');
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

        Route::get('greenhouses/{greenhouse}/sensors', [SensorController::class, 'index']);
        Route::post('greenhouses/{greenhouse}/sensors', [SensorController::class, 'store']);
        Route::get('sensors/{sensor}', [SensorController::class, 'show']);
        Route::delete('sensors/{sensor}', [SensorController::class, 'destroy']);
        Route::post('sensors/{sensor}/readings', [SensorReadingController::class, 'store'])->middleware('throttle:ingestion');
        Route::get('sensors/{sensor}/readings', [SensorReadingController::class, 'index']);

        Route::get('greenhouses/{greenhouse}/devices', [DeviceController::class, 'index']);
        Route::post('greenhouses/{greenhouse}/devices', [DeviceController::class, 'store']);
        Route::get('devices/{device}', [DeviceController::class, 'show']);
        Route::put('devices/{device}', [DeviceController::class, 'update']);
        Route::delete('devices/{device}', [DeviceController::class, 'destroy']);
        Route::post('devices/{device}/command', [DeviceController::class, 'command']);

        Route::get('greenhouses/{greenhouse}/automation-rules', [AutomationRuleController::class, 'index']);
        Route::post('greenhouses/{greenhouse}/automation-rules', [AutomationRuleController::class, 'store']);
        Route::put('automation-rules/{automationRule}', [AutomationRuleController::class, 'update']);
        Route::delete('automation-rules/{automationRule}', [AutomationRuleController::class, 'destroy']);

        Route::get('greenhouses/{greenhouse}/alerts', [AlertController::class, 'index']);
        Route::post('alerts/{alert}/read', [AlertController::class, 'markRead']);

        Route::get('greenhouses/{greenhouse}/tasks', [TaskController::class, 'index']);
        Route::post('greenhouses/{greenhouse}/tasks', [TaskController::class, 'store']);
        Route::put('tasks/{task}', [TaskController::class, 'update']);
        Route::delete('tasks/{task}', [TaskController::class, 'destroy']);
    });
});
