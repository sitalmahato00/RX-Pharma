<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class ActivityLog extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'user_id', 'action', 'description', 'resource_type',
        'resource_id', 'ip', 'user_agent', 'metadata', 'created_at',
    ];

    protected function casts(): array
    {
        return [
            'metadata' => 'array',
            'created_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public static function record(
        ?User $user,
        string $action,
        string $description,
        ?string $resourceType = null,
        ?int $resourceId = null,
        ?array $metadata = null
    ): void {
        self::create([
            'user_id' => $user?->id,
            'action' => $action,
            'description' => $description,
            'resource_type' => $resourceType,
            'resource_id' => $resourceId,
            'ip' => request()->ip(),
            'user_agent' => request()->userAgent(),
            'metadata' => $metadata,
            'created_at' => now(),
        ]);
    }
}