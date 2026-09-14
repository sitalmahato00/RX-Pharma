<?php

namespace App\Models;

use App\Enums\LiteratureCategory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;

class Literature extends Model
{
    protected $table = 'literature';

    protected $fillable = [
        'resource_id', 'category', 'author', 'organization', 'year',
        'file_path', 'external_url', 'cover_image',
    ];

    protected function casts(): array
    {
        return ['category' => LiteratureCategory::class];
    }

    public function resource(): BelongsTo
    {
        return $this->belongsTo(Resource::class);
    }

    public function getFileUrlAttribute(): ?string
    {
        return $this->file_path ? Storage::disk('public')->url($this->file_path) : null;
    }

    public function getCoverUrlAttribute(): ?string
    {
        return $this->cover_image ? Storage::disk('public')->url($this->cover_image) : null;
    }
}