import { Head, Link, router, usePage } from '@inertiajs/react';
import { Clock, HelpCircle, ListChecks, Users } from 'lucide-react';
import { useState } from 'react';
import { Badge, Breadcrumb, Card, EmptyState, Pagination, Select } from '@/components/ui';
import { formatNumber } from '@/lib/utils';
import type { Quiz } from '@/types';

interface Paginated<T> {
    data: T[];
    links: { url: string | null; label: string; active: boolean }[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
}

interface SubjectOption {
    id: number;
    name: string;
}

type IndexPageProps = {
    quizzes: Paginated<Quiz>;
    subjects: SubjectOption[];
    filters: { subject_id?: string };
}

function difficultyColor(difficulty: Quiz['difficulty']): 'green' | 'amber' | 'red' {
    if (difficulty === 'easy') return 'green';
    if (difficulty === 'hard') return 'red';
    return 'amber';
}

export default function Index() {
    const { quizzes, subjects, filters } = usePage<IndexPageProps>().props;
    const [subjectId, setSubjectId] = useState(filters.subject_id ?? '');

    const applyFilter = (value: string) => {
        const params: Record<string, string> = {};
        if (value) params.subject_id = value;
        router.get('/quizzes', params, { preserveState: true });
    };

    return (
        <>
            <Head title="Quizzes" />
            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Quizzes' }]} />
                <header className="mt-4 flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-100 text-primary-700">
                        <ListChecks className="h-5 w-5" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-ink">MCQ Quizzes</h1>
                        <p className="text-sm text-muted">{formatNumber(quizzes.total)} quizzes</p>
                    </div>
                </header>

                {subjects.length > 0 && (
                    <div className="mt-6 max-w-xs">
                        <Select
                            label="Subject"
                            value={subjectId}
                            onChange={(e) => {
                                setSubjectId(e.target.value);
                                applyFilter(e.target.value);
                            }}
                        >
                            <option value="">All subjects</option>
                            {subjects.map((subject) => (
                                <option key={subject.id} value={String(subject.id)}>
                                    {subject.name}
                                </option>
                            ))}
                        </Select>
                    </div>
                )}

                {quizzes.data.length === 0 ? (
                    <div className="mt-8">
                        <EmptyState icon={ListChecks} title="No quizzes found" description="Try adjusting the subject filter." />
                    </div>
                ) : (
                    <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                        {quizzes.data.map((quiz) => (
                            <Link key={quiz.id} href={`/quizzes/${quiz.slug}`} className="block">
                                <Card hoverable className="h-full p-5">
                                    <div className="flex flex-wrap items-center gap-2">
                                        {quiz.subject && (
                                            <Badge color="blue" size="sm">
                                                {quiz.subject.name}
                                            </Badge>
                                        )}
                                        <Badge color={difficultyColor(quiz.difficulty)} size="sm">
                                            {quiz.difficulty}
                                        </Badge>
                                    </div>
                                    <h2 className="mt-3 font-semibold text-ink">{quiz.title}</h2>
                                    {quiz.description && (
                                        <p className="mt-1 line-clamp-2 text-sm text-muted">{quiz.description}</p>
                                    )}
                                    <div className="mt-4 grid grid-cols-3 gap-2 border-t border-slate-100 pt-4 text-center">
                                        <div>
                                            <HelpCircle className="mx-auto h-4 w-4 text-primary-700" />
                                            <p className="mt-1 text-sm font-semibold text-ink">{quiz.total_questions}</p>
                                            <p className="text-[11px] text-muted">Questions</p>
                                        </div>
                                        <div>
                                            <Clock className="mx-auto h-4 w-4 text-primary-700" />
                                            <p className="mt-1 text-sm font-semibold text-ink">{quiz.duration_minutes}m</p>
                                            <p className="text-[11px] text-muted">Minutes</p>
                                        </div>
                                        <div>
                                            <Users className="mx-auto h-4 w-4 text-primary-700" />
                                            <p className="mt-1 text-sm font-semibold text-ink">{formatNumber(quiz.attempts_count ?? 0)}</p>
                                            <p className="text-[11px] text-muted">Attempts</p>
                                        </div>
                                    </div>
                                    <p className="mt-3 text-xs text-muted">
                                        Pass score: {quiz.passing_score}%
                                    </p>
                                </Card>
                            </Link>
                        ))}
                    </div>
                )}

                <div className="mt-8 flex justify-center">
                    <Pagination links={quizzes.links} />
                </div>
            </div>
        </>
    );
}
