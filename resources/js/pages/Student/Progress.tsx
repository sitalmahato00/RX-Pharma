import { Head, Link, router, usePage } from '@inertiajs/react';
import { GraduationCap, CheckCircle2, TrendingUp, Trophy } from 'lucide-react';
import { Alert, Badge, Button, Card, EmptyState, ProgressBar, StatCard, type BadgeColor } from '@/components/ui';
import { resourceTypeLabel, resourceTypeRoute, timeAgo } from '@/lib/utils';
import type { Quiz, Resource } from '@/types';

interface ProgressItem {
    id: number;
    resource: Resource | Quiz | null;
    status: string;
    progress_percent: number;
    completed_at: string | null;
    updated_at: string | null;
}

interface SubjectProgressItem {
    subject_id: number;
    subject_name: string;
    average_progress: number;
    total_resources: number;
    completed_resources: number;
}

interface ProgressProps {
    progress: ProgressItem[];
    overallProgress: number;
    subjectProgress: SubjectProgressItem[];
    completedByType: Record<string, number>;
    quizStats: {
        total_attempts: number;
        average_score: number;
        passed: number;
    };
}

const RESOURCE_CLASS = 'App\\Models\\Resource';
const QUIZ_CLASS = 'App\\Models\\Quiz';

function isQuiz(item: Resource | Quiz): item is Quiz {
    return !('resource_type' in item);
}

function resourcePath(item: Resource | Quiz): string {
    if (isQuiz(item)) return `/quizzes/${item.slug}`;
    return `/${resourceTypeRoute(item.resource_type)}/${item.slug}`;
}

function resourceType(item: Resource | Quiz): string {
    return isQuiz(item) ? 'quiz' : item.resource_type;
}

const typeBadgeColor: Record<string, BadgeColor> = {
    note: 'blue',
    video: 'orange',
    literature: 'purple',
    previous_paper: 'amber',
    practical: 'green',
    quiz: 'red',
};

export default function Progress(props: ProgressProps) {
    const { flash } = usePage<{ flash?: { success?: string; error?: string; warning?: string } }>().props;
    const { progress, overallProgress, subjectProgress, completedByType, quizStats } = props;

    function handleMarkComplete(item: ProgressItem) {
        if (!item.resource) return;
        router.post(
            '/progress/mark-complete',
            {
                progressable_type: isQuiz(item.resource) ? QUIZ_CLASS : RESOURCE_CLASS,
                progressable_id: item.resource.id,
            },
            { preserveScroll: true }
        );
    }

    const inProgress = progress.filter((p) => p.status !== 'completed' && p.resource);
    const completed = progress.filter((p) => p.status === 'completed' && p.resource);

    return (
        <div className="space-y-6">
            <Head title="My Progress" />

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

            <div>
                <h1 className="text-2xl font-bold text-ink">My Progress</h1>
                <p className="mt-1 text-sm text-muted">Your overall performance and per-subject completion.</p>
            </div>

            <Card className="p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <p className="text-sm font-semibold text-ink">Overall progress</p>
                        <p className="mt-0.5 text-xs text-muted">Average across all started resources.</p>
                    </div>
                    <div className="w-full max-w-xs">
                        <ProgressBar value={overallProgress} showLabel />
                    </div>
                </div>
            </Card>

            <section className="grid grid-cols-2 gap-4 md:grid-cols-4">
                <StatCard icon={TrendingUp} label="Total attempted" value={progress.length} accent="primary" />
                <StatCard icon={CheckCircle2} label="Completed" value={completed.length} accent="green" />
                <StatCard icon={GraduationCap} label="Quizzes taken" value={quizStats.total_attempts} accent="orange" />
                <StatCard icon={Trophy} label="Quizzes passed" value={quizStats.passed} accent="amber" />
            </section>

            {Object.keys(completedByType).length > 0 && (
                <Card className="flex flex-wrap items-center gap-2 p-4">
                    <span className="text-sm font-medium text-ink">Completed by type:</span>
                    {Object.entries(completedByType).map(([type, count]) => (
                        <Badge key={type} color={typeBadgeColor[type]} size="md">
                            {resourceTypeLabel(type)} · {count}
                        </Badge>
                    ))}
                </Card>
            )}

            {subjectProgress.length > 0 && (
                <Card className="p-6">
                    <h2 className="mb-4 font-semibold text-ink">Subject breakdown</h2>
                    <div className="space-y-4">
                        {subjectProgress.map((sp) => (
                            <div key={sp.subject_id}>
                                <div className="mb-1 flex items-center justify-between gap-4">
                                    <span className="truncate text-sm font-medium text-ink">{sp.subject_name}</span>
                                    <span className="shrink-0 text-xs font-medium text-muted">
                                        {sp.completed_resources}/{sp.total_resources} resources
                                    </span>
                                </div>
                                <ProgressBar value={sp.average_progress} size="sm" showLabel />
                            </div>
                        ))}
                    </div>
                </Card>
            )}

            <div className="grid gap-6 lg:grid-cols-2">
                <Card className="p-6">
                    <h2 className="mb-4 font-semibold text-ink">In progress ({inProgress.length})</h2>
                    {inProgress.length === 0 ? (
                        <EmptyState icon={TrendingUp} title="All caught up" description="No resources in progress right now." />
                    ) : (
                        <div className="space-y-3">
                            {inProgress.map((item) => (
                                <div key={item.id} className="rounded-lg border border-slate-200 p-4">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="min-w-0">
                                            <div className="flex items-center gap-2">
                                                {item.resource && (
                                                    <Badge size="sm" color={typeBadgeColor[resourceType(item.resource)]}>
                                                        {resourceTypeLabel(resourceType(item.resource))}
                                                    </Badge>
                                                )}
                                                {item.updated_at && <span className="text-xs text-muted">{timeAgo(item.updated_at)}</span>}
                                            </div>
                                            {item.resource && (
                                                <Link
                                                    href={resourcePath(item.resource)}
                                                    className="mt-1.5 block truncate font-medium text-ink transition hover:text-primary-700"
                                                >
                                                    {item.resource.title}
                                                </Link>
                                            )}
                                            <div className="mt-2 max-w-sm">
                                                <ProgressBar value={item.progress_percent} size="sm" showLabel />
                                            </div>
                                        </div>
                                        <Button size="sm" variant="ghost" onClick={() => handleMarkComplete(item)}>
                                            Complete
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </Card>

                <Card className="p-6">
                    <h2 className="mb-4 font-semibold text-ink">Completed ({completed.length})</h2>
                    {completed.length === 0 ? (
                        <EmptyState icon={CheckCircle2} title="No completed resources yet" description="Keep learning and mark items complete." />
                    ) : (
                        <div className="space-y-3">
                            {completed.map((item) => (
                                <div key={item.id} className="flex items-center gap-3 rounded-lg border border-slate-200 bg-green-50/40 p-4">
                                    <CheckCircle2 className="h-5 w-5 shrink-0 text-green-600" />
                                    <div className="min-w-0 flex-1">
                                        {item.resource && (
                                            <Link
                                                href={resourcePath(item.resource)}
                                                className="block truncate font-medium text-ink transition hover:text-primary-700"
                                            >
                                                {item.resource.title}
                                            </Link>
                                        )}
                                        {item.completed_at && <p className="mt-0.5 text-xs text-muted">{timeAgo(item.completed_at)}</p>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
}