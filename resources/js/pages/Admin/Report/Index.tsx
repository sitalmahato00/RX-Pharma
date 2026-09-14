import { Head, router, useForm, usePage } from '@inertiajs/react';
import { CheckCircle2, Clock, Flag } from 'lucide-react';
import { useState } from 'react';
import { Alert, Badge, Button, Card, EmptyState, Modal, Pagination, Select, Textarea } from '@/components/ui';
import type { PaginationLink } from '@/components/ui';
import { formatDate, timeAgo } from '@/lib/utils';

interface Paginated<T> {
    data: T[];
    links: PaginationLink[];
    current_page: number;
    last_page: number;
    total: number;
    from: number;
    to: number;
    per_page: number;
}

interface Reportable {
    id: number;
    title?: string;
    content?: string;
    slug?: string;
    question?: string;
    option_text?: string;
    [key: string]: unknown;
}

interface ReportRow {
    id: number;
    reason: string;
    description?: string | null;
    status: 'pending' | 'reviewed' | 'resolved';
    admin_notes?: string | null;
    handled_at?: string | null;
    created_at?: string;
    user: { id: number; name: string; email: string };
    reportable?: Reportable | null;
    reportable_type?: string;
    handledBy?: { id: number; name: string } | null;
}

interface PageProps {
    flash?: { success?: string; error?: string };
    reports: Paginated<ReportRow>;
    filters: { status?: string };
    statuses: { value: string; label: string }[];
    [key: string]: unknown;
}

const statusColor = (status: ReportRow['status']): 'amber' | 'blue' | 'green' =>
    status === 'resolved' ? 'green' : status === 'reviewed' ? 'blue' : 'amber';

function modelType(type?: string): string {
    if (!type) return 'Unknown';
    return type.split('\\').pop() ?? 'Unknown';
}

function reportableTitle(r?: Reportable | null): string {
    if (!r) return 'Deleted content';
    const any = r as Record<string, unknown>;
    return (any.title as string) || (any.content as string) || (any.question as string) || 'Content';
}

