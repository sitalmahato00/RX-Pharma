<?php

namespace App\Enums;

enum LiteratureCategory: string
{
    case WhoGuidelines = 'who_guidelines';
    case ResearchArticles = 'research_articles';
    case ClinicalGuidelines = 'clinical_guidelines';
    case Pharmacopoeia = 'pharmacopoeia';
    case DrugGuidelines = 'drug_guidelines';
    case ReferenceBooks = 'reference_books';
    case GovernmentDocuments = 'government_documents';
    case Journals = 'journals';

    public function label(): string
    {
        return match ($this) {
            self::WhoGuidelines => 'WHO Guidelines',
            self::ResearchArticles => 'Research Articles',
            self::ClinicalGuidelines => 'Clinical Guidelines',
            self::Pharmacopoeia => 'Pharmacopoeia',
            self::DrugGuidelines => 'Drug Guidelines',
            self::ReferenceBooks => 'Reference Books',
            self::GovernmentDocuments => 'Government Documents',
            self::Journals => 'Journals',
        };
    }
}