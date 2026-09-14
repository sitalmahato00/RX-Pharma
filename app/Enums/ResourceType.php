<?php

namespace App\Enums;

enum ResourceType: string
{
    case Note = 'note';
    case Video = 'video';
    case Literature = 'literature';
    case PreviousPaper = 'previous_paper';
    case Practical = 'practical';

    public function label(): string
    {
        return match ($this) {
            self::Note => 'Note',
            self::Video => 'Video',
            self::Literature => 'Literature',
            self::PreviousPaper => 'Previous Paper',
            self::Practical => 'Practical & Viva',
        };
    }

    public function plural(): string
    {
        return match ($this) {
            self::Note => 'Notes',
            self::Video => 'Videos',
            self::Literature => 'Literature',
            self::PreviousPaper => 'Previous Papers',
            self::Practical => 'Practical & Viva',
        };
    }

    public function routePrefix(): string
    {
        return match ($this) {
            self::Note => 'notes',
            self::Video => 'videos',
            self::Literature => 'literature',
            self::PreviousPaper => 'previous-papers',
            self::Practical => 'practical-viva',
        };
    }
}