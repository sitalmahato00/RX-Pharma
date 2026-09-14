import { Head, router, usePage } from '@inertiajs/react';
import { Activity, ArrowLeft, BookOpen, Bookmark, MessageSquare, Phone, UserCheck } from 'lucide-react';
import { Alert, Avatar, Badge, Button, Card, EmptyState, StatCard } from '@/components/ui';
import { formatDate, timeAgo } from '@/lib/utils';

interface ActivityRow {
    id: number;
    action: string;
    description: string;
    resource_type?: string | null;
    created_at?: string;
}

interface AttemptRow {
    id: number;
    quiz: { id: number; title: string };
    score_percentage: number;
    passed: boolean;
    status: string;
    completed_at?: string | null;
    created_at?: string;
}

interface UserFull {
    id: number;
    name: string;
    email: string;
    avatar?: string | null;
    phone?: string | null;
    role: 'student' | 'admin';
    is_active: boolean;
    last_login_at?: string | null;
    created_at?: string;
    university?: { id: number; name: string } | null;
    college?: { id: number; name: string } | null;
    program?: { id: number; name: string } | null;
    semester?: { id: number; name: string; number: number } | null;
    activity_logs?: ActivityRow[];
    quiz_attempts?: AttemptRow[];
}

interface PageProps {
    flash?: { success?: string; error?: string };
    user: UserFull;
    stats: {
        attempts_count: number;
        discussions_count: number;
        bookmarks_count: number;
        average_score: number;
    };
    [key: string]: unknown;
}

const actionColors: Record<string, 'blue' | 'green' | 'orange' | 'red' | 'purple' | 'neutral' | 'amber'> = {
    create: 'green',
    update: 'blue',
    delete: 'red',
    toggle: 'orange',
    publish: 'green',
};

function avatarSrc(avatar?: string | null): string | undefined {
    if (!avatar) return undefined;
    return avatar.startsWith('http') ? avatar : `/storage/${avatar.replace(/^\/+/, '')}`;
}

export default function Show({ user, stats }: PageProps) {
    const { props } = usePage<PageProps>();
    const flash = props.flash ?? {};

    const attempts = user.quiz_attempts ?? [];
    const activities = user.activity_logs ?? [];

    return (
        <div className="space-y-6">
            <Head title={user.name} />
            <div>
                <Button variant="secondary" href="/admin/users">
                    <ArrowLeft className="h-4 w-4" />
                    Back to users
                </Button>
            </div>

            {flash.success && <Alert type="success">{flash.success}</Alert>}
            {flash.error && <Alert type="error">{flash.error}</Alert>}

            <Card className="p-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <Avatar name={user.name} src={avatarSrc(user.avatar)} size="lg" />
                        <div>
                            <div className="flex flex-wrap items-center gap-2">
                                <h1 className="text-xl font-bold text-ink">{user.name}</h1>
                                <Badge color={user.role === 'admin' ? 'purple' : 'blue'}>{user.role}</Badge>
                                <Badge color={user.is_active ? 'green' : 'neutral'}>
                                    {user.is_active ? 'Active' : 'Inactive'}
                                </Badge>
                            </div>
                            <p className="mt-1 text-sm text-muted">{user.email}</p>
                            {user.phone && (
                                <p className="mt-0.5 flex items-center gap-1.5 text-sm text-muted">
                                    <Phone className="h-3.5 w-3.5" />
                                    {user.phone}
                                </p>
                            )}
                            <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-500">
                                <span className="rounded-md bg-slate-100 px-2 py-1">{user.program?.name ?? 'No program'}</span>
                                <span className="rounded-md bg-slate-100 px-2 py-1">
                                    {user.semester ? `${user.semester.number}. ${user.semester.name}` : 'No semester'}
                                </span>
                                <span className="rounded-md bg-slate-100 px-2 py-1">{user.college?.name ?? 'No college'}</span>
                                <span className="rounded-md bg-slate-100 px-2 py-1">{user.university?.name ?? 'No university'}</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <Button
                            variant="secondary"
                            onClick={() =>
                                router.post(`/admin/users/${user.id}/toggle`, undefined, { preserveScroll: true })
                            }
                        >
                            <UserCheck className="h-4 w-4" />
                            {user.is_active ? 'Deactivate' : 'Activate'}
                        </Button>
                    </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-4 border-t border-slate-100 pt-4 text-xs text-muted">
                    <span>Joined {formatDate(user.created_at)}</span>
                    <span>Last login {user.last_login_at ? timeAgo(user.last_login_at) : 'Never'}</span>
                </div>
            </Card>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard icon={BookOpen} label="Attempts" value={stats.attempts_count} accent="primary" />
                <StatCard icon={MessageSquare} label="Discussions" value={stats.discussions_count} accent="purple" />
                <StatCard icon={Bookmark} label="Bookmarks" value={stats.bookmarks_count} accent="amber" />
                <StatCard
                    icon={Activity}
                    label="Average score"
                    value={`${stats.average_score}%`}
                    accent={stats.average_score >= 50 ? 'green' : 'red'}
                />
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                <Card className="p-6">
                    <h2 className="mb-4 font-semibold text-ink">Recent Quiz Attempts</h2>
                    {attempts.length === 0 ? (
                        <EmptyState icon={BookOpen} title="No attempts yet" />
                    ) : (
                        <ul className="divide-y divide-slate-100">
                            {attempts.map((attempt) => (
                                <li key={attempt.id} className="flex items-center justify-between gap-3 py-3">
                                    <div className="min-w-0">
                                        <span className="truncate text-sm font-medium text-ink">{attempt.quiz.title}</span>
                                        <p className="text-xs text-muted">
                                            {attempt.status === 'in_progress'
                                                ? 'In progress'
                                                : formatDate(attempt.completed_at ?? attempt.created_at)}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-semibold text-ink">{attempt.score_percentage}%</span>
                                        <Badge color={attempt.passed ? 'green' : 'red'}>
                                            {attempt.passed ? 'Passed' : 'Failed'}
                                        </Badge>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </Card>

                <Card className="p-6">
                    <h2 className="mb-4 font-semibold text-ink">Recent Activity</h2>
                    {activities.length === 0 ? (
                        <EmptyState icon={Activity} title="No activity yet" />
                    ) : (
                        <ul className="divide-y divide-slate-100">
                            {activities.map((log) => (
                                <li key={log.id} className="flex items-start justify-between gap-3 py-3">
                                    <div className="min-w-0">
                                        <p className="text-sm text-ink">{log.description}</p>
                                        <p className="text-xs text-muted">
                                            {log.resource_type ?? 'system'} · {timeAgo(log.created_at)}
                                        </p>
                                    </div>
                                    <Badge color={actionColors[log.action] ?? 'neutral'}>{log.action}</Badge>
                                </li>
                            ))}
                        </ul>
                    )}
                </Card>
            </div>
        </div>
    );
}