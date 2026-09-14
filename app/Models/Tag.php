<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Tag extends Model
{
    protected $fillable = ['name', 'slug', 'type'];

    protected static function booted(): void
    {
        static::creating(function (Tag $tag) {
            if (! $tag->slug) {
                $tag->slug = \Illuminate\Support\Str::slug($tag->name);
            }
        });
    }

    public function resources(): BelongsToMany
    {
        return $this->belongsToMany(Resource::class);
    }
}