import { Head, Link, router, usePage } from '@inertiajs/react';
import { Alert, Button, Card, ConfirmDialog, EmptyState, Input, Pagination, Select } from '@/components/ui';
import { Layers, Pencil, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import type { PaginationLink } from '@/components/ui';

interface Semester {
    id: number;
    name: string;
    slug: string;
    number: number;
    is_active: boolean;
    program?: { id: number; name: string };
}

interface Program {
    id: number;
    name: string;
}

interface Props {
    semesters: { data: Semester[]; links: PaginationLink[] };
    programs: Program[];
    filters: { search?: string; program_id?: string };
}

export default function Index({ semesters, programs, filters }: Props) {
    const { flash } = usePage<{ flash: { success?: string } }>().props;
    const [search, setSearch] = useState(filters.search ?? '');
    const [programId, setProgramId] = useState(filters.program_id ?? '');
    const [deleting, setDeleting] = useState<Semester | null>(null);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/admin/semesters', { search, program_id: programId || undefined }, { preserveState: true, replace: true });
    };

    const handleDelete = () => {
        if (!deleting) return;
        router.delete(`/admin/semesters/${deleting.id}`, {
            onSuccess: () => setDeleting(null),
        });
    };

    return (
        <>
            <Head title="Semesters" />

            <div className="space-y-6">
                {flash.success && <Alert type="success" dismissible>{flash.success}</Alert>}

                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-ink">Semesters</h1>
                        <p className="mt-1 text-sm text-muted">Manage semesters within programs.</p>
                    </div>
                    <Button href="/admin/semesters/create" size="sm">
                        <Plus className="h-4 w-4" /> New Semester
                    </Button>
                </div>

                <Card className="p-4">
                    <form onSubmit={handleSearch} className="flex flex-wrap gap-3">
                        <div className="min-w-[180px] flex-1">
                            <Input placeholder="Search semesters..." value={search} onChange={(e) => setSearch(e.target.value)} />
                        </div>
                        <div className="w-56">
                            <Select value={programId} onChange={(e) => setProgramId(e.target.value)}>
                                <option value="">All Programs</option>
                                {programs.map((p) => (
                                    <option key={p.id} value={p.id}>{p.name}</option>
                                ))}
                            </Select>
                        </div>
                        <Button type="submit" variant="secondary" size="sm">Search</Button>
                        {(filters.search || filters.program_id) && (
                            <Link href="/admin/semesters" className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm text-ink hover:bg-slate-50">
                                Clear
                            </Link>
                        )}
                    </form>
                </Card>

                {semesters.data.length === 0 ? (
                    <EmptyState icon={Layers} title="No semesters found" description="Get started by adding a semester." action={<Button href="/admin/semesters/create" size="sm"><Plus className="h-4 w-4" /> Add Semester</Button>} />
                ) : (
                    <>
                        <div className="hidden overflow-hidden rounded-xl border border-slate-200 bg-white shadow-card md:block">
                            <table className="min-w-full divide-y divide-slate-200">
                                <thead className="bg-slate-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted">Program</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted">Name</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted">Number</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted">Status</th>
                                        <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {semesters.data.map((s) => (
                                        <tr key={s.id} className="hover:bg-slate-50/50">
                                            <td className="px-4 py-3 text-sm text-muted">{s.program?.name ?? '—'}</td>
                                            <td className="px-4 py-3">
                                                <p className="text-sm font-medium text-ink">{s.name}</p>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-muted">Semester {s.number}</td>
                                            <td className="px-4 py-3">
                                                <span className={cn('inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium', s.is_active ? 'bg-green-50 text-green-700' : 'bg-slate-100 text-slate-600')}>
                                                    {s.is_active ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center justify-end gap-1">
                                                    <Link href={`/admin/semesters/${s.id}/edit`} className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-blue-700 transition hover:bg-blue-50">
                                                        <Pencil className="h-3.5 w-3.5" /> Edit
                                                    </Link>
                                                    <button type="button" onClick={() => setDeleting(s)} className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-red-600 transition hover:bg-red-50">
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
                            {semesters.data.map((s) => (
                                <Card key={s.id} className="p-4">
                                    <div className="flex items-start justify-between">
                                        <div className="min-w-0">
                                            <p className="font-medium text-ink">Semester {s.number} — {s.name}</p>
                                            <p className="mt-0.5 text-xs text-muted">{s.program?.name ?? '—'}</p>
                                        </div>
                                        <span className={cn('shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium', s.is_active ? 'bg-green-50 text-green-700' : 'bg-slate-100 text-slate-600')}>
                                            {s.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                    </div>
                                    <div className="mt-3 flex items-center gap-2 border-t border-slate-100 pt-3">
                                        <Link href={`/admin/semesters/${s.id}/edit`} className="text-xs font-medium text-blue-700 hover:text-blue-800">Edit</Link>
                                        <button type="button" onClick={() => setDeleting(s)} className="ml-auto text-xs font-medium text-red-600 hover:text-red-700">Delete</button>
                                    </div>
                                </Card>
                            ))}
                        </div>

                        <div className="flex justify-center">
                            <Pagination links={semesters.links} />
                        </div>
                    </>
                )}
            </div>

            <ConfirmDialog
                open={!!deleting}
                onClose={() => setDeleting(null)}
                onConfirm={handleDelete}
                title="Delete semester"
                description={`Are you sure you want to delete "${deleting?.name}"? This action cannot be undone.`}
            />
        </>
    );
}