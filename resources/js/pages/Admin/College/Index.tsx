import { Head, Link, router, usePage } from '@inertiajs/react';
import { Alert, Button, Card, ConfirmDialog, EmptyState, Input, Pagination, Select } from '@/components/ui';
import { Pencil, Plus, School, Trash2, Power } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import type { PaginationLink } from '@/components/ui';

interface College {
    id: number;
    name: string;
    slug: string;
    location?: string | null;
    is_active: boolean;
    university?: { id: number; name: string };
}

interface University {
    id: number;
    name: string;
}

interface Props {
    colleges: { data: College[]; links: PaginationLink[] };
    universities: University[];
    filters: { search?: string; university_id?: string };
}

export default function Index({ colleges, universities, filters }: Props) {
    const { flash } = usePage<{ flash: { success?: string } }>().props;
    const [search, setSearch] = useState(filters.search ?? '');
    const [universityId, setUniversityId] = useState(filters.university_id ?? '');
    const [deleting, setDeleting] = useState<College | null>(null);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/admin/colleges', { search, university_id: universityId || undefined }, { preserveState: true, replace: true });
    };

    const handleDelete = () => {
        if (!deleting) return;
        router.delete(`/admin/colleges/${deleting.id}`, {
            onSuccess: () => setDeleting(null),
        });
    };

    return (
        <>
            <Head title="Colleges" />

            <div className="space-y-6">
                {flash.success && <Alert type="success" dismissible>{flash.success}</Alert>}

                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-ink">Colleges</h1>
                        <p className="mt-1 text-sm text-muted">Manage colleges within universities.</p>
                    </div>
                    <Button href="/admin/colleges/create" size="sm">
                        <Plus className="h-4 w-4" /> New College
                    </Button>
                </div>

                <Card className="p-4">
                    <form onSubmit={handleSearch} className="flex flex-wrap gap-3">
                        <div className="min-w-[180px] flex-1">
                            <Input placeholder="Search colleges..." value={search} onChange={(e) => setSearch(e.target.value)} />
                        </div>
                        <div className="w-48">
                            <Select value={universityId} onChange={(e) => setUniversityId(e.target.value)}>
                                <option value="">All Universities</option>
                                {universities.map((u) => (
                                    <option key={u.id} value={u.id}>{u.name}</option>
                                ))}
                            </Select>
                        </div>
                        <Button type="submit" variant="secondary" size="sm">Search</Button>
                        {(filters.search || filters.university_id) && (
                            <Link href="/admin/colleges" className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm text-ink hover:bg-slate-50">
                                Clear
                            </Link>
                        )}
                    </form>
                </Card>

                {colleges.data.length === 0 ? (
                    <EmptyState icon={School} title="No colleges found" description="Get started by adding a college." action={<Button href="/admin/colleges/create" size="sm"><Plus className="h-4 w-4" /> Add College</Button>} />
                ) : (
                    <>
                        <div className="hidden overflow-hidden rounded-xl border border-slate-200 bg-white shadow-card md:block">
                            <table className="min-w-full divide-y divide-slate-200">
                                <thead className="bg-slate-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted">University</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted">Name</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted">Location</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted">Status</th>
                                        <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {colleges.data.map((c) => (
                                        <tr key={c.id} className="hover:bg-slate-50/50">
                                            <td className="px-4 py-3 text-sm text-muted">{c.university?.name ?? '—'}</td>
                                            <td className="px-4 py-3">
                                                <p className="text-sm font-medium text-ink">{c.name}</p>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-muted">{c.location ?? '—'}</td>
                                            <td className="px-4 py-3">
                                                <span className={cn('inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium', c.is_active ? 'bg-green-50 text-green-700' : 'bg-slate-100 text-slate-600')}>
                                                    {c.is_active ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center justify-end gap-1">
                                                    <button
                                                        type="button"
                                                        onClick={() => router.post(`/admin/colleges/${c.id}/toggle`)}
                                                        className={cn('inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium transition', c.is_active ? 'text-amber-700 hover:bg-amber-50' : 'text-green-700 hover:bg-green-50')}
                                                        title={c.is_active ? 'Deactivate' : 'Activate'}
                                                    >
                                                        <Power className="h-3.5 w-3.5" />
                                                    </button>
                                                    <Link href={`/admin/colleges/${c.id}/edit`} className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-blue-700 transition hover:bg-blue-50">
                                                        <Pencil className="h-3.5 w-3.5" /> Edit
                                                    </Link>
                                                    <button type="button" onClick={() => setDeleting(c)} className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-red-600 transition hover:bg-red-50">
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
                            {colleges.data.map((c) => (
                                <Card key={c.id} className="p-4">
                                    <div className="flex items-start justify-between">
                                        <div className="min-w-0">
                                            <p className="font-medium text-ink">{c.name}</p>
                                            <p className="mt-0.5 text-xs text-muted">{c.university?.name ?? '—'}</p>
                                            {c.location && <p className="mt-0.5 text-xs text-muted">{c.location}</p>}
                                        </div>
                                        <span className={cn('shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium', c.is_active ? 'bg-green-50 text-green-700' : 'bg-slate-100 text-slate-600')}>
                                            {c.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                    </div>
                                    <div className="mt-3 flex items-center gap-2 border-t border-slate-100 pt-3">
                                        <button type="button" onClick={() => router.post(`/admin/colleges/${c.id}/toggle`)} className="text-xs font-medium text-amber-700 hover:text-amber-800">
                                            {c.is_active ? 'Deactivate' : 'Activate'}
                                        </button>
                                        <Link href={`/admin/colleges/${c.id}/edit`} className="text-xs font-medium text-blue-700 hover:text-blue-800">Edit</Link>
                                        <button type="button" onClick={() => setDeleting(c)} className="ml-auto text-xs font-medium text-red-600 hover:text-red-700">Delete</button>
                                    </div>
                                </Card>
                            ))}
                        </div>

                        <div className="flex justify-center">
                            <Pagination links={colleges.links} />
                        </div>
                    </>
                )}
            </div>

            <ConfirmDialog
                open={!!deleting}
                onClose={() => setDeleting(null)}
                onConfirm={handleDelete}
                title="Delete college"
                description={`Are you sure you want to delete "${deleting?.name}"? This action cannot be undone.`}
            />
        </>
    );
}