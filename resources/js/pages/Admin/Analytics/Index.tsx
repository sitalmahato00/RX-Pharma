import { Head } from '@inertiajs/react';
import { BarChart3, BookOpen, Film, FileText, FileArchive, FlaskConical, History, MonitorPlay, Trophy, Users } from 'lucide-react';
import { Badge, Card, StatCard } from '@/components/ui';
import { formatDate, resourceTypeLabel } from '@/lib/utils';

interface RegistrationPoint {
    label: string;
    total: number;
}

interface ResourceRow {
    id: number;
    title: string;
    views_count: number;
    status: string;
    resource_type?: string;
    created_at?: string;
    subject?: { id: number; name: string } | null;
}

interface SubjectPopular {
    id: number;
    name: string;
    color?: string | null;
    resources_count: number;
}

interface QuizAttempted {
    id: number;
    title: string;
    difficulty: 'easy' | 'medium' | 'hard';
    status: string;
    attempts_count: number;
}

interface AnalyticsProps {
    resourceStats: Record<string, number>;
    studentRegistrations: RegistrationPoint[];
    mostViewedNotes: ResourceRow[];
    mostWatchedVideos: ResourceRow[];
    popularSubjects: SubjectPopular[];
    quizPerformance: { total_attempts: number; average_score: number; pass_rate: number };
    mostAttemptedQuizzes: QuizAttempted[];
    recentResources: ResourceRow[];
    [key: string]: unknown;
}

const resourceTypeIcon = (type: string) => {
    switch (type) {
        case 'video':
            return Film;
        case 'literature':
            return FileText;
        case 'previous_paper':
            return FileArchive;
        case 'practical':
            return FlaskConical;
        default:
            return BookOpen;
    }
};

const difficultyColor = (difficulty: QuizAttempted['difficulty']) =>
    difficulty === 'easy' ? 'green' : difficulty === 'hard' ? 'red' : 'amber';

