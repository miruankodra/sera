<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Alert extends Model
{
    use HasFactory;

    protected $fillable = [
        'greenhouse_id',
        'sensor_id',
        'sensor_type',
        'value',
        'threshold',
        'operator',
        'message',
        'is_read',
        'triggered_at',
    ];

    protected function casts(): array
    {
        return [
            'value' => 'decimal:4',
            'threshold' => 'decimal:4',
            'is_read' => 'boolean',
            'triggered_at' => 'datetime',
        ];
    }

    public function greenhouse(): BelongsTo
    {
        return $this->belongsTo(Greenhouse::class);
    }

    public function sensor(): BelongsTo
    {
        return $this->belongsTo(Sensor::class);
    }
}
