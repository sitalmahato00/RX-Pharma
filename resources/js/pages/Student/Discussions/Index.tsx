import { Head, Link, router, usePage } from '@inertiajs/react';
import { MessageSquare, Eye, MessageSquarePlus, MessagesSquare, Pin, Search } from 'lucide-react';
import { useState } from 'react';
import { Alert, Avatar, Badge, Button, Card, EmptyState, Pagination, type PaginationLink } from '@/components/ui';
import { timeAgo } from '@/lib/utils';

interface DiscussionRow {
    id: number;
    title: string;
    slug: string;
    content?: string | null;
    is_pinned: boolean;
    views_count: number;
    replies_count: number;
    likes_count?: number;
    created_at: string;
    user?: { id: number; name: string; avatar: string | null } | null;
    subject?: { id: number; name: string } | null;
}

interface SubjectOption {
    id: number;
    name: string;
}

interface Paginator<T> {
    data: T[];
    links: PaginationLink[];
    total: number;
}

interface DiscussionsProps {
    discussions: Paginator<DiscussionRow>;
    popularDiscussions: DiscussionRow[];
    subjects: SubjectOption[];
    filters: {
        subject_id?: number | null;
        search?: string | null;
    };
}

interface Flash {
    flash?: { success?: string; error?: string; warning?: string };
    [key: string]: unknown;
}

