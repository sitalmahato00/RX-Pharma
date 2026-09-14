import { Head, Link, router, usePage } from '@inertiajs/react';
import { Alert, Badge, Button, Card, ConfirmDialog, EmptyState, Input, Pagination, Select } from '@/components/ui';
import type { BadgeColor } from '@/components/ui';
import { FlaskConical, Pencil, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import type { PaginationLink } from '@/components/ui';

interface PracticalDetail {
    id: number;
    practical_type?: string | null;
    steps?: string[] | null;
}

interface PracticalResource {
    id: number;
    title: string;
    slug: string;
    status: 'draft' | 'published' | 'archived';
    subject?: { id: number; name: string };
    practical_resource?: PracticalDetail;
}

interface Subject {
    id: number;
    name: string;
}

interface Props {
    practicals: { data: PracticalResource[]; links: PaginationLink[] };
    subjects: Subject[];
    filters: { search?: string; subject_id?: string; status?: string };
}

const statusColor: Record<string, BadgeColor> = {
    draft: 'neutral',
    published: 'green',
    archived: 'orange',
};

export default function Index({ practicals, subjects, filters }: Props) {
    const { flash } = usePage<{ flash: { success?: string } }>().props;
    const [search, setSearch] = useState(filters.search ?? '');
    const [subjectId, setSubjectId] = useState(filters.subject_id ?? '');
    const [status, setStatus] = useState(filters.status ?? '');
    const [deleting, setDeleting] = useState<PracticalResource | null>(null);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/admin/practical', { search, subject_id: subjectId || undefined, status: status || undefined }, { preserveState: true, replace: true });
    };

    const handleDelete = () => {
        if (!deleting) return;
        router.delete(`/admin/practical/${deleting.id}`, {
            onSuccess: () => setDeleting(null),
        });
    };

    return (
        <>
            <Head title="Practical" />

            <div className="space-y-6">
                {flash.success && <Alert type="success" dismissible>{flash.success}</Alert>}

                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-ink">Practical</h1>
                        <p className="mt-1 text-sm text-muted">Manage practical notes, lab manuals, viva questions and more.</p>
                    </div>
                    <Button href="/admin/practical/create" size="sm">
                        <Plus className="h-4 w-4" /> New Practical
                    </Button>
                </div>

                <Card className="p-4">
                    <form onSubmit={handleSearch} className="flex flex-wrap gap-3">
                        <div className="min-w-[180px] flex-1">
                            <Input placeholder="Search practical..." value={search} onChange={(e) => setSearch(e.target.value)} />
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
                            <Link href="/admin/practical" className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm text-ink hover:bg-slate-50">
                                Clear
                            </Link>
                        )}
                    </form>
                </Card>

                {practicals.data.length === 0 ? (
                    <EmptyState icon={FlaskConical} title="No practical found" description="Get started by adding a practical resource." action={<Button href="/admin/practical/create" size="sm"><Plus className="h-4 w-4" /> Add Practical</Button>} />
                ) : (
                    <>
                        <div className="hidden overflow-hidden rounded-xl border border-slate-200 bg-white shadow-card md:block">
                            <table className="min-w-full divide-y divide-slate-200">
                                <thead className="bg-slate-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted">Title</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted">Subject</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted">Type</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted">Steps</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted">Status</th>
                                        <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {practicals.data.map((p) => (
                                        <tr key={p.id} className="hover:bg-slate-50/50">
                                            <td className="px-4 py-3">
                                                <p className="text-sm font-medium text-ink">{p.title}</p>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-muted">{p.subject?.name ?? '—'}</td>
                                            <td className="px-4 py-3 text-sm text-muted">{p.practical_resource?.practical_type ?? '—'}</td>
                                            <td className="px-4 py-3 text-sm text-muted">
                                                {p.practical_resource?.steps?.length ? `${p.practical_resource.steps.length} steps` : '—'}
                                            </td>
                                            <td className="px-4 py-3">
                                                <Badge color={statusColor[p.status] ?? 'neutral'} size="sm">{p.status}</Badge>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center justify-end gap-1">
                                                    {p.status !== 'published' && (
                                                        <button
                                                            type="button"
                                                            onClick={() => router.post(`/admin/practical/${p.id}/publish`)}
                                                            className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-green-700 transition hover:bg-green-50"
                                                        >
                                                            Publish
                                                        </button>
                                                    )}
                                                    <Link href={`/admin/practical/${p.id}/edit`} className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-blue-700 transition hover:bg-blue-50">
                                                        <Pencil className="h-3.5 w-3.5" /> Edit
                                                    </Link>
                                                    <button type="button" onClick={() => setDeleting(p)} className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-red-600 transition hover:bg-red-50">
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
                            {practicals.data.map((p) => (
                                <Card key={p.id} className="p-4">
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="min-w-0">
                                            <p className="font-medium text-ink">{p.title}</p>
                                            <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted">
                                                <span>{p.subject?.name ?? '—'}</span>
                                                <span>{p.practical_resource?.practical_type ?? '—'}</span>
                                                <span>{p.practical_resource?.steps?.length ? `${p.practical_resource.steps.length} steps` : null}</span>
                                                <Badge color={statusColor[p.status] ?? 'neutral'} size="sm">{p.status}</Badge>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3">
                                        {p.status !== 'published' && (
                                            <button type="button" onClick={() => router.post(`/admin/practical/${p.id}/publish`)} className="text-xs font-medium text-green-700 hover:text-green-800">Publish</button>
                                        )}
                                        <Link href={`/admin/practical/${p.id}/edit`} className="text-xs font-medium text-blue-700 hover:text-blue-800">Edit</Link>
                                        <button type="button" onClick={() => setDeleting(p)} className="ml-auto text-xs font-medium text-red-600 hover:text-red-700">Delete</button>
                                    </div>
                                </Card>
                            ))}
                        </div>

                        <div className="flex justify-center">
                            <Pagination links={practicals.links} />
                        </div>
                    </>
                )}
            </div>

            <ConfirmDialog
                open={!!deleting}
                onClose={() => setDeleting(null)}
                onConfirm={handleDelete}
                title="Delete practical"
                description={`Are you sure you want to delete "${deleting?.title}"? This action cannot be undone.`}
            />
        </>
    );
}