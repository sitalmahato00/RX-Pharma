import { Head, router, useForm, usePage } from '@inertiajs/react';
import { Search, Users } from 'lucide-react';
import { useState } from 'react';
import { Alert, Avatar, Badge, Button, Card, ConfirmDialog, EmptyState, Input, Pagination, Select } from '@/components/ui';
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

interface UserRow {
    id: number;
    name: string;
    email: string;
    avatar?: string | null;
    role: 'student' | 'admin';
    is_active: boolean;
    last_login_at?: string | null;
    created_at?: string;
    quiz_attempts_count?: number;
    discussions_count?: number;
}

interface PageProps {
    flash?: { success?: string; error?: string };
    users: Paginated<UserRow>;
    filters: { search?: string; role?: string };
    roles: { value: string; label: string }[];
    [key: string]: unknown;
}

function avatarSrc(avatar?: string | null): string | undefined {
    if (!avatar) return undefined;
    return avatar.startsWith('http') ? avatar : `/storage/${avatar.replace(/^\/+/, '')}`;
}

export default function Index({ users, filters, roles }: PageProps) {
    const { props } = usePage<PageProps>();
    const flash = props.flash ?? {};
    const [deleteTarget, setDeleteTarget] = useState<UserRow | null>(null);
    const [deleting, setDeleting] = useState(false);

    const form = useForm({
        search: filters.search ?? '',
        role: filters.role ?? '',
    });

    const applyFilters = () => {
        const data: Record<string, string> = {};
        if (form.data.search.trim()) data.search = form.data.search.trim();
        if (form.data.role) data.role = form.data.role;
        router.get('/admin/users', data, { preserveState: true, replace: true });
    };

    const confirmDelete = () => {
        if (!deleteTarget) return;
        setDeleting(true);
        router.delete(`/admin/users/${deleteTarget.id}`, {
            onFinish: () => {
                setDeleting(false);
                setDeleteTarget(null);
            },
        });
    };

    return (
        <div className="space-y-6">
            <Head title="Users" />
            <div>
                <h1 className="text-2xl font-bold text-ink">Users</h1>
                <p className="text-sm text-muted">Manage student and admin accounts.</p>
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
                <div className="w-full sm:w-64">
                    <Input
                        label="Search"
                        placeholder="Search by name or email..."
                        value={form.data.search}
                        onChange={(e) => form.setData('search', e.target.value)}
                        className="pr-9"
                    />
                </div>
                <div className="w-full sm:w-44">
                    <Select label="Role" value={form.data.role} onChange={(e) => form.setData('role', e.target.value)}>
                        <option value="">All roles</option>
                        {roles.map((r) => (
                            <option key={r.value} value={r.value}>
                                {r.label}
                            </option>
                        ))}
                    </Select>
                </div>
                <Button size="md" onClick={() => applyFilters()}>
                    <Search className="h-4 w-4" />
                    Filter
                </Button>
            </form>

            {users.data.length === 0 ? (
                <Card className="p-6">
                    <EmptyState icon={Users} title="No users found" description="No users match your filters." />
                </Card>
            ) : (
                <div className="card overflow-x-auto">
                    <table className="w-full min-w-[760px] text-left text-sm">
                        <thead>
                            <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-muted">
                                <th className="px-4 py-3 font-medium">User</th>
                                <th className="px-4 py-3 font-medium">Role</th>
                                <th className="px-4 py-3 font-medium">Status</th>
                                <th className="px-4 py-3 font-medium">Attempts</th>
                                <th className="px-4 py-3 font-medium">Discussions</th>
                                <th className="px-4 py-3 font-medium">Last Login</th>
                                <th className="px-4 py-3 font-medium">Joined</th>
                                <th className="px-4 py-3 font-medium">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.data.map((user) => (
                                <tr key={user.id} className="border-b border-slate-100 transition hover:bg-slate-50/60">
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-3">
                                            <Avatar name={user.name} src={avatarSrc(user.avatar)} size="sm" />
                                            <div>
                                                <div className="font-medium text-ink">{user.name}</div>
                                                <div className="text-xs text-muted">{user.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <Badge color={user.role === 'admin' ? 'purple' : 'blue'}>{user.role}</Badge>
                                    </td>
                                    <td className="px-4 py-3">
                                        <Badge color={user.is_active ? 'green' : 'neutral'}>
                                            {user.is_active ? 'Active' : 'Inactive'}
                                        </Badge>
                                    </td>
                                    <td className="px-4 py-3">{user.quiz_attempts_count ?? 0}</td>
                                    <td className="px-4 py-3">{user.discussions_count ?? 0}</td>
                                    <td className="px-4 py-3 text-muted">{user.last_login_at ? timeAgo(user.last_login_at) : 'Never'}</td>
                                    <td className="px-4 py-3 text-muted">{formatDate(user.created_at)}</td>
                                    <td className="px-4 py-3">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <Button size="sm" variant="secondary" href={`/admin/users/${user.id}`}>
                                                View
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="secondary"
                                                onClick={() => router.post(`/admin/users/${user.id}/toggle`, undefined)}
                                            >
                                                {user.is_active ? 'Deactivate' : 'Activate'}
                                            </Button>
                                            <Button size="sm" variant="danger" onClick={() => setDeleteTarget(user)}>
                                                Delete
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {users.links && users.links.length > 3 && (
                <div className="flex justify-end">
                    <Pagination links={users.links} />
                </div>
            )}

            <ConfirmDialog
                open={!!deleteTarget}
                onClose={() => setDeleteTarget(null)}
                onConfirm={confirmDelete}
                title="Delete user?"
                description={`This will permanently delete ${deleteTarget?.name} and all of their activity.`}
                confirmText="Delete"
                loading={deleting}
            />
        </div>
    );
}