<?php

namespace App\Models;

use App\Enums\ResourceType;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;

class Resource extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'title', 'slug', 'description', 'resource_type',
        'university_id', 'college_id', 'program_id', 'semester_id',
        'subject_id', 'unit_id', 'topic_id',
        'status', 'featured', 'views_count', 'bookmarks_count', 'downloads_count',
        'published_at', 'created_by',
    ];

    protected function casts(): array
    {
        return [
            'featured' => 'boolean',
            'views_count' => 'integer',
            'bookmarks_count' => 'integer',
            'downloads_count' => 'integer',
            'published_at' => 'datetime',
        ];
    }

    protected static function booted(): void
    {
        static::creating(function (Resource $resource) {
            if (! $resource->slug) {
                $resource->slug = \Illuminate\Support\Str::slug($resource->title);
            }
        });

        static::created(function (Resource $resource) {
            $uniqueSlug = $resource->slug;
            $counter = 1;
            while (Resource::where('slug', $uniqueSlug)->where('id', '!=', $resource->id)->exists()) {
                $uniqueSlug = $resource->slug . '-' . $counter;
                $counter++;
            }
            if ($uniqueSlug !== $resource->slug) {
                $resource->updateQuietly(['slug' => $uniqueSlug]);
            }
        });
    }

    public function university(): BelongsTo
    {
        return $this->belongsTo(University::class);
    }

    public function college(): BelongsTo
    {
        return $this->belongsTo(College::class);
    }

    public function program(): BelongsTo
    {
        return $this->belongsTo(Program::class);
    }

    public function semester(): BelongsTo
    {
        return $this->belongsTo(Semester::class);
    }

    public function subject(): BelongsTo
    {
        return $this->belongsTo(Subject::class);
    }

    public function unit(): BelongsTo
    {
        return $this->belongsTo(Unit::class);
    }

    public function topic(): BelongsTo
    {
        return $this->belongsTo(Topic::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function tags(): BelongsToMany
    {
        return $this->belongsToMany(Tag::class, 'resource_tags');
    }

    public function note(): HasOne
    {
        return $this->hasOne(Note::class);
    }

    public function video(): HasOne
    {
        return $this->hasOne(Video::class);
    }

    public function literature(): HasOne
    {
        return $this->hasOne(Literature::class);
    }

    public function previousPaper(): HasOne
    {
        return $this->hasOne(PreviousPaper::class);
    }

    public function practicalResource(): HasOne
    {
        return $this->hasOne(PracticalResource::class);
    }

    public function isPublished(): bool
    {
        return $this->status === 'published';
    }

    public function scopePublished(Builder $query): Builder
    {
        return $query->where('status', 'published');
    }

    public function scopeOfType(Builder $query, ResourceType|string $type): Builder
    {
        $type = $type instanceof ResourceType ? $type->value : $type;

        return $query->where('resource_type', $type);
    }

    public function scopeFeatured(Builder $query): Builder
    {
        return $query->where('featured', true);
    }

    public function incrementViews(): void
    {
        $this->increment('views_count');
    }
}