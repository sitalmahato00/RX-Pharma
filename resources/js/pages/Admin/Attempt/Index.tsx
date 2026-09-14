import { Head, router, useForm, usePage } from '@inertiajs/react';
import { History, Search, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Alert, Badge, Button, Card, ConfirmDialog, EmptyState, Input, Pagination, Select } from '@/components/ui';
import type { PaginationLink } from '@/components/ui';
import { formatDate, formatDuration } from '@/lib/utils';

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

interface AttemptRow {
    id: number;
    score_percentage: number;
    passed: boolean;
    time_spent_seconds: number;
    completed_at?: string | null;
    status: string;
    user: { id: number; name: string; email: string };
    quiz: { id: number; title: string };
}

interface PageProps {
    flash?: { success?: string; error?: string };
    attempts: Paginated<AttemptRow>;
    quizzes: { id: number; title: string }[];
    filters: { quiz_id?: string; search?: string };
    [key: string]: unknown;
}

export default function Index({ attempts, quizzes, filters }: PageProps) {
    const { props } = usePage<PageProps>();
    const flash = props.flash ?? {};
    const [deleteTarget, setDeleteTarget] = useState<AttemptRow | null>(null);
    const [deleting, setDeleting] = useState(false);

    const form = useForm({
        quiz_id: filters.quiz_id ?? '',
        search: filters.search ?? '',
    });

    const applyFilters = () => {
        const data: Record<string, string> = {};
        if (form.data.quiz_id) data.quiz_id = form.data.quiz_id;
        if (form.data.search.trim()) data.search = form.data.search.trim();
        router.get('/admin/attempts', data, { preserveState: true, replace: true });
    };

    const confirmDelete = () => {
        if (!deleteTarget) return;
        setDeleting(true);
        router.delete(`/admin/attempts/${deleteTarget.id}`, {
            onFinish: () => {
                setDeleting(false);
                setDeleteTarget(null);
            },
        });
    };

    return (
        <div className="space-y-6">
            <Head title="Quiz Attempts" />
            <div>
                <h1 className="text-2xl font-bold text-ink">Quiz Attempts</h1>
                <p className="text-sm text-muted">Review student attempts across all quiz sets.</p>
            </div>

            {flash.success && <Alert type="success">{flash.success}</Alert>}
            {flash.error && <Alert type="error">{flash.error}</Alert>}

            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    applyFilters();
                }}
                className="card flex flex-wrap items-end gap-3 p-4"
            >
                <div className="w-full sm:w-64">
                    <Input
                        label="Search"
                        placeholder="Search by student name or email..."
                        value={form.data.search}
                        onChange={(e) => form.setData('search', e.target.value)}
                        className="pr-9"
                    />
                </div>
                <div className="w-full sm:w-64">
                    <Select label="Quiz set" value={form.data.quiz_id} onChange={(e) => form.setData('quiz_id', e.target.value)}>
                        <option value="">All quizzes</option>
                        {quizzes.map((q) => (
                            <option key={q.id} value={q.id}>
                                {q.title}
                            </option>
                        ))}
                    </Select>
                </div>
                <Button size="md" onClick={() => applyFilters()}>
                    <Search className="h-4 w-4" />
                    Filter
                </Button>
            </form>

            {attempts.data.length === 0 ? (
                <Card className="p-6">
                    <EmptyState icon={History} title="No attempts found" description="No quiz attempts match your filters." />
                </Card>
            ) : (
                <div className="card overflow-x-auto">
                    <table className="w-full min-w-[760px] text-left text-sm">
                        <thead>
                            <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-muted">
                                <th className="px-4 py-3 font-medium">Student</th>
                                <th className="px-4 py-3 font-medium">Quiz</th>
                                <th className="px-4 py-3 font-medium">Score</th>
                                <th className="px-4 py-3 font-medium">Passed</th>
                                <th className="px-4 py-3 font-medium">Time Spent</th>
                                <th className="px-4 py-3 font-medium">Completed At</th>
                                <th className="px-4 py-3 font-medium">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {attempts.data.map((attempt) => (
                                <tr key={attempt.id} className="border-b border-slate-100 transition hover:bg-slate-50/60">
                                    <td className="px-4 py-3">
                                        <div className="font-medium text-ink">{attempt.user.name}</div>
                                        <div className="text-xs text-muted">{attempt.user.email}</div>
                                    </td>
                                    <td className="px-4 py-3">{attempt.quiz.title}</td>
                                    <td className="px-4 py-3 font-medium text-ink">{attempt.score_percentage}%</td>
                                    <td className="px-4 py-3">
                                        <Badge color={attempt.passed ? 'green' : 'red'}>
                                            {attempt.passed ? 'Passed' : 'Failed'}
                                        </Badge>
                                    </td>
                                    <td className="px-4 py-3">{formatDuration(attempt.time_spent_seconds)}</td>
                                    <td className="px-4 py-3 text-muted">
                                        {attempt.status === 'in_progress' ? (
                                            <Badge color="amber">In progress</Badge>
                                        ) : (
                                            formatDate(attempt.completed_at)
                                        )}
                                    </td>
                                    <td className="px-4 py-3">
                                        <Button size="sm" variant="danger" onClick={() => setDeleteTarget(attempt)}>
                                            <Trash2 className="h-3.5 w-3.5" />
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {attempts.links && attempts.links.length > 3 && (
                <div className="flex justify-end">
                    <Pagination links={attempts.links} />
                </div>
            )}

            <ConfirmDialog
                open={!!deleteTarget}
                onClose={() => setDeleteTarget(null)}
                onConfirm={confirmDelete}
                title="Delete attempt?"
                description={`This will permanently delete the attempt by ${deleteTarget?.user.name} on "${deleteTarget?.quiz.title}".`}
                confirmText="Delete"
                loading={deleting}
            />
        </div>
    );
}