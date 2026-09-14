import { Head, usePage } from '@inertiajs/react';
import {
    FileText,
    Video,
    Library,
    BookOpen,
    FlaskConical,
    ClipboardList,
    Users,
    MessagesSquare,
    Eye,
    Download,
    Bookmark,
    Flag,
    Clock,
    TrendingUp,
} from 'lucide-react';
import { Alert, Card, StatCard } from '@/components/ui';
import { cn, formatNumber, timeAgo, truncate } from '@/lib/utils';

interface Stats {
    students: number;
    notes: number;
    videos: number;
    mcqs: number;
    literature: number;
    papers: number;
    quizzes: number;
    discussions: number;
}

interface RecentResource {
    id: number;
    title: string;
    resource_type: string;
    status: string;
    views_count: number;
    created_at: string;
    subject?: { id: number; name: string };
}

interface RecentStudent {
    id: number;
    name: string;
    email: string;
    is_active: boolean;
    created_at: string;
}

interface ActivityCounts {
    total_views: number;
    total_bookmarks: number;
    total_downloads: number;
    total_attempts: number;
    pending_reports: number;
    pending_resources: number;
}

interface DashboardProps {
    stats: Stats;
    recentResources: RecentResource[];
    recentStudents: RecentStudent[];
    activityCounts: ActivityCounts;
}

const resourceTypeColors: Record<string, string> = {
    note: 'blue',
    video: 'purple',
    literature: 'green',
    previous_paper: 'amber',
    practical: 'orange',
};

const resourceTypeLabels: Record<string, string> = {
    note: 'Note',
    video: 'Video',
    literature: 'Literature',
    previous_paper: 'Paper',
    practical: 'Practical',
};

export default function Dashboard({ stats, recentResources, recentStudents, activityCounts }: DashboardProps) {
    const { flash } = usePage<{ flash: { success?: string } }>().props;

    return (
        <>
            <Head title="Dashboard" />

            <div className="space-y-6">
                {flash.success && (
                    <Alert type="success" dismissible>{flash.success}</Alert>
                )}

                <div>
                    <h1 className="text-2xl font-bold text-ink">Dashboard</h1>
                    <p className="mt-1 text-sm text-muted">Overview of your platform content and activity.</p>
                </div>

                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                    <StatCard icon={Users} label="Students" value={formatNumber(stats.students)} accent="primary" />
                    <StatCard icon={FileText} label="Notes" value={formatNumber(stats.notes)} accent="primary" />
                    <StatCard icon={Video} label="Videos" value={formatNumber(stats.videos)} accent="purple" />
                    <StatCard icon={ClipboardList} label="MCQs" value={formatNumber(stats.mcqs)} accent="amber" />
                    <StatCard icon={Library} label="Literature" value={formatNumber(stats.literature)} accent="green" />
                    <StatCard icon={BookOpen} label="Papers" value={formatNumber(stats.papers)} accent="orange" />
                    <StatCard icon={FlaskConical} label="Quizzes" value={formatNumber(stats.quizzes)} accent="red" />
                    <StatCard icon={MessagesSquare} label="Discussions" value={formatNumber(stats.discussions)} accent="primary" />
                </div>

                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
                    <div className="card rounded-xl p-4">
                        <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                                <Eye className="h-4 w-4" />
                            </div>
                            <div>
                                <p className="text-xs font-medium uppercase tracking-wide text-muted">Total Views</p>
                                <p className="text-lg font-bold text-ink">{formatNumber(activityCounts.total_views)}</p>
                            </div>
                        </div>
                    </div>
                    <div className="card rounded-xl p-4">
                        <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                                <Bookmark className="h-4 w-4" />
                            </div>
                            <div>
                                <p className="text-xs font-medium uppercase tracking-wide text-muted">Bookmarks</p>
                                <p className="text-lg font-bold text-ink">{formatNumber(activityCounts.total_bookmarks)}</p>
                            </div>
                        </div>
                    </div>
                    <div className="card rounded-xl p-4">
                        <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-green-50 text-green-600">
                                <Download className="h-4 w-4" />
                            </div>
                            <div>
                                <p className="text-xs font-medium uppercase tracking-wide text-muted">Downloads</p>
                                <p className="text-lg font-bold text-ink">{formatNumber(activityCounts.total_downloads)}</p>
                            </div>
                        </div>
                    </div>
                    <div className="card rounded-xl p-4">
                        <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-purple-50 text-purple-600">
                                <TrendingUp className="h-4 w-4" />
                            </div>
                            <div>
                                <p className="text-xs font-medium uppercase tracking-wide text-muted">Quiz Attempts</p>
                                <p className="text-lg font-bold text-ink">{formatNumber(activityCounts.total_attempts)}</p>
                            </div>
                        </div>
                    </div>
                    <div className="card rounded-xl p-4">
                        <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-600">
                                <Flag className="h-4 w-4" />
                            </div>
                            <div>
                                <p className="text-xs font-medium uppercase tracking-wide text-muted">Pending Reports</p>
                                <p className="text-lg font-bold text-ink">{activityCounts.pending_reports}</p>
                            </div>
                        </div>
                    </div>
                    <div className="card rounded-xl p-4">
                        <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-orange-50 text-orange-600">
                                <Clock className="h-4 w-4" />
                            </div>
                            <div>
                                <p className="text-xs font-medium uppercase tracking-wide text-muted">Draft Resources</p>
                                <p className="text-lg font-bold text-ink">{activityCounts.pending_resources}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                    <Card className="p-6">
                        <h2 className="mb-4 font-semibold text-ink">Recent Resources</h2>
                        {recentResources.length === 0 ? (
                            <p className="py-6 text-center text-sm text-muted">No resources yet.</p>
                        ) : (
                            <div className="divide-y divide-slate-100">
                                {recentResources.map((r) => (
                                    <div key={r.id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                                        <div className="min-w-0">
                                            <p className="text-sm font-medium text-ink truncate">{truncate(r.title, 50)}</p>
                                            <div className="mt-0.5 flex items-center gap-2">
                                                <span className={cn(
                                                    'inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium',
                                                    r.status === 'published' ? 'bg-green-50 text-green-700' : 'bg-slate-100 text-slate-600'
                                                )}>
                                                    {r.status}
                                                </span>
                                                <span className="text-xs text-muted">
                                                    {resourceTypeLabels[r.resource_type] ?? r.resource_type}
                                                </span>
                                                {r.subject && (
                                                    <span className="text-xs text-muted">{r.subject.name}</span>
                                                )}
                                            </div>
                                        </div>
                                        <span className="shrink-0 text-xs text-muted">{timeAgo(r.created_at)}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </Card>

                    <Card className="p-6">
                        <h2 className="mb-4 font-semibold text-ink">Recent Students</h2>
                        {recentStudents.length === 0 ? (
                            <p className="py-6 text-center text-sm text-muted">No students registered.</p>
                        ) : (
                            <div className="divide-y divide-slate-100">
                                {recentStudents.map((s) => (
                                    <div key={s.id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                                        <div className="min-w-0">
                                            <p className="text-sm font-medium text-ink">{s.name}</p>
                                            <p className="text-xs text-muted truncate">{s.email}</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className={cn(
                                                'inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium',
                                                s.is_active ? 'bg-green-50 text-green-700' : 'bg-slate-100 text-slate-600'
                                            )}>
                                                {s.is_active ? 'Active' : 'Inactive'}
                                            </span>
                                            <span className="text-xs text-muted">{timeAgo(s.created_at)}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </Card>
                </div>
            </div>
        </>
    );
}
