import { Head, router, usePage } from '@inertiajs/react';
import { Bell, CheckCheck, MailOpen } from 'lucide-react';
import { Alert, Badge, Button, Card, EmptyState, Pagination, type PaginationLink } from '@/components/ui';
import { timeAgo } from '@/lib/utils';
import type { AppNotification } from '@/types';

interface Paginator<T> {
    data: T[];
    links: PaginationLink[];
    total: number;
}

interface NotificationsProps {
    notifications: Paginator<AppNotification>;
    unreadCount: number;
}

interface Flash {
    flash?: { success?: string; error?: string; warning?: string };
    [key: string]: unknown;
}

export default function Notifications(props: NotificationsProps) {
    const { flash } = usePage<Flash>().props;
    const { notifications, unreadCount } = props;

    function openNotification(n: AppNotification) {
        if (n.read_at) {
            if (n.link) router.visit(n.link);
            return;
        }

        router.post(
            `/notifications/${n.id}/read`,
            {},
            {
                preserveScroll: true,
                onSuccess: () => {
                    if (n.link) router.visit(n.link);
                },
            }
        );
    }

    function markRead(n: AppNotification) {
        if (n.read_at) return;
        router.post(`/notifications/${n.id}/read`, {}, { preserveScroll: true });
    }

    function markAllRead() {
        router.post('/notifications/read-all', {}, { preserveScroll: true });
    }

    return (
        <div className="space-y-6">
            <Head title="Notifications" />

            {flash?.success && (
                <Alert type="success" dismissible>
                    {flash.success}
                </Alert>
            )}
            {flash?.error && (
                <Alert type="error" dismissible>
                    {flash.error}
                </Alert>
            )}
            {flash?.warning && (
                <Alert type="warning" dismissible>
                    {flash.warning}
                </Alert>
            )}

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-ink">Notifications</h1>
                    <p className="mt-1 text-sm text-muted">
                        {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount === 1 ? '' : 's'}` : 'You are all caught up'}
                    </p>
                </div>
                <Button variant="secondary" onClick={markAllRead} disabled={unreadCount === 0}>
                    <CheckCheck className="h-4 w-4" />
                    Mark all as read
                </Button>
            </div>

            <Card className="p-6">
                {notifications.data.length === 0 ? (
                    <EmptyState icon={Bell} title="No notifications" description="Updates about your learning will appear here." />
                ) : (
                    <div className="space-y-3">
                        {notifications.data.map((n) => (
                            <div
                                key={n.id}
                                role="button"
                                tabIndex={0}
                                onClick={() => openNotification(n)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') openNotification(n);
                                }}
                                className={`flex cursor-pointer items-start gap-4 rounded-lg border p-4 transition hover:bg-slate-50 ${
                                    n.read_at ? 'border-slate-200 bg-white' : 'border-primary-200 bg-primary-50/50'
                                }`}
                            >
                                <div
                                    className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                                        n.read_at ? 'bg-slate-100 text-slate-400' : 'bg-primary-100 text-primary-700'
                                    }`}
                                >
                                    <Bell className="h-4 w-4" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-2">
                                        <p className="font-medium text-ink">{n.title}</p>
                                        {!n.read_at && (
                                            <Badge size="sm" color="blue">
                                                New
                                            </Badge>
                                        )}
                                    </div>
                                    {n.body && <p className="mt-0.5 text-sm text-muted">{n.body}</p>}
                                    <p className="mt-1 text-xs text-slate-400">{timeAgo(n.created_at)}</p>
                                </div>
                                <div className="flex shrink-0 items-center gap-1">
                                    {n.link && (
                                        <span className="text-xs font-medium text-primary-600">Open</span>
                                    )}
                                    {!n.read_at && (
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            aria-label="Mark as read"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                markRead(n);
                                            }}
                                        >
                                            <MailOpen className="h-4 w-4 text-primary-600" />
                                        </Button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {notifications.links && (
                    <div className="mt-6 flex justify-center">
                        <Pagination links={notifications.links} />
                    </div>
                )}
            </Card>
        </div>
    );
}