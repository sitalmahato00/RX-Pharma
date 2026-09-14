<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class Progress extends Model
{
    protected $fillable = [
        'user_id', 'progressable_type', 'progressable_id',
        'status', 'progress_percent', 'last_position', 'completed_at',
    ];

    protected function casts(): array
    {
        return [
            'progress_percent' => 'integer',
            'completed_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function progressable(): MorphTo
    {
        return $this->morphTo();
    }

    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }
}