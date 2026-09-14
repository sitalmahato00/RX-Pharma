import { Head, Link, router, usePage } from '@inertiajs/react';
import { BookOpen, CheckCircle2, Clock, Sparkles } from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { Alert, Badge, Button, Card, EmptyState, ProgressBar, Tabs, type BadgeColor } from '@/components/ui';
import { cn, resourceTypeLabel, resourceTypeRoute, timeAgo } from '@/lib/utils';
import type { Quiz, Resource } from '@/types';

interface LearningItem {
    id: number;
    resource: Resource | Quiz;
    progress_percent: number;
    status: string;
    updated_at: string;
}

interface CompletedItem {
    id: number;
    resource: Resource | Quiz;
    completed_at: string;
}

interface RecentlyViewedItem {
    resource: Resource | Quiz;
    viewed_at: string;
}

interface LearningProps {
    continueLearning: LearningItem[];
    recentlyViewed: RecentlyViewedItem[];
    savedResources: Resource[];
    recommended: Resource[];
    completed: CompletedItem[];
    counts: {
        in_progress: number;
        completed: number;
        saved: number;
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

function ResourceRow({ resource, trailing }: { resource: Resource | Quiz; trailing?: ReactNode }) {
    return (
        <div className="rounded-lg border border-slate-200 bg-white p-4">
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                        <Badge size="sm" color={typeBadgeColor[resourceType(resource)]}>
                            {resourceTypeLabel(resourceType(resource))}
                        </Badge>
                        {resource.subject?.name && <span className="text-xs text-muted">{resource.subject.name}</span>}
                    </div>
                    <Link
                        href={resourcePath(resource)}
                        className="mt-2 block font-semibold text-ink transition hover:text-primary-700"
                    >
                        {resource.title}
                    </Link>
                </div>
                {trailing}
            </div>
        </div>
    );
}

function CompletedResourceRow({ item }: { item: CompletedItem }) {
    return (
        <div className="rounded-lg border border-slate-200 bg-white p-4">
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                        <Badge size="sm" color={typeBadgeColor[resourceType(item.resource)]}>
                            {resourceTypeLabel(resourceType(item.resource))}
                        </Badge>
                        {item.resource.subject?.name && <span className="text-xs text-muted">{item.resource.subject.name}</span>}
                    </div>
                    <Link
                        href={resourcePath(item.resource)}
                        className="mt-2 block font-semibold text-ink transition hover:text-primary-700"
                    >
                        {item.resource.title}
                    </Link>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                    <Badge color="green" size="sm">
                        <CheckCircle2 className="mr-1 h-3 w-3" />
                        Completed
                    </Badge>
                    <span className="text-xs text-muted">{timeAgo(item.completed_at)}</span>
                </div>
            </div>
        </div>
    );
}

export default function Learning(props: LearningProps) {
    const { flash } = usePage<{ flash?: { success?: string; error?: string; warning?: string } }>().props;
    const { continueLearning, recentlyViewed, savedResources, recommended, completed, counts } = props;
    const [activeTab, setActiveTab] = useState('in_progress');

    function handleMarkComplete(item: LearningItem) {
        router.post(
            '/progress/mark-complete',
            {
                progressable_type: isQuiz(item.resource) ? QUIZ_CLASS : RESOURCE_CLASS,
                progressable_id: item.resource.id,
            },
            { preserveScroll: true }
        );
    }

    const tabs = [
        { value: 'in_progress', label: `In Progress (${counts.in_progress})` },
        { value: 'saved', label: `Saved (${counts.saved})` },
        { value: 'completed', label: `Completed (${counts.completed})` },
        { value: 'recently_viewed', label: 'Recently Viewed' },
        { value: 'recommended', label: 'Recommended' },
    ];

    return (
        <div className="space-y-6">
            <Head title="My Learning" />

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
                    <h1 className="text-2xl font-bold text-ink">My Learning</h1>
                    <p className="mt-1 text-sm text-muted">Track your in-progress, saved and completed resources.</p>
                </div>
                <Button href="/quizzes">
                    <BookOpen className="h-4 w-4" />
                    Practice quizzes
                </Button>
            </div>

            <Card className="p-6">
                <Tabs tabs={tabs} value={activeTab} onChange={setActiveTab} />

                <div className="mt-6">
                    {activeTab === 'in_progress' && (
                        <div className="space-y-3">
                            {continueLearning.length === 0 ? (
                                <EmptyState
                                    icon={BookOpen}
                                    title="No resources in progress"
                                    description="Start a resource and your progress will appear here."
                                    action={
                                        <Button size="sm" href="/notes">
                                            Browse resources
                                        </Button>
                                    }
                                />
                            ) : (
                                continueLearning.map((item) => (
                                    <div key={item.id} className="rounded-lg border border-slate-200 bg-white p-4">
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="min-w-0 flex-1">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <Badge size="sm" color={typeBadgeColor[resourceType(item.resource)]}>
                                                        {resourceTypeLabel(resourceType(item.resource))}
                                                    </Badge>
                                                    {item.resource.subject?.name && (
                                                        <span className="text-xs text-muted">{item.resource.subject.name}</span>
                                                    )}
                                                    <span className="text-xs text-muted">{timeAgo(item.updated_at)}</span>
                                                </div>
                                                <Link
                                                    href={resourcePath(item.resource)}
                                                    className="mt-2 block font-semibold text-ink transition hover:text-primary-700"
                                                >
                                                    {item.resource.title}
                                                </Link>
                                                <div className="mt-3 max-w-sm">
                                                    <ProgressBar value={item.progress_percent} size="sm" showLabel />
                                                </div>
                                            </div>
                                            <Button size="sm" variant="ghost" onClick={() => handleMarkComplete(item)}>
                                                Mark complete
                                            </Button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}

                    {activeTab === 'saved' && (
                        <div className="space-y-3">
                            {savedResources.length === 0 ? (
                                <EmptyState
                                    icon={BookOpen}
                                    title="Nothing saved yet"
                                    description="Bookmark resources from the library to access them quickly here."
                                    action={
                                        <Button size="sm" href="/notes">
                                            Browse resources
                                        </Button>
                                    }
                                />
                            ) : (
                                savedResources.map((resource) => (
                                    <ResourceRow
                                        key={resource.id}
                                        resource={resource}
                                        trailing={
                                            <Button size="sm" variant="secondary" href={resourcePath(resource)}>
                                                View
                                            </Button>
                                        }
                                    />
                                ))
                            )}
                        </div>
                    )}

                    {activeTab === 'completed' && (
                        <div className="space-y-3">
                            {completed.length === 0 ? (
                                <EmptyState
                                    icon={CheckCircle2}
                                    title="No completed resources"
                                    description="Resources you mark complete will be listed here."
                                />
                            ) : (
                                completed.map((item) => <CompletedResourceRow key={item.id} item={item} />)
                            )}
                        </div>
                    )}

                    {activeTab === 'recently_viewed' && (
                        <div className="space-y-3">
                            {recentlyViewed.length === 0 ? (
                                <EmptyState
                                    icon={Clock}
                                    title="No recent views"
                                    description="Resources you open will show up here."
                                />
                            ) : (
                                <div className="divide-y divide-slate-100">
                                    {recentlyViewed.map((view, index) => (
                                        <Link
                                            key={index}
                                            href={resourcePath(view.resource)}
                                            className="flex items-center justify-between gap-3 py-3 transition hover:bg-slate-50"
                                        >
                                            <div className="flex min-w-0 items-center gap-3">
                                                <Badge size="sm" color={typeBadgeColor[resourceType(view.resource)]}>
                                                    {resourceTypeLabel(resourceType(view.resource))}
                                                </Badge>
                                                <p className="truncate text-sm font-medium text-ink">{view.resource.title}</p>
                                            </div>
                                            <span className="shrink-0 text-xs text-muted">{timeAgo(view.viewed_at)}</span>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'recommended' && (
                        <div className="space-y-3">
                            {recommended.length === 0 ? (
                                <EmptyState
                                    icon={Sparkles}
                                    title="No recommendations yet"
                                    description="New recommendations will appear as you learn."
                                />
                            ) : (
                                <div className="grid gap-3 sm:grid-cols-2">
                                    {recommended.map((resource) => (
                                        <Link
                                            key={resource.id}
                                            href={resourcePath(resource)}
                                            className={cn(
                                                'group rounded-lg border border-slate-200 p-4 transition',
                                                'hover:border-primary-200 hover:bg-primary-50/40'
                                            )}
                                        >
                                            <Badge size="sm" color={typeBadgeColor[resourceType(resource)]}>
                                                {resourceTypeLabel(resourceType(resource))}
                                            </Badge>
                                            <p className="mt-2 line-clamp-2 font-medium text-ink group-hover:text-primary-700">
                                                {resource.title}
                                            </p>
                                            <p className="mt-1 text-xs text-muted">{resource.subject?.name ?? 'General'}</p>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </Card>
        </div>
    );
}