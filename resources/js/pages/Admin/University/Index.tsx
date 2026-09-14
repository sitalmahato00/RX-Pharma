import { Head, Link, router, usePage } from '@inertiajs/react';
import { Alert, Button, Card, ConfirmDialog, EmptyState, Input, Pagination } from '@/components/ui';
import { Landmark, Pencil, Plus, Trash2, Power } from 'lucide-react';
import { useState } from 'react';
import { cn, formatNumber } from '@/lib/utils';
import type { PaginationLink } from '@/components/ui';

interface University {
    id: number;
    name: string;
    slug: string;
    code?: string | null;
    acronym?: string | null;
    location?: string | null;
    is_active: boolean;
    colleges_count?: number;
}

interface Props {
    universities: { data: University[]; links: PaginationLink[] };
    filters: { search?: string };
}

export default function Index({ universities, filters }: Props) {
    const { flash } = usePage<{ flash: { success?: string } }>().props;
    const [search, setSearch] = useState(filters.search ?? '');
    const [deleting, setDeleting] = useState<University | null>(null);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/admin/universities', { search }, { preserveState: true, replace: true });
    };

    const handleDelete = () => {
        if (!deleting) return;
        router.delete(`/admin/universities/${deleting.id}`, {
            onSuccess: () => setDeleting(null),
        });
    };

    return (
        <>
            <Head title="Universities" />

            <div className="space-y-6">
                {flash.success && <Alert type="success" dismissible>{flash.success}</Alert>}

                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-ink">Universities</h1>
                        <p className="mt-1 text-sm text-muted">Manage universities in the system.</p>
                    </div>
                    <Button href="/admin/universities/create" size="sm">
                        <Plus className="h-4 w-4" /> New University
                    </Button>
                </div>

                <Card className="p-4">
                    <form onSubmit={handleSearch} className="flex gap-3">
                        <div className="flex-1">
                            <Input
                                placeholder="Search universities..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        <Button type="submit" variant="secondary" size="sm">Search</Button>
                        {filters.search && (
                            <Link href="/admin/universities" className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm text-ink hover:bg-slate-50">
                                Clear
                            </Link>
                        )}
                    </form>
                </Card>

                {universities.data.length === 0 ? (
                    <EmptyState icon={Landmark} title="No universities found" description="Get started by adding a university." action={<Button href="/admin/universities/create" size="sm"><Plus className="h-4 w-4" /> Add University</Button>} />
                ) : (
                    <>
                        <div className="hidden overflow-hidden rounded-xl border border-slate-200 bg-white shadow-card md:block">
                            <table className="min-w-full divide-y divide-slate-200">
                                <thead className="bg-slate-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted">Name</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted">Acronym</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted">Code</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted">Location</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted">Colleges</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted">Status</th>
                                        <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {universities.data.map((u) => (
                                        <tr key={u.id} className="hover:bg-slate-50/50">
                                            <td className="px-4 py-3">
                                                <p className="text-sm font-medium text-ink">{u.name}</p>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-muted">{u.acronym ?? '—'}</td>
                                            <td className="px-4 py-3 text-sm text-muted">{u.code ?? '—'}</td>
                                            <td className="px-4 py-3 text-sm text-muted">{u.location ?? '—'}</td>
                                            <td className="px-4 py-3 text-sm text-muted">{formatNumber(u.colleges_count ?? 0)}</td>
                                            <td className="px-4 py-3">
                                                <span className={cn('inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium', u.is_active ? 'bg-green-50 text-green-700' : 'bg-slate-100 text-slate-600')}>
                                                    {u.is_active ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center justify-end gap-1">
                                                    <button
                                                        type="button"
                                                        onClick={() => router.post(`/admin/universities/${u.id}/toggle`)}
                                                        className={cn('inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium transition', u.is_active ? 'text-amber-700 hover:bg-amber-50' : 'text-green-700 hover:bg-green-50')}
                                                        title={u.is_active ? 'Deactivate' : 'Activate'}
                                                    >
                                                        <Power className="h-3.5 w-3.5" />
                                                    </button>
                                                    <Link
                                                        href={`/admin/universities/${u.id}/edit`}
                                                        className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-blue-700 transition hover:bg-blue-50"
                                                    >
                                                        <Pencil className="h-3.5 w-3.5" /> Edit
                                                    </Link>
                                                    <button
                                                        type="button"
                                                        onClick={() => setDeleting(u)}
                                                        className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-red-600 transition hover:bg-red-50"
                                                    >
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
                            {universities.data.map((u) => (
                                <Card key={u.id} className="p-4">
                                    <div className="flex items-start justify-between">
                                        <div className="min-w-0">
                                            <p className="font-medium text-ink">{u.name}</p>
                                            {u.acronym && <p className="mt-0.5 text-xs text-muted">{u.acronym}</p>}
                                            <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted">
                                                {u.location && <span>{u.location}</span>}
                                                <span>{formatNumber(u.colleges_count ?? 0)} colleges</span>
                                            </div>
                                        </div>
                                        <span className={cn('shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium', u.is_active ? 'bg-green-50 text-green-700' : 'bg-slate-100 text-slate-600')}>
                                            {u.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                    </div>
                                    <div className="mt-3 flex items-center gap-2 border-t border-slate-100 pt-3">
                                        <button type="button" onClick={() => router.post(`/admin/universities/${u.id}/toggle`)} className="text-xs font-medium text-amber-700 hover:text-amber-800">
                                            {u.is_active ? 'Deactivate' : 'Activate'}
                                        </button>
                                        <Link href={`/admin/universities/${u.id}/edit`} className="text-xs font-medium text-blue-700 hover:text-blue-800">Edit</Link>
                                        <button type="button" onClick={() => setDeleting(u)} className="ml-auto text-xs font-medium text-red-600 hover:text-red-700">Delete</button>
                                    </div>
                                </Card>
                            ))}
                        </div>

                        <div className="flex justify-center">
                            <Pagination links={universities.links} />
                        </div>
                    </>
                )}
            </div>

            <ConfirmDialog
                open={!!deleting}
                onClose={() => setDeleting(null)}
                onConfirm={handleDelete}
                title="Delete university"
                description={`Are you sure you want to delete "${deleting?.name}"? This action cannot be undone.`}
            />
        </>
    );
}
