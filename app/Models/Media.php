<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Storage;

class Media extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'user_id', 'name', 'original_name', 'path', 'disk', 'mime_type',
        'extension', 'size', 'collection', 'metadata',
    ];

    protected function casts(): array
    {
        return ['metadata' => 'array'];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function getUrlAttribute(): string
    {
        return Storage::disk($this->disk)->url($this->path);
    }

    public function getSizeLabelAttribute(): string
    {
        $size = $this->size;
        if ($size >= 1048576) {
            return number_format($size / 1048576, 1) . ' MB';
        }
        if ($size >= 1024) {
            return number_format($size / 1024, 0) . ' KB';
        }

        return $size . ' B';
    }

    public function scopeImages(Builder $query): Builder
    {
        return $query->whereIn('mime_type', ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml']);
    }

    public function scopePdfs(Builder $query): Builder
    {
        return $query->where('mime_type', 'application/pdf');
    }

    public function scopeVideos(Builder $query): Builder
    {
        return $query->where('mime_type', 'like', 'video/%');
    }
}