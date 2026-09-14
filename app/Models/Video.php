<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;

class Video extends Model
{
    protected $fillable = [
        'resource_id', 'thumbnail', 'video_url', 'video_path', 'video_type',
        'provider', 'duration_seconds', 'views',
    ];

    protected function casts(): array
    {
        return ['duration_seconds' => 'integer'];
    }

    public function resource(): BelongsTo
    {
        return $this->belongsTo(Resource::class);
    }

    public function getThumbnailUrlAttribute(): ?string
    {
        return $this->thumbnail ? Storage::disk('public')->url($this->thumbnail) : null;
    }

    public function getVideoFileUrlAttribute(): ?string
    {
        return $this->video_path ? Storage::disk('public')->url($this->video_path) : null;
    }

    public function getPlaybackUrlAttribute(): ?string
    {
        return $this->video_url ?: $this->video_file_url;
    }

    public function getDurationLabelAttribute(): string
    {
        $seconds = $this->duration_seconds ?? 0;
        $m = intdiv($seconds, 60);
        $s = $seconds % 60;

        return sprintf('%d:%02d', $m, $s);
    }

    public function getEmbedUrlAttribute(): ?string
    {
        $url = $this->video_url;
        if (! $url) {
            return null;
        }

        if (str_contains($url, 'youtube.com/watch')) {
            return str_replace('watch?v=', 'embed/', $url);
        }

        if (str_contains($url, 'youtu.be/')) {
            return str_replace('youtu.be/', 'youtube.com/embed/', $url);
        }

        if (str_contains($url, 'vimeo.com')) {
            preg_match('#vimeo\.com/(\d+)#', $url, $m);

            return $m ? "https://player.vimeo.com/video/{$m[1]}" : null;
        }

        return null;
    }
}