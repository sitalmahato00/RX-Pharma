import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    ArrowRight,
    BookOpen,
    Building2,
    FileText,
    FlaskConical,
    GraduationCap,
    Library,
    PlayCircle,
    Search,
    Video,
} from 'lucide-react';
import { type FormEvent, useState } from 'react';
import { Badge, Card, StatCard } from '@/components/ui';
import { cn, formatNumber, resourceTypeLabel, resourceTypeRoute, timeAgo } from '@/lib/utils';
import type { Resource, Subject, University } from '@/types';

interface HomePageProps {
    stats: {
        notes: number;
        videos: number;
        mcqs: number;
        literature: number;
        papers: number;
        practical: number;
    };
    subjects: Subject[];
    latestResources: Resource[];
    universities: University[];
    userProgress: Subject[] | null;
    recentResources: Resource[];
}

const resourceBadgeColor: Record<string, string> = {
    note: 'blue',
    video: 'purple',
    literature: 'green',
    previous_paper: 'amber',
    practical: 'orange',
};

const resourceIcon: Record<string, typeof FileText> = {
    note: FileText,
    video: Video,
    literature: Library,
    previous_paper: BookOpen,
    practical: FlaskConical,
};

function HeroSearch() {
    const [q, setQ] = useState('');

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const query = q.trim();
        if (query) router.visit('/search?q=' + encodeURIComponent(query));
    };

    return (
        <form onSubmit={handleSubmit} role="search" className="mx-auto mt-8 flex w-full max-w-xl items-center gap-2 rounded-xl bg-white p-2 shadow-lg">
            <Search className="ml-3 h-5 w-5 shrink-0 text-slate-400" aria-hidden="true" />
            <input
                type="search"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search notes, videos, literature, MCQs, papers..."
                aria-label="Search resources"
                className="w-full bg-transparent text-sm text-ink outline-none placeholder:text-slate-400"
            />
            <button
                type="submit"
                className="shrink-0 rounded-lg bg-primary-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-primary-800"
            >
                Search
            </button>
        </form>
    );
}

function ResourceRow({ resource }: { resource: Resource }) {
    const Icon = resourceIcon[resource.resource_type] ?? FileText;
    const badgeColor = (resourceBadgeColor[resource.resource_type] ?? 'neutral') as 'blue' | 'green' | 'orange' | 'amber' | 'purple' | 'neutral';
    const base = resourceTypeRoute(resource.resource_type);

    return (
        <Link
            href={`/${base}/${resource.slug}`}
            className="group flex items-start gap-3 rounded-lg border border-slate-200 bg-white p-4 transition hover:border-primary-200 hover:shadow-card-hover"
        >
            <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500 transition group-hover:bg-primary-50 group-hover:text-primary-600">
                <Icon className="h-4 w-4" aria-hidden="true" />
            </div>
            <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                    <Badge color={badgeColor} size="sm">
                        {resourceTypeLabel(resource.resource_type)}
                    </Badge>
                    <span className="text-xs text-slate-400">{timeAgo(resource.published_at)}</span>
                </div>
                <p className="mt-1.5 font-medium text-ink transition group-hover:text-primary-700">{resource.title}</p>
                <p className="mt-0.5 truncate text-xs text-muted">
                    {resource.subject?.name}
                    {resource.semester ? ` • ${resource.semester.name}` : ''}
                </p>
            </div>
            <ArrowRight className="mt-2 h-4 w-4 shrink-0 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-primary-600" aria-hidden="true" />
        </Link>
    );
}

