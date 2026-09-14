import { Head, router, useForm } from '@inertiajs/react';
import { CheckCircle2, HelpCircle } from 'lucide-react';
import { Alert, Badge, Button, Card, EmptyState, Pagination, Select } from '@/components/ui';
import type { PaginationLink } from '@/components/ui';
import { formatDate } from '@/lib/utils';
import type { QuizOption } from '@/types';

interface Paginated<T> {
    data: T[];
    links: PaginationLink[];
    current_page: number;
    last_page: number;
    total: number;
    from: number;
    to: number;
    per_page: number;
}

interface QuestionRow {
    id: number;
    question: string;
    difficulty?: 'easy' | 'medium' | 'hard';
    points?: number;
    created_at?: string;
    quiz: { id: number; title: string };
    options: QuizOption[];
}

interface PageProps {
    flash?: { success?: string; error?: string };
    questions: Paginated<QuestionRow>;
    quizzes: { id: number; title: string }[];
    filters: { quiz_id?: string };
    [key: string]: unknown;
}

const difficultyColor = (difficulty?: QuestionRow['difficulty']) =>
    difficulty === 'easy' ? 'green' : difficulty === 'hard' ? 'red' : 'amber';

export default function Questions({ questions, quizzes, filters }: PageProps) {
    const form = useForm({ quiz_id: filters.quiz_id ?? '' });

    const applyFilter = () => {
        const data: Record<string, string> = {};
        if (form.data.quiz_id) data.quiz_id = form.data.quiz_id;
        router.get('/admin/questions', data, { preserveState: true, replace: true });
    };

    return (
        <div className="space-y-6">
            <Head title="Questions" />
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold text-ink">Questions</h1>
                    <p className="text-sm text-muted">Browse every question across all quiz sets.</p>
                </div>
            </div>

            <div className="card flex flex-wrap items-end gap-3 p-4">
                <div className="w-full sm:w-72">
                    <Select
                        label="Quiz set"
                        value={form.data.quiz_id}
                        onChange={(e) => {
                            form.setData('quiz_id', e.target.value);
                            const data: Record<string, string> = {};
                            if (e.target.value) data.quiz_id = e.target.value;
                            router.get('/admin/questions', data, { preserveState: true, replace: true });
                        }}
                    >
                        <option value="">All quiz sets</option>
                        {quizzes.map((q) => (
                            <option key={q.id} value={q.id}>
                                {q.title}
                            </option>
                        ))}
                    </Select>
                </div>
                <Button size="md" onClick={() => applyFilter()}>
                    Filter
                </Button>
            </div>

            {questions.data.length === 0 ? (
                <Card className="p-6">
                    <EmptyState icon={HelpCircle} title="No questions found" description="Questions are managed from each quiz's edit page." />
                </Card>
            ) : (
                <div className="space-y-4">
                    {questions.data.map((question) => (
                        <Card key={question.id} className="p-5">
                            <div className="flex flex-wrap items-start justify-between gap-3">
                                <div className="min-w-0 flex-1">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <Badge color={difficultyColor(question.difficulty)}>
                                            {question.difficulty ?? 'medium'}
                                        </Badge>
                                        {typeof question.points === 'number' && (
                                            <Badge color="neutral">{question.points} pt</Badge>
                                        )}
                                        <Badge color="blue">{question.quiz.title}</Badge>
                                    </div>
                                    <p className="mt-2 font-medium text-ink">{question.question}</p>
                                </div>
                                <span className="shrink-0 text-xs text-muted">{formatDate(question.created_at)}</span>
                            </div>
                            <div className="mt-4 grid gap-2 sm:grid-cols-2">
                                {question.options.map((option) => (
                                    <div
                                        key={option.id}
                                        className={
                                            option.is_correct
                                                ? 'flex items-start gap-2 rounded-lg border border-green-200 bg-green-50/60 px-3 py-2'
                                                : 'flex items-start gap-2 rounded-lg border border-slate-200 px-3 py-2'
                                        }
                                    >
                                        {option.is_correct && (
                                            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />
                                        )}
                                        <span className="text-sm">
                                            <span className="font-medium text-slate-600">{option.label}.</span>{' '}
                                            <span className={option.is_correct ? 'text-green-800' : 'text-ink'}>
                                                {option.option_text}
                                            </span>
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            {questions.links && questions.links.length > 3 && (
                <div className="flex justify-end">
                    <Pagination links={questions.links} />
                </div>
            )}
        </div>
    );
}