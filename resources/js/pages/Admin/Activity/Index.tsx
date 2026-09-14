import { Head, router, useForm, usePage } from '@inertiajs/react';
import { Activity, Search } from 'lucide-react';
import { Alert, Avatar, Badge, Button, Card, EmptyState, Input, Pagination, Select } from '@/components/ui';
import type { PaginationLink } from '@/components/ui';
import { timeAgo } from '@/lib/utils';

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

interface ActivityRow {
    id: number;
    action: string;
    description: string;
    resource_type?: string | null;
    resource_id?: number | null;
    ip?: string | null;
    created_at?: string;
    user?: { id: number; name: string; email: string } | null;
}

interface PageProps {
    flash?: { success?: string; error?: string };
    activities: Paginated<ActivityRow>;
    actions: string[];
    filters: { search?: string; action?: string };
    [key: string]: unknown;
}

const actionColors: Record<string, 'blue' | 'green' | 'orange' | 'red' | 'purple' | 'neutral' | 'amber'> = {
    create: 'green',
    update: 'blue',
    delete: 'red',
    toggle: 'orange',
    publish: 'green',
    resolve: 'purple',
};

export default function Index({ activities, actions, filters }: PageProps) {
    const { props } = usePage<PageProps>();
    const flash = props.flash ?? {};

    const form = useForm({
        search: filters.search ?? '',
        action: filters.action ?? '',
    });

    const applyFilters = () => {
        const data: Record<string, string> = {};
        if (form.data.search.trim()) data.search = form.data.search.trim();
        if (form.data.action) data.action = form.data.action;
        router.get('/admin/activities', data, { preserveState: true, replace: true });
    };

    return (
        <div className="space-y-6">
            <Head title="Activity Log" />
            <div>
                <h1 className="text-2xl font-bold text-ink">Activity Log</h1>
                <p className="text-sm text-muted">Audit trail of admin and platform actions.</p>
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
                <div className="w-full sm:w-72">
                    <Input
                        label="Search"
                        placeholder="Search action, description or resource type..."
                        value={form.data.search}
                        onChange={(e) => form.setData('search', e.target.value)}
                        className="pr-9"
                    />
                </div>
                <div className="w-full sm:w-48">
                    <Select label="Action" value={form.data.action} onChange={(e) => form.setData('action', e.target.value)}>
                        <option value="">All actions</option>
                        {actions.map((action) => (
                            <option key={action} value={action}>
                                {action}
                            </option>
                        ))}
                    </Select>
                </div>
                <Button size="md" onClick={() => applyFilters()}>
                    <Search className="h-4 w-4" />
                    Filter
                </Button>
            </form>

            {activities.data.length === 0 ? (
                <Card className="p-6">
                    <EmptyState icon={Activity} title="No activity found" description="No log entries match your filters." />
                </Card>
            ) : (
                <div className="card overflow-x-auto">
                    <table className="w-full min-w-[720px] text-left text-sm">
                        <thead>
                            <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-muted">
                                <th className="px-4 py-3 font-medium">User</th>
                                <th className="px-4 py-3 font-medium">Action</th>
                                <th className="px-4 py-3 font-medium">Description</th>
                                <th className="px-4 py-3 font-medium">Resource</th>
                                <th className="px-4 py-3 font-medium">IP</th>
                                <th className="px-4 py-3 font-medium">When</th>
                            </tr>
                        </thead>
                        <tbody>
                            {activities.data.map((log) => (
                                <tr key={log.id} className="border-b border-slate-100 transition hover:bg-slate-50/60">
                                    <td className="px-4 py-3">
                                        {log.user ? (
                                            <div className="flex items-center gap-2.5">
                                                <Avatar name={log.user.name} size="sm" />
                                                <div>
                                                    <div className="font-medium text-ink">{log.user.name}</div>
                                                    <div className="text-xs text-muted">{log.user.email}</div>
                                                </div>
                                            </div>
                                        ) : (
                                            <span className="text-muted">System</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3">
                                        <Badge color={actionColors[log.action] ?? 'neutral'}>{log.action}</Badge>
                                    </td>
                                    <td className="px-4 py-3 text-ink">{log.description}</td>
                                    <td className="px-4 py-3">
                                        <span className="text-xs text-muted">{log.resource_type ?? '—'}</span>
                                        {log.resource_id && <span className="ml-1 text-xs text-slate-400">#{log.resource_id}</span>}
                                    </td>
                                    <td className="px-4 py-3 text-xs text-muted">{log.ip ?? '—'}</td>
                                    <td className="px-4 py-3 text-muted">{timeAgo(log.created_at)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {activities.links && activities.links.length > 3 && (
                <div className="flex justify-end">
                    <Pagination links={activities.links} />
                </div>
            )}
        </div>
    );
}