import { Head, router, useForm, usePage } from '@inertiajs/react';
import { Eye, MessagesSquare, Search, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Alert, Badge, Button, Card, ConfirmDialog, EmptyState, Input, Pagination, Select } from '@/components/ui';
import type { PaginationLink } from '@/components/ui';
import { formatDate, timeAgo } from '@/lib/utils';

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

interface DiscussionRow {
    id: number;
    title: string;
    slug: string;
    status: 'visible' | 'hidden';
    replies_count: number;
    likes_count: number;
    views_count: number;
    reports_count: number;
    is_pinned?: boolean;
    created_at?: string;
    user: { id: number; name: string; email: string };
    subject?: { id: number; name: string } | null;
}

interface PageProps {
    flash?: { success?: string; error?: string };
    discussions: Paginated<DiscussionRow>;
    filters: { search?: string; status?: string };
    [key: string]: unknown;
}

export default function Index({ discussions, filters }: PageProps) {
    const { props } = usePage<PageProps>();
    const flash = props.flash ?? {};
    const [deleteTarget, setDeleteTarget] = useState<DiscussionRow | null>(null);
    const [deleting, setDeleting] = useState(false);

    const form = useForm({
        search: filters.search ?? '',
        status: filters.status ?? '',
    });

    const applyFilters = () => {
        const data: Record<string, string> = {};
        if (form.data.search.trim()) data.search = form.data.search.trim();
        if (form.data.status) data.status = form.data.status;
        router.get('/admin/discussions', data, { preserveState: true, replace: true });
    };

    const confirmDelete = () => {
        if (!deleteTarget) return;
        setDeleting(true);
        router.delete(`/admin/discussions/${deleteTarget.id}`, {
            onFinish: () => {
                setDeleting(false);
                setDeleteTarget(null);
            },
        });
    };

    return (
        <div className="space-y-6">
            <Head title="Discussions" />
            <div>
                <h1 className="text-2xl font-bold text-ink">Discussions</h1>
                <p className="text-sm text-muted">Moderate student forum discussions.</p>
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
                <div className="w-full sm:w-44">
                    <Select label="Status" value={form.data.status} onChange={(e) => form.setData('status', e.target.value)}>
                        <option value="">All statuses</option>
                        <option value="visible">Visible</option>
                        <option value="hidden">Hidden</option>
                    </Select>
                </div>
                <Button size="md" onClick={() => applyFilters()}>
                    <Search className="h-4 w-4" />
                    Filter
                </Button>
            </form>

            {discussions.data.length === 0 ? (
                <Card className="p-6">
                    <EmptyState icon={MessagesSquare} title="No discussions found" description="No discussions match your filters." />
                </Card>
            ) : (
                <div className="card overflow-x-auto">
                    <table className="w-full min-w-[820px] text-left text-sm">
                        <thead>
                            <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-muted">
                                <th className="px-4 py-3 font-medium">Discussion</th>
                                <th className="px-4 py-3 font-medium">Author</th>
                                <th className="px-4 py-3 font-medium">Subject</th>
                                <th className="px-4 py-3 font-medium">Replies</th>
                                <th className="px-4 py-3 font-medium">Likes</th>
                                <th className="px-4 py-3 font-medium">Status</th>
                                <th className="px-4 py-3 font-medium">Updated</th>
                                <th className="px-4 py-3 font-medium">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {discussions.data.map((discussion) => (
                                <tr key={discussion.id} className="border-b border-slate-100 transition hover:bg-slate-50/60">
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium text-ink">{discussion.title}</span>
                                            {discussion.is_pinned && <Badge color="amber">Pinned</Badge>}
                                            {discussion.reports_count > 0 && (
                                                <Badge color="red">{discussion.reports_count} reports</Badge>
                                            )}
                                        </div>
                                        <div className="text-xs text-muted">{discussion.slug}</div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="font-medium text-ink">{discussion.user.name}</div>
                                        <div className="text-xs text-muted">{timeAgo(discussion.created_at)}</div>
                                    </td>
                                    <td className="px-4 py-3">{discussion.subject?.name ?? '—'}</td>
                                    <td className="px-4 py-3">{discussion.replies_count}</td>
                                    <td className="px-4 py-3">{discussion.likes_count}</td>
                                    <td className="px-4 py-3">
                                        <Badge color={discussion.status === 'visible' ? 'green' : 'neutral'}>
                                            {discussion.status === 'visible' ? 'Visible' : 'Hidden'}
                                        </Badge>
                                    </td>
                                    <td className="px-4 py-3 text-muted">{formatDate(discussion.created_at)}</td>
                                    <td className="px-4 py-3">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <Button size="sm" variant="secondary" href={`/discussions/${discussion.slug}`}>
                                                <Eye className="h-3.5 w-3.5" />
                                                View
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="secondary"
                                                onClick={() => router.post(`/admin/discussions/${discussion.id}/toggle`, undefined)}
                                            >
                                                {discussion.status === 'visible' ? 'Hide' : 'Show'}
                                            </Button>
                                            <Button size="sm" variant="danger" onClick={() => setDeleteTarget(discussion)}>
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

            {discussions.links && discussions.links.length > 3 && (
                <div className="flex justify-end">
                    <Pagination links={discussions.links} />
                </div>
            )}

            <ConfirmDialog
                open={!!deleteTarget}
                onClose={() => setDeleteTarget(null)}
                onConfirm={confirmDelete}
                title="Delete discussion?"
                description={`This will permanently delete "${deleteTarget?.title}" and all of its replies.`}
                confirmText="Delete"
                loading={deleting}
            />
        </div>
    );
}