<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Setting extends Model
{
    protected $fillable = ['key', 'value', 'group'];

    protected $casts = [
        'value' => 'string',
    ];

    public static function get(string $key, mixed $default = null): mixed
    {
        $setting = static::where('key', $key)->first();

        if (! $setting) {
            return $default;
        }

        $value = $setting->value;
        $decoded = json_decode($value, true);

        return $decoded === null && $value !== 'null' ? $value : $decoded;
    }

    public static function set(string $key, mixed $value, string $group = 'general'): void
    {
        $stored = $value;

        if (is_array($value) || is_bool($value) || is_object($value)) {
            $stored = json_encode($value);
        }

        static::updateOrCreate(
            ['key' => $key],
            ['value' => is_string($stored) ? $stored : (string) $stored, 'group' => $group]
        );
    }
}