function ResourceCard({ resource, index }: { resource: Resource; index: number }) {
    const Icon = resourceIcon[resource.resource_type] ?? FileText;
    const badgeColor = (resourceBadgeColor[resource.resource_type] ?? 'neutral') as 'blue' | 'green' | 'orange' | 'amber' | 'purple' | 'neutral';
    const base = resourceTypeRoute(resource.resource_type);

    return (
        <Link
            href={`/${base}/${resource.slug}`}
            className="group relative flex flex-col rounded-xl border border-slate-200 bg-white p-5 transition hover:-translate-y-0.5 hover:border-primary-200 hover:shadow-card-hover"
        >
            <span className="pointer-events-none absolute right-4 top-4 text-4xl font-bold text-slate-100 transition group-hover:text-primary-50">
                {String(index + 1).padStart(2, '0')}
            </span>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-50 text-primary-600">
                <Icon className="h-5 w-5" aria-hidden="true" />
            </div>
            <div className="mt-3">
                <Badge color={badgeColor} size="sm">
                    {resourceTypeLabel(resource.resource_type)}
                </Badge>
            </div>
            <p className="mt-2.5 font-medium text-ink transition group-hover:text-primary-700">{resource.title}</p>
            <p className="mt-1 text-xs text-muted">
                {resource.subject?.name}
                {resource.semester ? ` • ${resource.semester.name}` : ''}
            </p>
            <div className="mt-auto pt-4">
                <span className="text-xs font-medium text-primary-700">View resource</span>
            </div>
        </Link>
    );
}

