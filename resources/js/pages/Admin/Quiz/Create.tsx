import { Head } from '@inertiajs/react';
import { Alert, Button } from '@/components/ui';
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

interface CreateProps {
    subjects: OptionItem[];
    semesters: SemesterItem[];
    units: UnitItem[];
    topics: TopicItem[];
    flash?: { success?: string; error?: string };
}

export default function Create({ subjects, semesters, units, topics, flash }: CreateProps) {
    return (
        <div className="mx-auto max-w-5xl space-y-6">
            <Head title="Create Quiz" />
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold text-ink">Create Quiz</h1>
                    <p className="text-sm text-muted">Build a new quiz set with questions and answer options.</p>
                </div>
                <Button variant="secondary" href="/admin/quizzes">
                    Back to quizzes
                </Button>
            </div>

            {flash?.success && <Alert type="success">{flash.success}</Alert>}
            {flash?.error && <Alert type="error">{flash.error}</Alert>}

            <QuizForm mode="create" subjects={subjects} semesters={semesters} units={units} topics={topics} />
        </div>
    );
}