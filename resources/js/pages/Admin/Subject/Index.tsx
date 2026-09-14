import { Head, Link, router, usePage } from '@inertiajs/react';
import { Alert, Button, Card, ConfirmDialog, EmptyState, Input, Pagination, Select } from '@/components/ui';
import { BookOpen, Pencil, Plus, Trash2, Power } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import type { PaginationLink } from '@/components/ui';

interface Subject {
    id: number;
    name: string;
    slug: string;
    code?: string | null;
    color?: string | null;
    is_active: boolean;
    semester?: { id: number; name: string; number: number };
    program?: { id: number; name: string };
}

interface Semester {
    id: number;
    name: string;
    number: number;
}

interface Props {
    subjects: { data: Subject[]; links: PaginationLink[] };
    semesters: Semester[];
    filters: { search?: string; semester_id?: string };
}

export default function Index({ subjects, semesters, filters }: Props) {
    const { flash } = usePage<{ flash: { success?: string } }>().props;
    const [search, setSearch] = useState(filters.search ?? '');
    const [semesterId, setSemesterId] = useState(filters.semester_id ?? '');
    const [deleting, setDeleting] = useState<Subject | null>(null);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/admin/subjects', { search, semester_id: semesterId || undefined }, { preserveState: true, replace: true });
    };

    const handleDelete = () => {
        if (!deleting) return;
        router.delete(`/admin/subjects/${deleting.id}`, {
            onSuccess: () => setDeleting(null),
        });
    };

    const semesterLabel = (s: { name: string; number: number }) => `Semester ${s.number} · ${s.name}`;

    return (
        <>
            <Head title="Subjects" />

            <div className="space-y-6">
                {flash.success && <Alert type="success" dismissible>{flash.success}</Alert>}

                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-ink">Subjects</h1>
                        <p className="mt-1 text-sm text-muted">Manage subjects within semesters.</p>
                    </div>
                    <Button href="/admin/subjects/create" size="sm">
                        <Plus className="h-4 w-4" /> New Subject
                    </Button>
                </div>

                <Card className="p-4">
                    <form onSubmit={handleSearch} className="flex flex-wrap gap-3">
                        <div className="min-w-[180px] flex-1">
                            <Input placeholder="Search subjects..." value={search} onChange={(e) => setSearch(e.target.value)} />
                        </div>
                        <div className="w-64">
                            <Select value={semesterId} onChange={(e) => setSemesterId(e.target.value)}>
                                <option value="">All Semesters</option>
                                {semesters.map((s) => (
                                    <option key={s.id} value={s.id}>{semesterLabel(s)}</option>
                                ))}
                            </Select>
                        </div>
                        <Button type="submit" variant="secondary" size="sm">Search</Button>
                        {(filters.search || filters.semester_id) && (
                            <Link href="/admin/subjects" className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm text-ink hover:bg-slate-50">
                                Clear
                            </Link>
                        )}
                    </form>
                </Card>

                {subjects.data.length === 0 ? (
                    <EmptyState icon={BookOpen} title="No subjects found" description="Get started by adding a subject." action={<Button href="/admin/subjects/create" size="sm"><Plus className="h-4 w-4" /> Add Subject</Button>} />
                ) : (
                    <>
                        <div className="hidden overflow-hidden rounded-xl border border-slate-200 bg-white shadow-card md:block">
                            <table className="min-w-full divide-y divide-slate-200">
                                <thead className="bg-slate-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted">Name</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted">Code</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted">Program</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted">Semester</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted">Status</th>
                                        <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {subjects.data.map((s) => (
                                        <tr key={s.id} className="hover:bg-slate-50/50">
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2.5">
                                                    {s.color ? (
                                                        <span className="h-5 w-5 shrink-0 rounded-full" style={{ backgroundColor: s.color }} />
                                                    ) : (
                                                        <span className="h-5 w-5 shrink-0 rounded-full bg-primary-100" />
                                                    )}
                                                    <p className="text-sm font-medium text-ink">{s.name}</p>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-muted">{s.code ?? '—'}</td>
                                            <td className="px-4 py-3 text-sm text-muted">{s.program?.name ?? '—'}</td>
                                            <td className="px-4 py-3 text-sm text-muted">{s.semester ? semesterLabel(s.semester) : '—'}</td>
                                            <td className="px-4 py-3">
                                                <span className={cn('inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium', s.is_active ? 'bg-green-50 text-green-700' : 'bg-slate-100 text-slate-600')}>
                                                    {s.is_active ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center justify-end gap-1">
                                                    <button
                                                        type="button"
                                                        onClick={() => router.post(`/admin/subjects/${s.id}/toggle`)}
                                                        className={cn('inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium transition', s.is_active ? 'text-amber-700 hover:bg-amber-50' : 'text-green-700 hover:bg-green-50')}
                                                        title={s.is_active ? 'Deactivate' : 'Activate'}
                                                    >
                                                        <Power className="h-3.5 w-3.5" />
                                                    </button>
                                                    <Link href={`/admin/subjects/${s.id}/edit`} className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-blue-700 transition hover:bg-blue-50">
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
                            {subjects.data.map((s) => (
                                <Card key={s.id} className="p-4">
                                    <div className="flex items-start justify-between">
                                        <div className="flex min-w-0 items-start gap-2.5">
                                            {s.color && <span className="mt-1 h-5 w-5 shrink-0 rounded-full" style={{ backgroundColor: s.color }} />}
                                            <div className="min-w-0">
                                                <p className="font-medium text-ink">{s.name}</p>
                                                <p className="mt-0.5 text-xs text-muted">
                                                    {[s.program?.name, s.semester ? semesterLabel(s.semester) : null].filter(Boolean).join(' · ') || '—'}
                                                </p>
                                            </div>
                                        </div>
                                        <span className={cn('shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium', s.is_active ? 'bg-green-50 text-green-700' : 'bg-slate-100 text-slate-600')}>
                                            {s.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                    </div>
                                    <div className="mt-3 flex items-center gap-2 border-t border-slate-100 pt-3">
                                        <button type="button" onClick={() => router.post(`/admin/subjects/${s.id}/toggle`)} className="text-xs font-medium text-amber-700 hover:text-amber-800">
                                            {s.is_active ? 'Deactivate' : 'Activate'}
                                        </button>
                                        <Link href={`/admin/subjects/${s.id}/edit`} className="text-xs font-medium text-blue-700 hover:text-blue-800">Edit</Link>
                                        <button type="button" onClick={() => setDeleting(s)} className="ml-auto text-xs font-medium text-red-600 hover:text-red-700">Delete</button>
                                    </div>
                                </Card>
                            ))}
                        </div>

                        <div className="flex justify-center">
                            <Pagination links={subjects.links} />
                        </div>
                    </>
                )}
            </div>

            <ConfirmDialog
                open={!!deleting}
                onClose={() => setDeleting(null)}
                onConfirm={handleDelete}
                title="Delete subject"
                description={`Are you sure you want to delete "${deleting?.name}"? This action cannot be undone.`}
            />
        </>
    );
}