import { Head, Link, router, usePage } from '@inertiajs/react';
import { Alert, Badge, Button, Card, ConfirmDialog, EmptyState, Input, Pagination, Select } from '@/components/ui';
import type { BadgeColor } from '@/components/ui';
import { Pencil, Plus, Star, Trash2, Video } from 'lucide-react';
import { useState } from 'react';
import { cn, formatDuration, formatNumber } from '@/lib/utils';
import type { PaginationLink } from '@/components/ui';

interface VideoDetail {
    id: number;
    video_type: 'url' | 'upload';
    duration_seconds?: number | null;
    duration_label?: string;
}

interface VideoResource {
    id: number;
    title: string;
    slug: string;
    status: 'draft' | 'published' | 'archived';
    featured: boolean;
    views_count: number;
    subject?: { id: number; name: string };
    video?: VideoDetail;
}

interface Subject {
    id: number;
    name: string;
}

interface Props {
    videos: { data: VideoResource[]; links: PaginationLink[] };
    subjects: Subject[];
    filters: { search?: string; subject_id?: string; status?: string };
}

const statusColor: Record<string, BadgeColor> = {
    draft: 'neutral',
    published: 'green',
    archived: 'orange',
};

export default function Index({ videos, subjects, filters }: Props) {
    const { flash } = usePage<{ flash: { success?: string } }>().props;
    const [search, setSearch] = useState(filters.search ?? '');
    const [subjectId, setSubjectId] = useState(filters.subject_id ?? '');
    const [status, setStatus] = useState(filters.status ?? '');
    const [deleting, setDeleting] = useState<VideoResource | null>(null);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/admin/videos', { search, subject_id: subjectId || undefined, status: status || undefined }, { preserveState: true, replace: true });
    };

    const handleDelete = () => {
        if (!deleting) return;
        router.delete(`/admin/videos/${deleting.id}`, {
            onSuccess: () => setDeleting(null),
        });
    };

    return (
        <>
            <Head title="Videos" />

            <div className="space-y-6">
                {flash.success && <Alert type="success" dismissible>{flash.success}</Alert>}

                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-ink">Videos</h1>
                        <p className="mt-1 text-sm text-muted">Manage video lectures and tutorials.</p>
                    </div>
                    <Button href="/admin/videos/create" size="sm">
                        <Plus className="h-4 w-4" /> New Video
                    </Button>
                </div>

                <Card className="p-4">
                    <form onSubmit={handleSearch} className="flex flex-wrap gap-3">
                        <div className="min-w-[180px] flex-1">
                            <Input placeholder="Search videos..." value={search} onChange={(e) => setSearch(e.target.value)} />
                        </div>
                        <div className="w-56">
                            <Select value={subjectId} onChange={(e) => setSubjectId(e.target.value)}>
                                <option value="">All Subjects</option>
                                {subjects.map((s) => (
                                    <option key={s.id} value={s.id}>{s.name}</option>
                                ))}
                            </Select>
                        </div>
                        <div className="w-40">
                            <Select value={status} onChange={(e) => setStatus(e.target.value)}>
                                <option value="">All Status</option>
                                <option value="draft">Draft</option>
                                <option value="published">Published</option>
                                <option value="archived">Archived</option>
                            </Select>
                        </div>
                        <Button type="submit" variant="secondary" size="sm">Search</Button>
                        {(filters.search || filters.subject_id || filters.status) && (
                            <Link href="/admin/videos" className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm text-ink hover:bg-slate-50">
                                Clear
                            </Link>
                        )}
                    </form>
                </Card>

                {videos.data.length === 0 ? (
                    <EmptyState icon={Video} title="No videos found" description="Get started by adding a video." action={<Button href="/admin/videos/create" size="sm"><Plus className="h-4 w-4" /> Add Video</Button>} />
                ) : (
                    <>
                        <div className="hidden overflow-hidden rounded-xl border border-slate-200 bg-white shadow-card md:block">
                            <table className="min-w-full divide-y divide-slate-200">
                                <thead className="bg-slate-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted">Title</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted">Subject</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted">Type</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted">Duration</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted">Status</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted">Views</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted">Featured</th>
                                        <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {videos.data.map((v) => (
                                        <tr key={v.id} className="hover:bg-slate-50/50">
                                            <td className="px-4 py-3">
                                                <p className="text-sm font-medium text-ink">{v.title}</p>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-muted">{v.subject?.name ?? '—'}</td>
                                            <td className="px-4 py-3 text-sm text-muted">{v.video?.video_type ?? '—'}</td>
                                            <td className="px-4 py-3 text-sm text-muted">{v.video?.duration_label ?? formatDuration(v.video?.duration_seconds)}</td>
                                            <td className="px-4 py-3">
                                                <Badge color={statusColor[v.status] ?? 'neutral'} size="sm">{v.status}</Badge>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-muted">{formatNumber(v.views_count)}</td>
                                            <td className="px-4 py-3">
                                                <span className={cn('inline-flex items-center gap-1 text-sm', v.featured ? 'text-amber-500' : 'text-slate-300')}>
                                                    <Star className="h-4 w-4 fill-current" />
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center justify-end gap-1">
                                                    {v.status !== 'published' && (
                                                        <button
                                                            type="button"
                                                            onClick={() => router.post(`/admin/videos/${v.id}/publish`)}
                                                            className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-green-700 transition hover:bg-green-50"
                                                        >
                                                            Publish
                                                        </button>
                                                    )}
                                                    <button
                                                        type="button"
                                                        onClick={() => router.post(`/admin/videos/${v.id}/toggle-feature`)}
                                                        className={cn(
                                                            'inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium transition',
                                                            v.featured ? 'text-amber-700 hover:bg-amber-50' : 'text-slate-600 hover:bg-slate-100'
                                                        )}
                                                    >
                                                        {v.featured ? 'Unfeature' : 'Feature'}
                                                    </button>
                                                    <Link href={`/admin/videos/${v.id}/edit`} className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-blue-700 transition hover:bg-blue-50">
                                                        <Pencil className="h-3.5 w-3.5" /> Edit
                                                    </Link>
                                                    <button type="button" onClick={() => setDeleting(v)} className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-red-600 transition hover:bg-red-50">
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="space-y-3 md:hidden">
                            {videos.data.map((v) => (
                                <Card key={v.id} className="p-4">
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="min-w-0">
                                            <p className="font-medium text-ink">{v.title}</p>
                                            <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted">
                                                <span>{v.subject?.name ?? '—'}</span>
                                                <span>{v.video?.duration_label ?? formatDuration(v.video?.duration_seconds)}</span>
                                                <span>{formatNumber(v.views_count)} views</span>
                                                <Badge color={statusColor[v.status] ?? 'neutral'} size="sm">{v.status}</Badge>
                                                {v.featured && <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3">
                                        {v.status !== 'published' && (
                                            <button type="button" onClick={() => router.post(`/admin/videos/${v.id}/publish`)} className="text-xs font-medium text-green-700 hover:text-green-800">Publish</button>
                                        )}
                                        <button type="button" onClick={() => router.post(`/admin/videos/${v.id}/toggle-feature`)} className={cn('text-xs font-medium', v.featured ? 'text-amber-700' : 'text-slate-600')}>
                                            {v.featured ? 'Unfeature' : 'Feature'}
                                        </button>
                                        <Link href={`/admin/videos/${v.id}/edit`} className="text-xs font-medium text-blue-700 hover:text-blue-800">Edit</Link>
                                        <button type="button" onClick={() => setDeleting(v)} className="ml-auto text-xs font-medium text-red-600 hover:text-red-700">Delete</button>
                                    </div>
                                </Card>
                            ))}
                        </div>

                        <div className="flex justify-center">
                            <Pagination links={videos.links} />
                        </div>
                    </>
                )}
            </div>

            <ConfirmDialog
                open={!!deleting}
                onClose={() => setDeleting(null)}
                onConfirm={handleDelete}
                title="Delete video"
                description={`Are you sure you want to delete "${deleting?.title}"? This action cannot be undone.`}
            />
        </>
    );
}