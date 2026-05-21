<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class AutomationRule extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'greenhouse_id',
        'trigger_sensor_id',
        'operator',
        'threshold',
        'action_device_id',
        'action',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'threshold' => 'decimal:4',
            'is_active' => 'boolean',
        ];
    }

    public function greenhouse(): BelongsTo
    {
        return $this->belongsTo(Greenhouse::class);
    }

    public function triggerSensor(): BelongsTo
    {
        return $this->belongsTo(Sensor::class, 'trigger_sensor_id');
    }

    public function actionDevice(): BelongsTo
    {
        return $this->belongsTo(Device::class, 'action_device_id');
    }
}
