import { Head } from '@inertiajs/react';
import { Alert, Button } from '@/components/ui';
import type { Quiz, QuizOption } from '@/types';
import QuizForm from './QuizForm';

interface OptionItem {
    id: number;
    name: string;
}

interface SemesterItem {
    id: number;
    name: string;
    number: number;
}

interface UnitItem {
    id: number;
    name: string;
    subject_id: number;
}

interface TopicItem {
    id: number;
    name: string;
    unit_id: number;
}

interface EditableQuestion {
    question: string;
    explanation?: string | null;
    difficulty?: 'easy' | 'medium' | 'hard';
    points?: number;
    options: QuizOption[];
}

interface EditProps {
    quiz: Quiz & { questions?: EditableQuestion[] };
    subjects: OptionItem[];
    semesters: SemesterItem[];
    units: UnitItem[];
    topics: TopicItem[];
    flash?: { success?: string; error?: string };
}

export default function Edit({ quiz, subjects, semesters, units, topics, flash }: EditProps) {
    return (
        <div className="mx-auto max-w-5xl space-y-6">
            <Head title={`Edit ${quiz.title}`} />
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold text-ink">Edit Quiz</h1>
                    <p className="text-sm text-muted">{quiz.title}</p>
                </div>
                <Button variant="secondary" href="/admin/quizzes">
                    Back to quizzes
                </Button>
            </div>

            {flash?.success && <Alert type="success">{flash.success}</Alert>}
            {flash?.error && <Alert type="error">{flash.error}</Alert>}

            <QuizForm
                mode="edit"
                quiz={quiz}
                subjects={subjects}
                semesters={semesters}
                units={units}
                topics={topics}
            />
        </div>
    );
}