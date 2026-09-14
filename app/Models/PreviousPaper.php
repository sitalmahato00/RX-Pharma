<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;

class PreviousPaper extends Model
{
    protected $fillable = [
        'resource_id', 'year', 'exam_type', 'file_path', 'file_name',
        'file_size', 'answer_key_path', 'has_answer_key',
    ];

    protected function casts(): array
    {
        return ['has_answer_key' => 'boolean'];
    }

    public function resource(): BelongsTo
    {
        return $this->belongsTo(Resource::class);
    }

    public function getFileUrlAttribute(): ?string
    {
        return $this->file_path ? Storage::disk('public')->url($this->file_path) : null;
    }

    public function getAnswerKeyUrlAttribute(): ?string
    {
        return $this->answer_key_path ? Storage::disk('public')->url($this->answer_key_path) : null;
    }
}