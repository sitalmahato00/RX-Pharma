<?php

namespace App\Models;

use App\Enums\PracticalType;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;

class PracticalResource extends Model
{
    protected $fillable = [
        'resource_id', 'practical_type', 'resource_path', 'thumbnail', 'steps',
    ];

    protected function casts(): array
    {
        return [
            'practical_type' => PracticalType::class,
            'steps' => 'array',
        ];
    }

    public function resource(): BelongsTo
    {
        return $this->belongsTo(Resource::class);
    }

    public function getResourceUrlAttribute(): ?string
    {
        return $this->resource_path ? Storage::disk('public')->url($this->resource_path) : null;
    }

    public function getThumbnailUrlAttribute(): ?string
    {
        return $this->thumbnail ? Storage::disk('public')->url($this->thumbnail) : null;
    }
}