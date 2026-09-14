import { Head, router, useForm, usePage } from '@inertiajs/react';
import { ClipboardList, Plus, Search, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Alert, Badge, Button, Card, ConfirmDialog, EmptyState, Input, Pagination, Select } from '@/components/ui';
import type { PaginationLink } from '@/components/ui';
import type { Quiz } from '@/types';

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

interface QuizRow extends Quiz {
    questions_count?: number;
    created_at?: string;
}

interface PageProps {
    flash?: { success?: string; error?: string };
    quizzes: Paginated<QuizRow>;
    subjects: { id: number; name: string }[];
    filters: { search?: string; subject_id?: string; status?: string };
    [key: string]: unknown;
}

const difficultyColor = (difficulty: Quiz['difficulty']) =>
    difficulty === 'easy' ? 'green' : difficulty === 'hard' ? 'red' : 'amber';

const statusColor = (status: Quiz['status']) =>
    status === 'published' ? 'green' : status === 'archived' ? 'orange' : 'neutral';

export default function Index({ quizzes, subjects, filters }: PageProps) {
    const { props } = usePage<PageProps>();
    const flash = props.flash ?? {};

    const [deleteTarget, setDeleteTarget] = useState<QuizRow | null>(null);
    const [deleting, setDeleting] = useState(false);

    const form = useForm({
        search: filters.search ?? '',
        subject_id: filters.subject_id ?? '',
        status: filters.status ?? '',
    });

    const applyFilters = () => {
        const data: Record<string, string> = {};
        if (form.data.search.trim()) data.search = form.data.search.trim();
        if (form.data.subject_id) data.subject_id = form.data.subject_id;
        if (form.data.status) data.status = form.data.status;
        router.get('/admin/quizzes', data, { preserveState: true, replace: true });
    };

    const confirmDelete = () => {
        if (!deleteTarget) return;
        setDeleting(true);
        router.delete(`/admin/quizzes/${deleteTarget.id}`, {
            onFinish: () => {
                setDeleting(false);
                setDeleteTarget(null);
            },
        });
    };

    return (
        <div className="space-y-6">
            <Head title="Quiz Sets" />
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold text-ink">Quiz Sets</h1>
                    <p className="text-sm text-muted">Manage quiz sets for the student platform.</p>
                </div>
                <Button href="/admin/quizzes/create">
                    <Plus className="h-4 w-4" />
                    New Quiz
                </Button>
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
                        placeholder="Search by title..."
                        value={form.data.search}
                        onChange={(e) => form.setData('search', e.target.value)}
                        className="pr-9"
                    />
                </div>
                <div className="w-full sm:w-56">
                    <Select
                        label="Subject"
                        value={form.data.subject_id}
                        onChange={(e) => form.setData('subject_id', e.target.value)}
                    >
                        <option value="">All subjects</option>
                        {subjects.map((s) => (
                            <option key={s.id} value={s.id}>
                                {s.name}
                            </option>
                        ))}
                    </Select>
                </div>
                <div className="w-full sm:w-44">
                    <Select label="Status" value={form.data.status} onChange={(e) => form.setData('status', e.target.value)}>
                        <option value="">All statuses</option>
                        <option value="draft">Draft</option>
                        <option value="published">Published</option>
                        <option value="archived">Archived</option>
                    </Select>
                </div>
                <Button size="md" onClick={() => applyFilters()}>
                    <Search className="h-4 w-4" />
                    Filter
                </Button>
            </form>

            {quizzes.data.length === 0 ? (
                <Card className="p-6">
                    <EmptyState icon={ClipboardList} title="No quiz sets found" description="Create your first quiz to get started." />
                </Card>
            ) : (
                <div className="card overflow-x-auto">
                    <table className="w-full min-w-[820px] text-left text-sm">
                        <thead>
                            <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-muted">
                                <th className="px-4 py-3 font-medium">Quiz</th>
                                <th className="px-4 py-3 font-medium">Subject</th>
                                <th className="px-4 py-3 font-medium">Questions</th>
                                <th className="px-4 py-3 font-medium">Difficulty</th>
                                <th className="px-4 py-3 font-medium">Duration</th>
                                <th className="px-4 py-3 font-medium">Status</th>
                                <th className="px-4 py-3 font-medium">Featured</th>
                                <th className="px-4 py-3 font-medium">Attempts</th>
                                <th className="px-4 py-3 font-medium">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {quizzes.data.map((quiz) => (
                                <tr key={quiz.id} className="border-b border-slate-100 transition hover:bg-slate-50/60">
                                    <td className="px-4 py-3">
                                        <div className="font-medium text-ink">{quiz.title}</div>
                                        <div className="text-xs text-muted">{quiz.slug}</div>
                                    </td>
                                    <td className="px-4 py-3">{quiz.subject?.name ?? '—'}</td>
                                    <td className="px-4 py-3">{quiz.questions_count ?? quiz.total_questions}</td>
                                    <td className="px-4 py-3">
                                        <Badge color={difficultyColor(quiz.difficulty)}>{quiz.difficulty}</Badge>
                                    </td>
                                    <td className="px-4 py-3">{quiz.duration_minutes ? `${quiz.duration_minutes} min` : '—'}</td>
                                    <td className="px-4 py-3">
                                        <Badge color={statusColor(quiz.status)}>{quiz.status}</Badge>
                                    </td>
                                    <td className="px-4 py-3">
                                        {quiz.featured && <Badge color="purple">Featured</Badge>}
                                    </td>
                                    <td className="px-4 py-3">{quiz.attempts_count}</td>
                                    <td className="px-4 py-3">
                                        <div className="flex flex-wrap items-center gap-2">
                                            {quiz.status !== 'published' && (
                                                <Button
                                                    size="sm"
                                                    variant="success"
                                                    onClick={() =>
                                                        router.post(`/admin/quizzes/${quiz.id}/publish`, undefined)
                                                    }
                                                >
                                                    Publish
                                                </Button>
                                            )}
                                            <Button size="sm" variant="secondary" href={`/admin/quizzes/${quiz.id}/edit`}>
                                                Edit
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="secondary"
                                                href={`/admin/questions?quiz_id=${quiz.id}`}
                                            >
                                                Questions
                                            </Button>
                                            <Button size="sm" variant="danger" onClick={() => setDeleteTarget(quiz)}>
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {quizzes.links && quizzes.links.length > 3 && (
                <div className="flex justify-end">
                    <Pagination links={quizzes.links} />
                </div>
            )}

            <ConfirmDialog
                open={!!deleteTarget}
                onClose={() => setDeleteTarget(null)}
                onConfirm={confirmDelete}
                title="Delete quiz?"
                description={`This will permanently delete "${deleteTarget?.title}" and all of its questions.`}
                confirmText="Delete"
                loading={deleting}
            />
        </div>
    );
}