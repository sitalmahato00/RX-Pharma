<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Discussion extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'user_id', 'subject_id', 'semester_id', 'title', 'slug', 'content',
        'tags', 'status', 'views_count', 'replies_count', 'likes_count',
        'reports_count', 'is_pinned',
    ];

    protected function casts(): array
    {
        return [
            'tags' => 'array',
            'is_pinned' => 'boolean',
        ];
    }

    protected static function booted(): void
    {
        static::creating(function (Discussion $discussion) {
            $discussion->slug = \Illuminate\Support\Str::slug($discussion->title);
        });
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function subject(): BelongsTo
    {
        return $this->belongsTo(Subject::class);
    }

    public function replies(): HasMany
    {
        return $this->hasMany(DiscussionReply::class)->with('user');
    }

    public function scopeVisible($query)
    {
        return $query->where('status', 'visible');
    }
}