function BarChart({ items }: { items: RegistrationPoint[] }) {
    const max = Math.max(...items.map((i) => i.total), 1);
    return (
        <div className="space-y-2.5">
            {items.map((item) => (
                <div key={item.label} className="flex items-center gap-3">
                    <span className="w-16 shrink-0 text-xs text-muted">{item.label}</span>
                    <div className="h-6 flex-1 overflow-hidden rounded-md bg-slate-100">
                        <div className="h-full rounded-md bg-primary-600 transition-all" style={{ width: `${(item.total / max) * 100}%` }} />
                    </div>
                    <span className="w-10 shrink-0 text-right text-xs font-semibold text-ink">{item.total}</span>
                </div>
            ))}
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    return (
        <Badge color={status === 'published' ? 'green' : status === 'draft' ? 'amber' : 'neutral'}>
            {status}
        </Badge>
    );
}

export default function Analytics({
    resourceStats,
    studentRegistrations,
    mostViewedNotes,
    mostWatchedVideos,
    popularSubjects,
    quizPerformance,
    mostAttemptedQuizzes,
    recentResources,
}: AnalyticsProps) {
    const maxSubjectResources = Math.max(...popularSubjects.map((s) => s.resources_count), 1);
    const resourceEntries = Object.entries(resourceStats);

    return (
        <div className="space-y-6">
            <Head title="Analytics" />
            <div>
                <h1 className="text-2xl font-bold text-ink">Analytics</h1>
                <p className="text-sm text-muted">Platform performance and engagement overview.</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard icon={History} label="Total attempts" value={quizPerformance.total_attempts} accent="primary" />
                <StatCard icon={Trophy} label="Average score" value={`${quizPerformance.average_score}%`} accent={quizPerformance.average_score >= 50 ? 'green' : 'red'} />
                <StatCard icon={MonitorPlay} label="Pass rate" value={`${quizPerformance.pass_rate}%`} accent="purple" />
                <StatCard icon={Users} label="Resources" value={Object.values(resourceStats).reduce((a, b) => a + b, 0)} accent="orange" />
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                <Card className="p-6">
                    <h2 className="mb-4 font-semibold text-ink">Student registrations (6 months)</h2>
                    <BarChart items={studentRegistrations} />
                </Card>

                <Card className="p-6">
                    <h2 className="mb-4 font-semibold text-ink">Resources by type</h2>
                    {resourceEntries.length === 0 ? (
                        <p className="text-sm text-muted">No resources yet.</p>
                    ) : (
                        <div className="space-y-2.5">
                            {resourceEntries.map(([type, total]) => {
                                const Icon = resourceTypeIcon(type);
                                const max = Math.max(...resourceEntries.map(([, v]) => v), 1);
                                return (
                                    <div key={type} className="flex items-center gap-3">
                                        <Icon className="h-4 w-4 shrink-0 text-slate-400" />
                                        <span className="w-32 shrink-0 text-xs text-muted">{resourceTypeLabel(type)}</span>
                                        <div className="h-6 flex-1 overflow-hidden rounded-md bg-slate-100">
                                            <div className="h-full rounded-md bg-primary-600 transition-all" style={{ width: `${(total / max) * 100}%` }} />
                                        </div>
                                        <span className="w-10 shrink-0 text-right text-xs font-semibold text-ink">{total}</span>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </Card>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                <Card className="p-6">
                    <h2 className="mb-4 font-semibold text-ink">Popular subjects</h2>
                    <div className="space-y-2.5">
                        {popularSubjects.map((subject) => (
                            <div key={subject.id} className="flex items-center gap-3">
                                <span className="w-40 truncate text-sm text-ink">{subject.name}</span>
                                <div className="h-6 flex-1 overflow-hidden rounded-md bg-slate-100">
                                    <div
                                        className="h-full rounded-md transition-all"
                                        style={{
                                            width: `${(subject.resources_count / maxSubjectResources) * 100}%`,
                                            backgroundColor: subject.color ?? '#2563EB',
                                        }}
                                    />
                                </div>
                                <span className="w-10 shrink-0 text-right text-xs font-semibold text-ink">
                                    {subject.resources_count}
                                </span>
                            </div>
                        ))}
                    </div>
                </Card>

                <Card className="p-6">
                    <h2 className="mb-4 font-semibold text-ink">Most viewed notes</h2>
                    <div className="space-y-2.5">
                        {mostViewedNotes.map((note) => (
                            <div key={note.id} className="flex items-center gap-3">
                                <BarChart3 className="h-4 w-4 shrink-0 text-slate-400" />
                                <span className="min-w-0 flex-1 truncate text-sm text-ink">{note.title}</span>
                                <StatusBadge status={note.status} />
                                <span className="w-10 shrink-0 text-right text-xs font-semibold text-ink">{note.views_count}</span>
                            </div>
                        ))}
                        {mostViewedNotes.length === 0 && <p className="text-sm text-muted">No notes yet.</p>}
                    </div>
                </Card>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                <Card className="p-6">
                    <h2 className="mb-4 font-semibold text-ink">Most watched videos</h2>
                    <div className="space-y-2.5">
                        {mostWatchedVideos.map((video) => (
                            <div key={video.id} className="flex items-center gap-3">
                                <Film className="h-4 w-4 shrink-0 text-slate-400" />
                                <span className="min-w-0 flex-1 truncate text-sm text-ink">{video.title}</span>
                                <StatusBadge status={video.status} />
                                <span className="w-10 shrink-0 text-right text-xs font-semibold text-ink">{video.views_count}</span>
                            </div>
                        ))}
                        {mostWatchedVideos.length === 0 && <p className="text-sm text-muted">No videos yet.</p>}
                    </div>
                </Card>

                <Card className="p-6">
                    <h2 className="mb-4 font-semibold text-ink">Most attempted quizzes</h2>
                    <div className="space-y-2.5">
                        {mostAttemptedQuizzes.map((quiz) => (
                            <div key={quiz.id} className="flex items-center gap-3">
                                <span className="min-w-0 flex-1 truncate text-sm text-ink">{quiz.title}</span>
                                <Badge color={difficultyColor(quiz.difficulty)}>{quiz.difficulty}</Badge>
                                <StatusBadge status={quiz.status} />
                                <span className="w-10 shrink-0 text-right text-xs font-semibold text-ink">{quiz.attempts_count}</span>
                            </div>
                        ))}
                        {mostAttemptedQuizzes.length === 0 && <p className="text-sm text-muted">No attempts yet.</p>}
                    </div>
                </Card>
            </div>

            <Card className="overflow-x-auto">
                <div className="border-b border-slate-200 px-6 py-4">
                    <h2 className="font-semibold text-ink">Recent resources</h2>
                </div>
                <table className="w-full min-w-[640px] text-left text-sm">
                    <thead>
                        <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-muted">
                            <th className="px-4 py-3 font-medium">Title</th>
                            <th className="px-4 py-3 font-medium">Type</th>
                            <th className="px-4 py-3 font-medium">Subject</th>
                            <th className="px-4 py-3 font-medium">Views</th>
                            <th className="px-4 py-3 font-medium">Status</th>
                            <th className="px-4 py-3 font-medium">Created</th>
                        </tr>
                    </thead>
                    <tbody>
                        {recentResources.map((resource) => (
                            <tr key={resource.id} className="border-b border-slate-100 transition hover:bg-slate-50/60">
                                <td className="px-4 py-3 font-medium text-ink">{resource.title}</td>
                                <td className="px-4 py-3 text-muted">{resourceTypeLabel(resource.resource_type ?? 'note')}</td>
                                <td className="px-4 py-3">{resource.subject?.name ?? '—'}</td>
                                <td className="px-4 py-3">{resource.views_count}</td>
                                <td className="px-4 py-3">
                                    <StatusBadge status={resource.status} />
                                </td>
                                <td className="px-4 py-3 text-muted">{formatDate(resource.created_at)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {recentResources.length === 0 && (
                    <p className="px-6 py-8 text-center text-sm text-muted">No resources yet.</p>
                )}
            </Card>
        </div>
    );
}