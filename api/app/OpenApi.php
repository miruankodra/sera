<?php

namespace App;

use OpenApi\Attributes as OA;

#[OA\Info(title: 'Sera Greenhouse API', version: '1.0.0', description: 'REST API for Sera greenhouse management system')]
#[OA\Server(url: 'http://localhost:3000/api/v1', description: 'Local development server')]
#[OA\SecurityScheme(securityScheme: 'sanctum', type: 'http', scheme: 'bearer', bearerFormat: 'Token', description: 'Sanctum token — obtain via POST /auth/login')]
#[OA\Tag(name: 'Auth', description: 'Authentication')]
#[OA\Tag(name: 'User', description: 'Authenticated user profile')]
#[OA\Tag(name: 'Greenhouses', description: 'Greenhouse CRUD')]
#[OA\Tag(name: 'Sensors', description: 'Sensors and sensor readings')]
#[OA\Tag(name: 'Devices', description: 'Devices and commands')]
#[OA\Tag(name: 'Automation Rules', description: 'If-then automation rules')]
#[OA\Tag(name: 'Alerts', description: 'Threshold breach alerts')]
#[OA\Tag(name: 'Tasks', description: 'Calendar tasks')]
abstract class OpenApi {}
