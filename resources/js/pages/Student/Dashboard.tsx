import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    GraduationCap,
    ArrowRight,
    BookOpen,
    Bookmark,
    CheckCircle2,
    ClipboardList,
    FileText,
    FlaskConical,
    Library,
    PlayCircle,
    Target,
    TrendingUp,
    Trophy,
    type LucideIcon,
} from 'lucide-react';
import { Alert, Badge, Button, Card, EmptyState, ProgressBar, StatCard, type BadgeColor, type StatAccent } from '@/components/ui';
import { cn, formatNumber, resourceTypeLabel, resourceTypeRoute, timeAgo } from '@/lib/utils';
import type { Quiz, Resource } from '@/types';

interface DashboardUser {
    name: string;
    firstName: string;
    avatar: string | null;
    email: string;
}

interface QuickLink {
    label: string;
    description: string;
    route: string;
    icon: string;
}

interface ProgressItem {
    id: number;
    resource: Resource | Quiz;
    progress_percent: number;
    status: string;
    updated_at: string;
}

interface SubjectProgressItem {
    subject_id: number;
    subject_name: string;
    average_progress: number;
}

interface RecentViewItem {
    viewable: Resource | Quiz;
    viewed_at: string;
}

interface DashboardProps {
    user: DashboardUser;
    continueLearning: ProgressItem[];
    stats: Record<string, number>;
    quickLinks: QuickLink[];
    overallProgress: number;
    totalCompleted: number;
    subjectProgress: SubjectProgressItem[];
    recentViewed: RecentViewItem[];
    bookmarksCount: number;
    quizStats: { attempts: number; average_score: number };
    recommended: Resource[];
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

function resourceTitle(item: Resource | Quiz): string {
    return item.title;
}

function resourceSubject(item: Resource | Quiz): string | undefined {
    return item.subject?.name;
}

const quickRouteMap: Record<string, string> = {
    'notes.index': '/notes',
    'videos.index': '/videos',
    'literature.index': '/literature',
    'previous-papers.index': '/previous-papers',
    'quizzes.index': '/quizzes',
    'practical.index': '/practical-viva',
};

const quickIconMap: Record<string, LucideIcon> = {
    'document-text': FileText,
    'play-circle': PlayCircle,
    'book-open': BookOpen,
    'clipboard-document-list': ClipboardList,
    'academic-cap': GraduationCap,
    beaker: FlaskConical,
};

const typeBadgeColor: Record<string, BadgeColor> = {
    note: 'blue',
    video: 'orange',
    literature: 'purple',
    previous_paper: 'amber',
    practical: 'green',
    quiz: 'red',
};

export default function Dashboard(props: DashboardProps) {
    const { flash } = usePage<{ flash?: { success?: string; error?: string; warning?: string } }>().props;
    const {
        user,
        continueLearning,
        stats,
        quickLinks,
        overallProgress,
        totalCompleted,
        subjectProgress,
        recentViewed,
        bookmarksCount,
        quizStats,
        recommended,
    } = props;

    function handleMarkComplete(item: ProgressItem) {
        router.post(
            '/progress/mark-complete',
            {
                progressable_type: isQuiz(item.resource) ? QUIZ_CLASS : RESOURCE_CLASS,
                progressable_id: item.resource.id,
            },
            { preserveScroll: true }
        );
    }

    const statCards: { key: string; label: string; icon: LucideIcon; accent: StatAccent }[] = [
        { key: 'note', label: 'Notes', icon: FileText, accent: 'primary' },
        { key: 'video', label: 'Videos', icon: PlayCircle, accent: 'orange' },
        { key: 'literature', label: 'Literature', icon: Library, accent: 'purple' },
        { key: 'previous_paper', label: 'Previous Papers', icon: ClipboardList, accent: 'amber' },
        { key: 'practical', label: 'Practical & Viva', icon: FlaskConical, accent: 'green' },
        { key: 'quizzes', label: 'Quizzes', icon: GraduationCap, accent: 'red' },
    ];

    return (
        <div className="space-y-6">
            <Head title="Dashboard" />

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

            <section className="card relative overflow-hidden p-6 sm:p-8">
                <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <p className="text-sm font-medium text-primary-700">Student Portal</p>
                        <h1 className="mt-1 text-2xl font-bold text-ink sm:text-3xl">Welcome back, {user.firstName}</h1>
                        <p className="mt-1 text-sm text-muted">Pick up where you left off and keep building your knowledge.</p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                        <Button variant="secondary" href="/my-bookmarks">
                            <Bookmark className="h-4 w-4" />
                            Bookmarks
                        </Button>
                        <Button href="/quizzes">
                            <GraduationCap className="h-4 w-4" />
                            Practice quiz
                        </Button>
                    </div>
                </div>
            </section>

            <section className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
                {statCards.map((card) => (
                    <StatCard
                        key={card.key}
                        icon={card.icon}
                        label={card.label}
                        value={formatNumber(stats[card.key] ?? 0)}
                        accent={card.accent}
                    />
                ))}
            </section>

            <div className="grid gap-6 lg:grid-cols-3">
                <div className="space-y-6 lg:col-span-2">
                    <Card className="p-6">
                        <div className="mb-4 flex items-center justify-between">
                            <div>
                                <h2 className="flex items-center gap-2 font-semibold text-ink">
                                    <TrendingUp className="h-5 w-5 text-primary-600" />
                                    Continue learning
                                </h2>
                                <p className="mt-0.5 text-xs text-muted">Resources you have started but not finished.</p>
                            </div>
                            <Button size="sm" variant="ghost" href="/my-learning">
                                View all
                                <ArrowRight className="h-4 w-4" />
                            </Button>
                        </div>

                        {continueLearning.length === 0 ? (
                            <EmptyState
                                icon={BookOpen}
                                title="Nothing in progress"
                                description="Start exploring resources or take a quiz to build your progress."
                                action={
                                    <Button size="sm" href="/my-learning">
                                        Explore learning
                                    </Button>
                                }
                            />
                        ) : (
                            <div className="space-y-3">
                                {continueLearning.map((item) => (
                                    <div key={item.id} className="rounded-lg border border-slate-200 p-4">
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="min-w-0">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <Badge size="sm" color={typeBadgeColor[resourceType(item.resource)]}>
                                                        {resourceTypeLabel(resourceType(item.resource))}
                                                    </Badge>
                                                    {resourceSubject(item.resource) && (
                                                        <span className="text-xs text-muted">{resourceSubject(item.resource)}</span>
                                                    )}
                                                </div>
                                                <Link
                                                    href={resourcePath(item.resource)}
                                                    className="mt-2 block truncate font-semibold text-ink transition hover:text-primary-700"
                                                >
                                                    {resourceTitle(item.resource)}
                                                </Link>
                                                <div className="mt-3 max-w-sm">
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

                    {recommended.length > 0 && (
                        <Card className="p-6">
                            <h2 className="mb-4 flex items-center gap-2 font-semibold text-ink">
                                <Target className="h-5 w-5 text-primary-600" />
                                Recommended for you
                            </h2>
                            <div className="grid gap-3 sm:grid-cols-2">
                                {recommended.map((item) => (
                                    <Link
                                        key={item.id}
                                        href={resourcePath(item)}
                                        className="group rounded-lg border border-slate-200 p-4 transition hover:border-primary-200 hover:bg-primary-50/40"
                                    >
                                        <Badge size="sm" color={typeBadgeColor[item.resource_type]}>
                                            {resourceTypeLabel(item.resource_type)}
                                        </Badge>
                                        <p className="mt-2 line-clamp-2 font-medium text-ink group-hover:text-primary-700">
                                            {item.title}
                                        </p>
                                        <p className="mt-1 text-xs text-muted">{item.subject?.name ?? 'General'}</p>
                                    </Link>
                                ))}
                            </div>
                        </Card>
                    )}

                    <Card className="p-6">
                        <h2 className="mb-4 font-semibold text-ink">Recently viewed</h2>
                        {recentViewed.length === 0 ? (
                            <EmptyState icon={BookOpen} title="No recent views" description="Resources you open will show up here." />
                        ) : (
                            <div className="divide-y divide-slate-100">
                                {recentViewed.map((view, index) => (
                                    <Link
                                        key={index}
                                        href={resourcePath(view.viewable)}
                                        className="flex items-center justify-between gap-3 py-3 transition hover:bg-slate-50"
                                    >
                                        <div className="flex min-w-0 items-center gap-3">
                                            <Badge size="sm" color={typeBadgeColor[resourceType(view.viewable)]}>
                                                {resourceTypeLabel(resourceType(view.viewable))}
                                            </Badge>
                                            <p className="truncate text-sm font-medium text-ink">{resourceTitle(view.viewable)}</p>
                                        </div>
                                        <span className="shrink-0 text-xs text-muted">{timeAgo(view.viewed_at)}</span>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </Card>
                </div>

                <div className="space-y-6">
                    <Card className="p-6">
                        <div className="flex items-center justify-between">
                            <p className="text-sm font-semibold text-ink">Overall progress</p>
                            <Badge color="blue">{overallProgress}%</Badge>
                        </div>
                        <div className="mt-4">
                            <ProgressBar value={overallProgress} showLabel />
                        </div>
                        <div className="mt-5 grid grid-cols-2 gap-3">
                            <div className="rounded-lg bg-green-50 p-3">
                                <p className="flex items-center gap-1.5 text-xs font-medium text-green-700">
                                    <CheckCircle2 className="h-4 w-4" />
                                    Completed
                                </p>
                                <p className="mt-1 text-xl font-bold text-green-800">{totalCompleted}</p>
                            </div>
                            <div className="rounded-lg bg-primary-50 p-3">
                                <p className="flex items-center gap-1.5 text-xs font-medium text-primary-700">
                                    <Trophy className="h-4 w-4" />
                                    Avg quiz score
                                </p>
                                <p className="mt-1 text-xl font-bold text-primary-800">{quizStats.average_score}%</p>
                            </div>
                        </div>
                    </Card>

                    <Card className="p-6">
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="font-semibold text-ink">Subject progress</h2>
                            <Button size="sm" variant="ghost" href="/my-progress">
                                Details
                            </Button>
                        </div>
                        {subjectProgress.length === 0 ? (
                            <p className="text-sm text-muted">No subject progress yet.</p>
                        ) : (
                            <div className="space-y-4">
                                {subjectProgress.slice(0, 5).map((subject) => (
                                    <div key={subject.subject_id}>
                                        <div className="mb-1 flex items-center justify-between gap-3">
                                            <span className="truncate text-sm font-medium text-ink">{subject.subject_name}</span>
                                            <span className="shrink-0 text-xs font-medium text-muted">{subject.average_progress}%</span>
                                        </div>
                                        <ProgressBar value={subject.average_progress} size="sm" />
                                    </div>
                                ))}
                            </div>
                        )}
                    </Card>

                    <Card className="p-6">
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="font-semibold text-ink">Quick links</h2>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            {quickLinks.map((link) => {
                                const href = quickRouteMap[link.route] ?? link.route;
                                const Icon = quickIconMap[link.icon] ?? ArrowRight;
                                return (
                                    <Link
                                        key={link.route}
                                        href={href}
                                        className={cn(
                                            'flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2.5 text-sm font-medium text-ink transition',
                                            'hover:border-primary-200 hover:bg-primary-50/40 hover:text-primary-700'
                                        )}
                                    >
                                        <Icon className="h-4 w-4 shrink-0 text-primary-600" />
                                        <span className="truncate">{link.label}</span>
                                    </Link>
                                );
                            })}
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}