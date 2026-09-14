<?php

namespace App\Models;

use App\Enums\QuizDifficulty;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class QuizQuestion extends Model
{
    protected $fillable = [
        'quiz_id', 'question', 'explanation', 'difficulty', 'points', 'sort_order',
    ];

    protected function casts(): array
    {
        return ['difficulty' => QuizDifficulty::class];
    }

    public function quiz(): BelongsTo
    {
        return $this->belongsTo(Quiz::class);
    }

    public function options(): HasMany
    {
        return $this->hasMany(QuizOption::class, 'question_id')->orderBy('sort_order');
    }

    public function getCorrectOptionAttribute(): ?QuizOption
    {
        return $this->options->firstWhere('is_correct', true);
    }
}