<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class University extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'name', 'slug', 'code', 'location', 'description',
        'logo', 'website', 'acronym', 'is_active',
    ];

    protected function casts(): array
    {
        return ['is_active' => 'boolean'];
    }

    public function colleges(): HasMany
    {
        return $this->hasMany(College::class);
    }

    public function programs(): HasMany
    {
        return $this->hasMany(Program::class);
    }

    public function resources(): HasMany
    {
        return $this->hasMany(Resource::class);
    }

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }

    public function getLogoUrlAttribute(): ?string
    {
        if (! $this->logo) {
            return null;
        }

        return \Illuminate\Support\Facades\Storage::disk('public')->url($this->logo);
    }
}