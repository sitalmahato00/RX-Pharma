<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class QuizAttempt extends Model
{
    protected $fillable = [
        'user_id', 'quiz_id', 'total_questions', 'correct_answers', 'wrong_answers',
        'unanswered', 'score_percentage', 'passed', 'time_spent_seconds',
        'status', 'started_at', 'completed_at', 'answers_snapshot',
    ];

    protected function casts(): array
    {
        return [
            'passed' => 'boolean',
            'started_at' => 'datetime',
            'completed_at' => 'datetime',
            'answers_snapshot' => 'array',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function quiz(): BelongsTo
    {
        return $this->belongsTo(Quiz::class);
    }

    public function answers(): HasMany
    {
        return $this->hasMany(QuizAnswer::class, 'attempt_id');
    }

    public function isCompleted(): bool
    {
        return $this->status === 'completed';
    }
}