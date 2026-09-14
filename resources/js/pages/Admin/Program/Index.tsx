import { Head, Link, router, usePage } from '@inertiajs/react';
import { Alert, Button, Card, ConfirmDialog, EmptyState, Input, Pagination, Select } from '@/components/ui';
import { BookMarked, Pencil, Plus, Trash2, Power } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import type { PaginationLink } from '@/components/ui';

interface Program {
    id: number;
    name: string;
    slug: string;
    code?: string | null;
    level?: string | null;
    duration_years?: number | null;
    is_active: boolean;
    university?: { id: number; name: string };
}

interface University {
    id: number;
    name: string;
}

interface Props {
    programs: { data: Program[]; links: PaginationLink[] };
    universities: University[];
    filters: { search?: string; university_id?: string };
}

export default function Index({ programs, universities, filters }: Props) {
    const { flash } = usePage<{ flash: { success?: string } }>().props;
    const [search, setSearch] = useState(filters.search ?? '');
    const [universityId, setUniversityId] = useState(filters.university_id ?? '');
    const [deleting, setDeleting] = useState<Program | null>(null);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/admin/programs', { search, university_id: universityId || undefined }, { preserveState: true, replace: true });
    };

    const handleDelete = () => {
        if (!deleting) return;
        router.delete(`/admin/programs/${deleting.id}`, {
            onSuccess: () => setDeleting(null),
        });
    };

    return (
        <>
            <Head title="Programs" />

            <div className="space-y-6">
                {flash.success && <Alert type="success" dismissible>{flash.success}</Alert>}

                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-ink">Programs</h1>
                        <p className="mt-1 text-sm text-muted">Manage academic programs.</p>
                    </div>
                    <Button href="/admin/programs/create" size="sm">
                        <Plus className="h-4 w-4" /> New Program
                    </Button>
                </div>

                <Card className="p-4">
                    <form onSubmit={handleSearch} className="flex flex-wrap gap-3">
                        <div className="min-w-[180px] flex-1">
                            <Input placeholder="Search programs..." value={search} onChange={(e) => setSearch(e.target.value)} />
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
                            <Link href="/admin/programs" className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm text-ink hover:bg-slate-50">
                                Clear
                            </Link>
                        )}
                    </form>
                </Card>

                {programs.data.length === 0 ? (
                    <EmptyState icon={BookMarked} title="No programs found" description="Get started by adding a program." action={<Button href="/admin/programs/create" size="sm"><Plus className="h-4 w-4" /> Add Program</Button>} />
                ) : (
                    <>
                        <div className="hidden overflow-hidden rounded-xl border border-slate-200 bg-white shadow-card md:block">
                            <table className="min-w-full divide-y divide-slate-200">
                                <thead className="bg-slate-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted">University</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted">Name</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted">Code</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted">Level</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted">Duration</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted">Status</th>
                                        <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {programs.data.map((p) => (
                                        <tr key={p.id} className="hover:bg-slate-50/50">
                                            <td className="px-4 py-3 text-sm text-muted">{p.university?.name ?? '—'}</td>
                                            <td className="px-4 py-3">
                                                <p className="text-sm font-medium text-ink">{p.name}</p>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-muted">{p.code ?? '—'}</td>
                                            <td className="px-4 py-3 text-sm text-muted">{p.level ?? '—'}</td>
                                            <td className="px-4 py-3 text-sm text-muted">{p.duration_years ? `${p.duration_years} yr` : '—'}</td>
                                            <td className="px-4 py-3">
                                                <span className={cn('inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium', p.is_active ? 'bg-green-50 text-green-700' : 'bg-slate-100 text-slate-600')}>
                                                    {p.is_active ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center justify-end gap-1">
                                                    <button
                                                        type="button"
                                                        onClick={() => router.post(`/admin/programs/${p.id}/toggle`)}
                                                        className={cn('inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium transition', p.is_active ? 'text-amber-700 hover:bg-amber-50' : 'text-green-700 hover:bg-green-50')}
                                                        title={p.is_active ? 'Deactivate' : 'Activate'}
                                                    >
                                                        <Power className="h-3.5 w-3.5" />
                                                    </button>
                                                    <Link href={`/admin/programs/${p.id}/edit`} className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-blue-700 transition hover:bg-blue-50">
                                                        <Pencil className="h-3.5 w-3.5" /> Edit
                                                    </Link>
                                                    <button type="button" onClick={() => setDeleting(p)} className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-red-600 transition hover:bg-red-50">
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
                            {programs.data.map((p) => (
                                <Card key={p.id} className="p-4">
                                    <div className="flex items-start justify-between">
                                        <div className="min-w-0">
                                            <p className="font-medium text-ink">{p.name}</p>
                                            <p className="mt-0.5 text-xs text-muted">{p.university?.name ?? '—'}</p>
                                            <div className="mt-1 flex flex-wrap gap-2 text-xs text-muted">
                                                {p.code && <span className="rounded bg-slate-100 px-1.5 py-0.5">{p.code}</span>}
                                                {p.level && <span>{p.level}</span>}
                                                {p.duration_years && <span>{p.duration_years} years</span>}
                                            </div>
                                        </div>
                                        <span className={cn('shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium', p.is_active ? 'bg-green-50 text-green-700' : 'bg-slate-100 text-slate-600')}>
                                            {p.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                    </div>
                                    <div className="mt-3 flex items-center gap-2 border-t border-slate-100 pt-3">
                                        <button type="button" onClick={() => router.post(`/admin/programs/${p.id}/toggle`)} className="text-xs font-medium text-amber-700 hover:text-amber-800">
                                            {p.is_active ? 'Deactivate' : 'Activate'}
                                        </button>
                                        <Link href={`/admin/programs/${p.id}/edit`} className="text-xs font-medium text-blue-700 hover:text-blue-800">Edit</Link>
                                        <button type="button" onClick={() => setDeleting(p)} className="ml-auto text-xs font-medium text-red-600 hover:text-red-700">Delete</button>
                                    </div>
                                </Card>
                            ))}
                        </div>

                        <div className="flex justify-center">
                            <Pagination links={programs.links} />
                        </div>
                    </>
                )}
            </div>

            <ConfirmDialog
                open={!!deleting}
                onClose={() => setDeleting(null)}
                onConfirm={handleDelete}
                title="Delete program"
                description={`Are you sure you want to delete "${deleting?.name}"? This action cannot be undone.`}
            />
        </>
    );
}