import { Head, Link, usePage } from '@inertiajs/react';
import { GraduationCap, ArrowRight, Clock, Trophy, XCircle } from 'lucide-react';
import { Alert, Badge, Button, Card, EmptyState, Pagination, type PaginationLink, StatCard } from '@/components/ui';
import { formatDate, formatDuration } from '@/lib/utils';
import type { Quiz, Subject } from '@/types';

interface AttemptRow {
    id: number;
    quiz_id: number;
    quiz?: (Quiz & { subject?: Subject | null }) | null;
    total_questions: number;
    correct_answers: number;
    wrong_answers: number;
    unanswered: number;
    score_percentage: number;
    passed: boolean;
    time_spent_seconds: number;
    status: string;
    started_at?: string | null;
    completed_at?: string | null;
    created_at?: string | null;
}

interface Paginator<T> {
    data: T[];
    links: PaginationLink[];
    total: number;
    current_page: number;
    last_page: number;
    from?: number | null;
    to?: number | null;
}

interface QuizResultsProps {
    attempts: Paginator<AttemptRow>;
}

export default function QuizResults(props: QuizResultsProps) {
    const { flash } = usePage<{ flash?: { success?: string; error?: string; warning?: string } }>().props;
    const { attempts } = props;

    const passed = attempts.data.filter((a) => a.passed).length;
    const average =
        attempts.data.length > 0
            ? Math.round(attempts.data.reduce((sum, a) => sum + a.score_percentage, 0) / attempts.data.length)
            : 0;

    return (
        <div className="space-y-6">
            <Head title="Quiz Results" />

            {flash?.success && (
                <Alert type="success" dismissible>
                    {flash.success}
                </Alert>
            )}
            {flash?.error && (
                <Alert type="error" dismissible>
                    {flash.error}
                </Alert>
            )}
            {flash?.warning && (
                <Alert type="warning" dismissible>
                    {flash.warning}
                </Alert>
            )}

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-ink">Quiz Results</h1>
                    <p className="mt-1 text-sm text-muted">A history of all your quiz attempts and scores.</p>
                </div>
                <Button href="/quizzes">
                    <GraduationCap className="h-4 w-4" />
                    Take a quiz
                </Button>
            </div>

            <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <StatCard icon={GraduationCap} label="Total attempts" value={attempts.total} accent="primary" />
                <StatCard icon={Trophy} label="Passed (page)" value={passed} accent="green" />
                <StatCard icon={Trophy} label="Average score (page)" value={`${average}%`} accent="amber" />
            </section>

            <Card className="p-6">
                {attempts.data.length === 0 ? (
                    <EmptyState
                        icon={GraduationCap}
                        title="No quiz attempts yet"
                        description="Take your first quiz to see your results here."
                        action={
                            <Button size="sm" href="/quizzes">
                                Browse quizzes
                            </Button>
                        }
                    />
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[720px] text-left">
                            <thead>
                                <tr className="border-b border-slate-200 text-xs font-medium uppercase tracking-wider text-muted">
                                    <th className="pb-3 pr-4">Quiz</th>
                                    <th className="pb-3 pr-4">Date</th>
                                    <th className="pb-3 pr-4">Score</th>
                                    <th className="pb-3 pr-4">Result</th>
                                    <th className="pb-3 pr-4">Time</th>
                                    <th className="pb-3 text-right">Review</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {attempts.data.map((attempt) => (
                                    <tr key={attempt.id}>
                                        <td className="py-3.5 pr-4">
                                            <p className="font-medium text-ink">{attempt.quiz?.title ?? 'Quiz'}</p>
                                            {attempt.quiz?.subject && (
                                                <p className="mt-0.5 text-xs text-muted">{attempt.quiz.subject.name}</p>
                                            )}
                                        </td>
                                        <td className="py-3.5 pr-4 text-sm text-muted">
                                            {formatDate(attempt.completed_at ?? attempt.created_at)}
                                        </td>
                                        <td className="py-3.5 pr-4">
                                            <span className="text-sm font-semibold text-ink">
                                                {attempt.status === 'completed' ? `${attempt.score_percentage}%` : '—'}
                                            </span>
                                        </td>
                                        <td className="py-3.5 pr-4">
                                            {attempt.status !== 'completed' ? (
                                                <Badge size="sm" color="neutral">
                                                    In progress
                                                </Badge>
                                            ) : attempt.passed ? (
                                                <Badge size="sm" color="green">
                                                    <Trophy className="mr-1 h-3 w-3" />
                                                    Passed
                                                </Badge>
                                            ) : (
                                                <Badge size="sm" color="red">
                                                    <XCircle className="mr-1 h-3 w-3" />
                                                    Failed
                                                </Badge>
                                            )}
                                        </td>
                                        <td className="py-3.5 pr-4 text-sm text-muted">
                                            <span className="inline-flex items-center gap-1.5">
                                                <Clock className="h-3.5 w-3.5" />
                                                {formatDuration(attempt.time_spent_seconds)}
                                            </span>
                                        </td>
                                        <td className="py-3.5 text-right">
                                            {attempt.quiz && attempt.status === 'completed' ? (
                                                <Button size="sm" variant="ghost" href={`/quizzes/${attempt.quiz.slug}/results/${attempt.id}`}>
                                                    Review
                                                    <ArrowRight className="h-3.5 w-3.5" />
                                                </Button>
                                            ) : attempt.quiz ? (
                                                <Button size="sm" variant="ghost" href={`/quizzes/${attempt.quiz.slug}/attempt`}>
                                                    Continue
                                                </Button>
                                            ) : null}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {attempts.links && <div className="mt-6 flex justify-center"><Pagination links={attempts.links} /></div>}
            </Card>
        </div>
    );
}