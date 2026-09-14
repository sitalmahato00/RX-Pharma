import { Head, Link, router, usePage } from '@inertiajs/react';
import { Alert, Button, Card, ConfirmDialog, EmptyState, Input, Pagination, Select } from '@/components/ui';
import { Hash, Pencil, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import type { PaginationLink } from '@/components/ui';

interface Topic {
    id: number;
    name: string;
    slug: string;
    sort_order: number;
    unit?: { id: number; name: string; subject?: { id: number; name: string } };
}

interface Unit {
    id: number;
    name: string;
    subject_id: number;
    subject?: { id: number; name: string };
}

interface Props {
    topics: { data: Topic[]; links: PaginationLink[] };
    units: Unit[];
    filters: { search?: string; unit_id?: string };
}

export default function Index({ topics, units, filters }: Props) {
    const { flash } = usePage<{ flash: { success?: string } }>().props;
    const [search, setSearch] = useState(filters.search ?? '');
    const [unitId, setUnitId] = useState(filters.unit_id ?? '');
    const [deleting, setDeleting] = useState<Topic | null>(null);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/admin/topics', { search, unit_id: unitId || undefined }, { preserveState: true, replace: true });
    };

    const handleDelete = () => {
        if (!deleting) return;
        router.delete(`/admin/topics/${deleting.id}`, {
            onSuccess: () => setDeleting(null),
        });
    };

    return (
        <>
            <Head title="Topics" />

            <div className="space-y-6">
                {flash.success && <Alert type="success" dismissible>{flash.success}</Alert>}

                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-ink">Topics</h1>
                        <p className="mt-1 text-sm text-muted">Manage topics within units.</p>
                    </div>
                    <Button href="/admin/topics/create" size="sm">
                        <Plus className="h-4 w-4" /> New Topic
                    </Button>
                </div>

                <Card className="p-4">
                    <form onSubmit={handleSearch} className="flex flex-wrap gap-3">
                        <div className="min-w-[180px] flex-1">
                            <Input placeholder="Search topics..." value={search} onChange={(e) => setSearch(e.target.value)} />
                        </div>
                        <div className="w-64">
                            <Select value={unitId} onChange={(e) => setUnitId(e.target.value)}>
                                <option value="">All Units</option>
                                {units.map((u) => (
                                    <option key={u.id} value={u.id}>{u.subject ? `${u.subject.name} — ` : ''}{u.name}</option>
                                ))}
                            </Select>
                        </div>
                        <Button type="submit" variant="secondary" size="sm">Search</Button>
                        {(filters.search || filters.unit_id) && (
                            <Link href="/admin/topics" className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm text-ink hover:bg-slate-50">
                                Clear
                            </Link>
                        )}
                    </form>
                </Card>

                {topics.data.length === 0 ? (
                    <EmptyState icon={Hash} title="No topics found" description="Get started by adding a topic." action={<Button href="/admin/topics/create" size="sm"><Plus className="h-4 w-4" /> Add Topic</Button>} />
                ) : (
                    <>
                        <div className="hidden overflow-hidden rounded-xl border border-slate-200 bg-white shadow-card md:block">
                            <table className="min-w-full divide-y divide-slate-200">
                                <thead className="bg-slate-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted">Subject</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted">Unit</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted">Name</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted">Order</th>
                                        <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {topics.data.map((t) => (
                                        <tr key={t.id} className="hover:bg-slate-50/50">
                                            <td className="px-4 py-3 text-sm text-muted">{t.unit?.subject?.name ?? '—'}</td>
                                            <td className="px-4 py-3 text-sm text-muted">{t.unit?.name ?? '—'}</td>
                                            <td className="px-4 py-3">
                                                <p className="text-sm font-medium text-ink">{t.name}</p>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-muted">#{t.sort_order}</td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center justify-end gap-1">
                                                    <Link href={`/admin/topics/${t.id}/edit`} className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-blue-700 transition hover:bg-blue-50">
                                                        <Pencil className="h-3.5 w-3.5" /> Edit
                                                    </Link>
                                                    <button type="button" onClick={() => setDeleting(t)} className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-red-600 transition hover:bg-red-50">
                                                        <Trash2 className="h-3.5 w-3.5" /> Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="space-y-3 md:hidden">
                            {topics.data.map((t) => (
                                <Card key={t.id} className="p-4">
                                    <div className="flex items-start justify-between">
                                        <div className="min-w-0">
                                            <p className="font-medium text-ink">{t.name}</p>
                                            <p className="mt-0.5 text-xs text-muted">
                                                {[t.unit?.subject?.name, t.unit?.name].filter(Boolean).join(' · ') || '—'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="mt-3 flex items-center gap-2 border-t border-slate-100 pt-3">
                                        <Link href={`/admin/topics/${t.id}/edit`} className="text-xs font-medium text-blue-700 hover:text-blue-800">Edit</Link>
                                        <button type="button" onClick={() => setDeleting(t)} className="ml-auto text-xs font-medium text-red-600 hover:text-red-700">Delete</button>
                                    </div>
                                </Card>
                            ))}
                        </div>

                        <div className="flex justify-center">
                            <Pagination links={topics.links} />
                        </div>
                    </>
                )}
            </div>

            <ConfirmDialog
                open={!!deleting}
                onClose={() => setDeleting(null)}
                onConfirm={handleDelete}
                title="Delete topic"
                description={`Are you sure you want to delete "${deleting?.name}"? This action cannot be undone.`}
            />
        </>
    );
}