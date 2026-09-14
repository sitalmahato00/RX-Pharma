<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;

class Note extends Model
{
    protected $fillable = [
        'resource_id', 'cover_image', 'file_path', 'file_name', 'file_size',
        'file_mime', 'author', 'toc', 'pages',
    ];

    protected function casts(): array
    {
        return ['toc' => 'array'];
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