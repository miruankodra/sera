<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Device extends Model
{
    use HasFactory;

    protected $fillable = [
        'greenhouse_id',
        'name',
        'type',
        'status',
        'last_commanded_at',
    ];

    protected function casts(): array
    {
        return [
            'status' => 'boolean',
            'last_commanded_at' => 'datetime',
        ];
    }

    public function greenhouse(): BelongsTo
    {
        return $this->belongsTo(Greenhouse::class);
    }

    public function commands(): HasMany
    {
        return $this->hasMany(DeviceCommand::class);
    }

    public function automationRules(): HasMany
    {
        return $this->hasMany(AutomationRule::class, 'action_device_id');
    }
}