export default function DiscussionsIndex(props: DiscussionsProps) {
    const { flash } = usePage<Flash>().props;
    const { appUrl } = usePage<{ appUrl?: string }>().props;
    const { discussions, popularDiscussions, subjects, filters } = props;

    const [search, setSearch] = useState(filters.search ?? '');
    const [subjectId, setSubjectId] = useState(filters.subject_id?.toString() ?? '');

    function authorAvatar(avatar?: string | null): string | undefined {
        if (!avatar) return undefined;
        if (/^https?:\/\//.test(avatar)) return avatar;
        return `${appUrl ?? ''}/storage/${avatar}`;
    }

    function applyFilters() {
        const params: Record<string, string> = {};
        if (search.trim()) params.search = search.trim();
        if (subjectId) params.subject_id = subjectId;
        router.get('/discussions', params, { preserveState: true, replace: true });
    }

    function onSubjectChange(value: string) {
        setSubjectId(value);
        const params: Record<string, string> = {};
        if (search.trim()) params.search = search.trim();
        if (value) params.subject_id = value;
        router.get('/discussions', params, { preserveState: true, replace: true });
    }

    return (
        <div className="space-y-6">
            <Head title="Discussion Forum" />

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
                    <h1 className="text-2xl font-bold text-ink">Discussion Forum</h1>
                    <p className="mt-1 text-sm text-muted">Ask questions, share insights and help your peers.</p>
                </div>
                <Button href="/discussions/create">
                    <MessageSquarePlus className="h-4 w-4" />
                    New discussion
                </Button>
            </div>

            <Card className="p-4">
                <div className="flex flex-col gap-3 sm:flex-row">
                    <div className="relative flex-1">
                        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') applyFilters();
                            }}
                            placeholder="Search discussions..."
                            className="input pl-9"
                        />
                    </div>
                    <select
                        value={subjectId}
                        onChange={(e) => onSubjectChange(e.target.value)}
                        className="input sm:w-56"
                    >
                        <option value="">All subjects</option>
                        {subjects.map((s) => (
                            <option key={s.id} value={s.id}>
                                {s.name}
                            </option>
                        ))}
                    </select>
                    <Button variant="secondary" onClick={applyFilters}>
                        <Search className="h-4 w-4" />
                        Search
                    </Button>
                </div>
            </Card>

            <div className="grid gap-6 lg:grid-cols-3">
                <div className="space-y-4 lg:col-span-2">
                    {discussions.data.length === 0 ? (
                        <Card className="p-6">
                            <EmptyState
                                icon={MessagesSquare}
                                title="No discussions found"
                                description="Try adjusting your search or start a new discussion."
                                action={
                                    <Button size="sm" href="/discussions/create">
                                        Start a discussion
                                    </Button>
                                }
                            />
                        </Card>
                    ) : (
                        discussions.data.map((discussion) => (
                            <Link key={discussion.id} href={`/discussions/${discussion.slug}`} className="block">
                                <div className="card transition hover:shadow-card-hover hover:-translate-y-0.5">
                                    <div className="p-5">
                                        <div className="flex flex-wrap items-center gap-2">
                                            {discussion.is_pinned && (
                                                <Badge size="sm" color="amber">
                                                    <Pin className="mr-1 h-3 w-3" />
                                                    Pinned
                                                </Badge>
                                            )}
                                            {discussion.subject && (
                                                <Badge size="sm" color="blue">
                                                    {discussion.subject.name}
                                                </Badge>
                                            )}
                                            <span className="text-xs text-muted">{timeAgo(discussion.created_at)}</span>
                                        </div>
                                        <h2 className="mt-2 line-clamp-2 text-lg font-semibold text-ink transition group-hover:text-primary-700">
                                            {discussion.title}
                                        </h2>
                                        {discussion.content && (
                                            <p className="mt-1 line-clamp-2 text-sm text-muted">{discussion.content}</p>
                                        )}
                                        <div className="mt-4 flex items-center justify-between gap-3">
                                            <div className="flex min-w-0 items-center gap-2">
                                                <Avatar name={discussion.user?.name ?? 'User'} src={authorAvatar(discussion.user?.avatar)} size="sm" />
                                                <span className="truncate text-sm font-medium text-ink">{discussion.user?.name ?? 'Student'}</span>
                                            </div>
                                            <div className="flex shrink-0 items-center gap-3 text-xs text-muted">
                                                <span className="inline-flex items-center gap-1">
                                                    <MessageSquarePlus className="h-3.5 w-3.5" />
                                                    {discussion.replies_count}
                                                </span>
                                                <span className="inline-flex items-center gap-1">
                                                    <Eye className="h-3.5 w-3.5" />
                                                    {discussion.views_count}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))
                    )}

                    {discussions.links && (
                        <div className="flex justify-center pt-2">
                            <Pagination links={discussions.links} />
                        </div>
                    )}
                </div>

                <aside className="space-y-6">
                    <Card className="p-5">
                        <h2 className="mb-4 flex items-center gap-2 font-semibold text-ink">
                            <MessageSquare className="h-5 w-5 text-primary-600" />
                            Popular this week
                        </h2>
                        <div className="space-y-1">
                            {popularDiscussions.length === 0 ? (
                                <p className="text-sm text-muted">No popular discussions yet.</p>
                            ) : (
                                popularDiscussions.slice(0, 5).map((discussion) => (
                                    <Link
                                        key={discussion.id}
                                        href={`/discussions/${discussion.slug}`}
                                        className="block rounded-lg px-2 py-2.5 transition hover:bg-slate-50"
                                    >
                                        <p className="line-clamp-2 text-sm font-medium text-ink hover:text-primary-700">
                                            {discussion.title}
                                        </p>
                                        <p className="mt-0.5 text-xs text-muted">
                                            {discussion.replies_count} replies · {timeAgo(discussion.created_at)}
                                        </p>
                                    </Link>
                                ))
                            )}
                        </div>
                    </Card>

                    <Card className="p-5">
                        <h2 className="mb-3 font-semibold text-ink">Subjects</h2>
                        <div className="flex flex-wrap gap-2">
                            <button
                                type="button"
                                onClick={() => onSubjectChange('')}
                                className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                                    subjectId === '' ? 'border-primary-600 bg-primary-600 text-white' : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                                }`}
                            >
                                All
                            </button>
                            {subjects.map((s) => (
                                <button
                                    key={s.id}
                                    type="button"
                                    onClick={() => onSubjectChange(s.id.toString())}
                                    className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                                        subjectId === s.id.toString()
                                            ? 'border-primary-600 bg-primary-600 text-white'
                                            : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                                    }`}
                                >
                                    {s.name}
                                </button>
                            ))}
                        </div>
                    </Card>
                </aside>
            </div>
        </div>
    );
}