<?php

namespace App\Models;

use App\Enums\QuizDifficulty;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Quiz extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'title', 'slug', 'description', 'subject_id', 'semester_id',
        'unit_id', 'topic_id', 'duration_minutes', 'total_questions',
        'passing_score', 'difficulty', 'status', 'featured',
        'attempts_count', 'auto_submit_on_timeout', 'created_by',
    ];

    protected function casts(): array
    {
        return [
            'featured' => 'boolean',
            'auto_submit_on_timeout' => 'boolean',
            'duration_minutes' => 'integer',
            'passing_score' => 'integer',
            'difficulty' => QuizDifficulty::class,
        ];
    }

    protected static function booted(): void
    {
        static::creating(function (Quiz $quiz) {
            if (! $quiz->slug) {
                $quiz->slug = \Illuminate\Support\Str::slug($quiz->title);
            }
        });
    }

    public function subject(): BelongsTo
    {
        return $this->belongsTo(Subject::class);
    }

    public function semester(): BelongsTo
    {
        return $this->belongsTo(Semester::class);
    }

    public function unit(): BelongsTo
    {
        return $this->belongsTo(Unit::class);
    }

    public function topic(): BelongsTo
    {
        return $this->belongsTo(Topic::class);
    }

    public function questions(): HasMany
    {
        return $this->hasMany(QuizQuestion::class)->orderBy('sort_order');
    }

    public function attempts(): HasMany
    {
        return $this->hasMany(QuizAttempt::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function scopePublished(Builder $query): Builder
    {
        return $query->where('status', 'published');
    }

    public function getIsPublishedAttribute(): bool
    {
        return $this->status === 'published';
    }
}