export default function Home({
    stats,
    subjects,
    latestResources,
    universities,
    userProgress,
    recentResources,
}: HomePageProps) {
    const { app, auth } = usePage<{ app: { name: string; tagline: string }; auth: { user: { id: number } | null } }>().props;

    const statItems = [
        { icon: FileText, label: 'Notes', value: formatNumber(stats.notes), accent: 'primary' as const },
        { icon: Video, label: 'Videos', value: formatNumber(stats.videos), accent: 'purple' as const },
        { icon: PlayCircle, label: 'MCQs', value: formatNumber(stats.mcqs), accent: 'amber' as const },
        { icon: Library, label: 'Literature', value: formatNumber(stats.literature), accent: 'green' as const },
        { icon: BookOpen, label: 'Previous Papers', value: formatNumber(stats.papers), accent: 'orange' as const },
        { icon: FlaskConical, label: 'Practical & Viva', value: formatNumber(stats.practical), accent: 'red' as const },
    ];

    return (
        <>
            <Head title="Home" />

            <section className="bg-gradient-to-r from-primary-800 to-primary-600">
                <div className="mx-auto max-w-7xl px-4 py-16 text-center sm:px-6 sm:py-20 lg:px-8">
                    <h1 className="mx-auto max-w-3xl text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
                        {app.name}
                    </h1>
                    <p className="mx-auto mt-4 max-w-2xl text-base text-primary-100 sm:text-lg">
                        {app.tagline} Explore notes, videos, MCQs, literature and previous papers for pharmacy students.
                    </p>
                    <HeroSearch />
                    <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
                        {statItems.map((item) => (
                            <StatCard key={item.label} icon={item.icon} label={item.label} value={item.value} accent={item.accent} className="bg-white/10 border-white/15" />
                        ))}
                    </div>
                </div>
            </section>

            <div className="mx-auto max-w-7xl space-y-16 px-4 py-12 sm:px-6 lg:px-8">
                {auth.user && userProgress && userProgress.length > 0 && (
                    <section>
                        <Card className="border-primary-200 bg-primary-50/50 p-5 sm:p-6">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                                <div>
                                    <h2 className="font-semibold text-ink">Your progress</h2>
                                    <p className="text-sm text-muted">You are learning across {userProgress.length} subject{userProgress.length > 1 ? 's' : ''}.</p>
                                </div>
                                <Link href="/my-progress" className="text-sm font-medium text-primary-700 hover:text-primary-800">
                                    View progress →
                                </Link>
                            </div>
                            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                                {userProgress.map((subject) => (
                                    <Link
                                        key={subject.id}
                                        href={`/subjects/${subject.slug}`}
                                        className="rounded-lg border border-primary-200 bg-white p-3 text-center transition hover:border-primary-300 hover:shadow-card-hover"
                                    >
                                        <p className="text-sm font-medium text-ink">{subject.name}</p>
                                        <p className="mt-0.5 text-xs text-muted">
                                            {subject.resources_count ?? 0} resource{subject.resources_count === 1 ? '' : 's'}
                                        </p>
                                    </Link>
                                ))}
                            </div>
                        </Card>
                    </section>
                )}

                <section>
                    <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                        <div>
                            <h2 className="text-xl font-bold text-ink">Browse universities</h2>
                            <p className="text-sm text-muted">Explore learning material grouped by your institution.</p>
                        </div>
                        <Link href="/universities" className="text-sm font-medium text-primary-700 hover:text-primary-800">
                            View all →
                        </Link>
                    </div>
                    <div className="flex flex-wrap gap-2.5">
                        {universities.map((u) => (
                            <Link
                                key={u.id}
                                href={`/universities/${u.slug}`}
                                className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-ink transition hover:border-primary-300 hover:bg-primary-50 hover:text-primary-700"
                            >
                                <Building2 className="h-4 w-4 text-slate-400" aria-hidden="true" />
                                {u.name}
                                <span className="text-xs text-slate-400">
                                    {u.colleges_count ?? 0} college{u.colleges_count === 1 ? '' : 's'}
                                </span>
                            </Link>
                        ))}
                    </div>
                </section>

                <section>
                    <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                        <div>
                            <h2 className="text-xl font-bold text-ink">Popular subjects</h2>
                            <p className="text-sm text-muted">Most-studied subjects across the platform.</p>
                        </div>
                        <Link href="/subjects" className="text-sm font-medium text-primary-700 hover:text-primary-800">
                            Browse all →
                        </Link>
                    </div>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        {subjects.map((subject) => (
                            <Link key={subject.id} href={`/subjects/${subject.slug}`} className="group">
                                <Card hoverable className="h-full p-5">
                                    <div
                                        className={cn(
                                            'flex h-10 w-10 items-center justify-center rounded-lg',
                                            subject.color
                                                ? 'text-white'
                                                : 'bg-primary-50 text-primary-600'
                                        )}
                                        style={subject.color ? { backgroundColor: subject.color } : undefined}
                                    >
                                        <GraduationCap className="h-5 w-5" aria-hidden="true" />
                                    </div>
                                    <p className="mt-3 font-medium text-ink transition group-hover:text-primary-700">{subject.name}</p>
                                    <div className="mt-1 flex items-center gap-2 text-xs text-muted">
                                        {subject.code && (
                                            <>
                                                <span className="rounded bg-slate-100 px-1.5 py-0.5 font-medium text-slate-500">{subject.code}</span>
                                                <span className="text-slate-300">•</span>
                                            </>
                                        )}
                                        <span>
                                            {formatNumber(subject.resources_count ?? 0)} resource{subject.resources_count === 1 ? '' : 's'}
                                        </span>
                                    </div>
                                </Card>
                            </Link>
                        ))}
                    </div>
                </section>

                <section>
                    <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                        <div>
                            <h2 className="text-xl font-bold text-ink">Latest resources</h2>
                            <p className="text-sm text-muted">Freshly published notes, videos and more.</p>
                        </div>
                        <Link href="/notes" className="text-sm font-medium text-primary-700 hover:text-primary-800">
                            Browse resources →
                        </Link>
                    </div>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {latestResources.slice(0, 6).map((resource, i) => (
                            <ResourceCard key={resource.id} resource={resource} index={i} />
                        ))}
                    </div>
                </section>

                {auth.user && recentResources.length > 0 && (
                    <section>
                        <div className="mb-4">
                            <h2 className="text-xl font-bold text-ink">Continue learning</h2>
                            <p className="text-sm text-muted">Pick up where you left off.</p>
                        </div>
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            {recentResources.map((resource) => (
                                <ResourceRow key={resource.id} resource={resource} />
                            ))}
                        </div>
                    </section>
                )}
            </div>
        </>
    );
}