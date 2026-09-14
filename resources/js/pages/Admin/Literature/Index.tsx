import { Head, Link, router, usePage } from '@inertiajs/react';
import { Alert, Badge, Button, Card, ConfirmDialog, EmptyState, Input, Pagination, Select } from '@/components/ui';
import type { BadgeColor } from '@/components/ui';
import { BookOpen, Pencil, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { formatNumber } from '@/lib/utils';
import type { PaginationLink } from '@/components/ui';

interface LiteratureDetail {
    id: number;
    category?: string | null;
    author?: string | null;
    year?: number | null;
    file_path?: string | null;
    external_url?: string | null;
}

interface LiteratureResource {
    id: number;
    title: string;
    slug: string;
    status: 'draft' | 'published' | 'archived';
    views_count: number;
    downloads_count: number;
    subject?: { id: number; name: string };
    literature?: LiteratureDetail;
}

interface Subject {
    id: number;
    name: string;
}

interface Props {
    literature: { data: LiteratureResource[]; links: PaginationLink[] };
    subjects: Subject[];
    filters: { search?: string; subject_id?: string; status?: string };
}

const statusColor: Record<string, BadgeColor> = {
    draft: 'neutral',
    published: 'green',
    archived: 'orange',
};

export default function Index({ literature, subjects, filters }: Props) {
    const { flash } = usePage<{ flash: { success?: string } }>().props;
    const [search, setSearch] = useState(filters.search ?? '');
    const [subjectId, setSubjectId] = useState(filters.subject_id ?? '');
    const [status, setStatus] = useState(filters.status ?? '');
    const [deleting, setDeleting] = useState<LiteratureResource | null>(null);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/admin/literature', { search, subject_id: subjectId || undefined, status: status || undefined }, { preserveState: true, replace: true });
    };

    const handleDelete = () => {
        if (!deleting) return;
        router.delete(`/admin/literature/${deleting.id}`, {
            onSuccess: () => setDeleting(null),
        });
    };

    return (
        <>
            <Head title="Literature" />

            <div className="space-y-6">
                {flash.success && <Alert type="success" dismissible>{flash.success}</Alert>}

                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-ink">Literature</h1>
                        <p className="mt-1 text-sm text-muted">Manage WHO guidelines, journals, reference books and more.</p>
                    </div>
                    <Button href="/admin/literature/create" size="sm">
                        <Plus className="h-4 w-4" /> New Literature
                    </Button>
                </div>

                <Card className="p-4">
                    <form onSubmit={handleSearch} className="flex flex-wrap gap-3">
                        <div className="min-w-[180px] flex-1">
                            <Input placeholder="Search literature..." value={search} onChange={(e) => setSearch(e.target.value)} />
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
                            <Link href="/admin/literature" className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm text-ink hover:bg-slate-50">
                                Clear
                            </Link>
                        )}
                    </form>
                </Card>

                {literature.data.length === 0 ? (
                    <EmptyState icon={BookOpen} title="No literature found" description="Get started by adding a literature item." action={<Button href="/admin/literature/create" size="sm"><Plus className="h-4 w-4" /> Add Literature</Button>} />
                ) : (
                    <>
                        <div className="hidden overflow-hidden rounded-xl border border-slate-200 bg-white shadow-card md:block">
                            <table className="min-w-full divide-y divide-slate-200">
                                <thead className="bg-slate-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted">Title</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted">Subject</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted">Category</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted">Author</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted">Year</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted">Status</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted">Downloads</th>
                                        <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {literature.data.map((l) => (
                                        <tr key={l.id} className="hover:bg-slate-50/50">
                                            <td className="px-4 py-3">
                                                <p className="text-sm font-medium text-ink">{l.title}</p>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-muted">{l.subject?.name ?? '—'}</td>
                                            <td className="px-4 py-3 text-sm text-muted">{l.literature?.category ?? '—'}</td>
                                            <td className="px-4 py-3 text-sm text-muted">{l.literature?.author ?? '—'}</td>
                                            <td className="px-4 py-3 text-sm text-muted">{l.literature?.year ?? '—'}</td>
                                            <td className="px-4 py-3">
                                                <Badge color={statusColor[l.status] ?? 'neutral'} size="sm">{l.status}</Badge>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-muted">{formatNumber(l.downloads_count)}</td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center justify-end gap-1">
                                                    {l.status !== 'published' && (
                                                        <button
                                                            type="button"
                                                            onClick={() => router.post(`/admin/literature/${l.id}/publish`)}
                                                            className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-green-700 transition hover:bg-green-50"
                                                        >
                                                            Publish
                                                        </button>
                                                    )}
                                                    <Link href={`/admin/literature/${l.id}/edit`} className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-blue-700 transition hover:bg-blue-50">
                                                        <Pencil className="h-3.5 w-3.5" /> Edit
                                                    </Link>
                                                    <button type="button" onClick={() => setDeleting(l)} className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-red-600 transition hover:bg-red-50">
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
                            {literature.data.map((l) => (
                                <Card key={l.id} className="p-4">
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="min-w-0">
                                            <p className="font-medium text-ink">{l.title}</p>
                                            <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted">
                                                <span>{l.subject?.name ?? '—'}</span>
                                                <span>{l.literature?.category ?? '—'}</span>
                                                {l.literature?.year && <span>{l.literature.year}</span>}
                                                <Badge color={statusColor[l.status] ?? 'neutral'} size="sm">{l.status}</Badge>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3">
                                        {l.status !== 'published' && (
                                            <button type="button" onClick={() => router.post(`/admin/literature/${l.id}/publish`)} className="text-xs font-medium text-green-700 hover:text-green-800">Publish</button>
                                        )}
                                        <Link href={`/admin/literature/${l.id}/edit`} className="text-xs font-medium text-blue-700 hover:text-blue-800">Edit</Link>
                                        <button type="button" onClick={() => setDeleting(l)} className="ml-auto text-xs font-medium text-red-600 hover:text-red-700">Delete</button>
                                    </div>
                                </Card>
                            ))}
                        </div>

                        <div className="flex justify-center">
                            <Pagination links={literature.links} />
                        </div>
                    </>
                )}
            </div>

            <ConfirmDialog
                open={!!deleting}
                onClose={() => setDeleting(null)}
                onConfirm={handleDelete}
                title="Delete literature"
                description={`Are you sure you want to delete "${deleting?.title}"? This action cannot be undone.`}
            />
        </>
    );
}