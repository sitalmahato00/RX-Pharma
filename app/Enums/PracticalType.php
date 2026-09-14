<?php

namespace App\Enums;

enum PracticalType: string
{
    case PracticalNotes = 'practical_notes';
    case LabManuals = 'lab_manuals';
    case VivaQuestions = 'viva_questions';
    case Procedures = 'procedures';
    case Diagrams = 'diagrams';
    case DemonstrationVideos = 'demonstration_videos';

    public function label(): string
    {
        return match ($this) {
            self::PracticalNotes => 'Practical Notes',
            self::LabManuals => 'Lab Manuals',
            self::VivaQuestions => 'Viva Questions',
            self::Procedures => 'Procedures',
            self::Diagrams => 'Diagrams',
            self::DemonstrationVideos => 'Demonstration Videos',
        };
    }
}