export default function Index({ reports, filters, statuses }: PageProps) {
    const { props } = usePage<PageProps>();
    const flash = props.flash ?? {};
    const [detailTarget, setDetailTarget] = useState<ReportRow | null>(null);
    const [resolvingId, setResolvingId] = useState<number | null>(null);

    const resolveForm = useForm({ admin_notes: '' });

    const form = useForm({
        status: filters.status ?? '',
    });

    const applyFilters = () => {
        const data: Record<string, string> = {};
        if (form.data.status) data.status = form.data.status;
        router.get('/admin/reports', data, { preserveState: true, replace: true });
    };

    const handleResolve = (id: number) => {
        setResolvingId(id);
        resolveForm.post(`/admin/reports/${id}/resolve`, {
            preserveScroll: true,
            onFinish: () => {
                setResolvingId(null);
                setDetailTarget(null);
                resolveForm.reset();
            },
        });
    };

    return (
        <div className="space-y-6">
            <Head title="Reports" />
            <div>
                <h1 className="text-2xl font-bold text-ink">Reports</h1>
                <p className="text-sm text-muted">Review and resolve content reports from students.</p>
            </div>

            {flash.success && <Alert type="success">{flash.success}</Alert>}
            {flash.error && <Alert type="error">{flash.error}</Alert>}

            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    applyFilters();
                }}
                className="card flex flex-wrap items-end gap-3 p-4"
            >
                <div className="w-full sm:w-44">
                    <Select label="Status" value={form.data.status} onChange={(e) => form.setData('status', e.target.value)}>
                        <option value="">All statuses</option>
                        {statuses.map((s) => (
                            <option key={s.value} value={s.value}>
                                {s.label}
                            </option>
                        ))}
                    </Select>
                </div>
                <Button size="md" onClick={() => applyFilters()}>
                    Filter
                </Button>
            </form>

            {reports.data.length === 0 ? (
                <Card className="p-6">
                    <EmptyState icon={Flag} title="No reports found" description="No reports match your filters." />
                </Card>
            ) : (
                <div className="card overflow-x-auto">
                    <table className="w-full min-w-[740px] text-left text-sm">
                        <thead>
                            <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-muted">
                                <th className="px-4 py-3 font-medium">Content</th>
                                <th className="px-4 py-3 font-medium">Reporter</th>
                                <th className="px-4 py-3 font-medium">Reason</th>
                                <th className="px-4 py-3 font-medium">Status</th>
                                <th className="px-4 py-3 font-medium">Created</th>
                                <th className="px-4 py-3 font-medium">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {reports.data.map((report) => (
                                <tr key={report.id} className="border-b border-slate-100 transition hover:bg-slate-50/60">
                                    <td className="px-4 py-3">
                                        <span className="font-medium text-ink">{reportableTitle(report.reportable)}</span>
                                        <span className="ml-1.5 text-xs text-muted">({modelType(report.reportable_type)})</span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="font-medium text-ink">{report.user.name}</div>
                                        <div className="text-xs text-muted">{report.user.email}</div>
                                    </td>
                                    <td className="px-4 py-3">{report.reason}</td>
                                    <td className="px-4 py-3">
                                        <Badge color={statusColor(report.status)}>{report.status}</Badge>
                                    </td>
                                    <td className="px-4 py-3 text-muted">{timeAgo(report.created_at)}</td>
                                    <td className="px-4 py-3">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <Button size="sm" variant="secondary" onClick={() => setDetailTarget(report)}>
                                                Details
                                            </Button>
                                            {report.status !== 'resolved' && (
                                                <Button size="sm" variant="success" onClick={() => handleResolve(report.id)}>
                                                    <CheckCircle2 className="h-3.5 w-3.5" />
                                                    Resolve
                                                </Button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {reports.links && reports.links.length > 3 && (
                <div className="flex justify-end">
                    <Pagination links={reports.links} />
                </div>
            )}

            <Modal
                open={!!detailTarget}
                onClose={() => {
                    setDetailTarget(null);
                    resolveForm.reset();
                }}
                title="Report Details"
                footer={
                    detailTarget && detailTarget.status !== 'resolved' ? (
                        <Button onClick={() => handleResolve(detailTarget.id)} loading={resolvingId === detailTarget.id}>
                            <CheckCircle2 className="h-4 w-4" />
                            Mark resolved
                        </Button>
                    ) : undefined
                }
            >
                {detailTarget && (
                    <div className="space-y-4">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wide text-muted">Content</p>
                            <p className="mt-1 text-sm font-medium text-ink">
                                {reportableTitle(detailTarget.reportable)}
                                <span className="ml-1 text-muted">({modelType(detailTarget.reportable_type)})</span>
                            </p>
                        </div>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-wide text-muted">Reporter</p>
                                <p className="mt-0.5 text-ink">{detailTarget.user.name}</p>
                            </div>
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-wide text-muted">Status</p>
                                <p className="mt-0.5">
                                    <Badge color={statusColor(detailTarget.status)}>{detailTarget.status}</Badge>
                                </p>
                            </div>
                        </div>
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wide text-muted">Reason</p>
                            <p className="mt-1 text-sm text-ink">{detailTarget.reason}</p>
                            {detailTarget.description && (
                                <p className="mt-1 whitespace-pre-wrap text-sm text-muted">{detailTarget.description}</p>
                            )}
                        </div>
                        {detailTarget.admin_notes && (
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-wide text-muted">Admin notes</p>
                                <p className="mt-1 whitespace-pre-wrap text-sm text-ink">{detailTarget.admin_notes}</p>
                            </div>
                        )}
                        {detailTarget.handledBy && (
                            <div className="flex items-center gap-2 text-xs text-muted">
                                <Clock className="h-3.5 w-3.5" />
                                Handled by {detailTarget.handledBy.name} · {formatDate(detailTarget.handled_at)}
                            </div>
                        )}
                        {detailTarget.status !== 'resolved' && (
                            <Textarea
                                label="Admin notes (optional)"
                                rows={2}
                                value={resolveForm.data.admin_notes}
                                onChange={(e) => resolveForm.setData('admin_notes', e.target.value)}
                                placeholder="Add internal notes before resolving..."
                            />
                        )}
                    </div>
                )}
            </Modal>
        </div>
    );
}