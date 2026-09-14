import { Head, Link, router, usePage } from '@inertiajs/react';
import { BookOpen, FileText, Layers, PlayCircle } from 'lucide-react';
import { Badge, Breadcrumb, Card, EmptyState, Pagination } from '@/components/ui';
import { cn, formatDate, formatNumber, resourceTypeLabel, resourceTypeRoute, truncate } from '@/lib/utils';
import type { Resource, ResourceType, Unit } from '@/types';

interface Paginated<T> {
    data: T[];
    links: { url: string | null; label: string; active: boolean }[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
}

type ShowPageProps = {
    subject: {
        id: number;
        name: string;
        slug: string;
        code?: string | null;
        description?: string | null;
        color?: string | null;
        resources_count?: number;
    };
    units: (Unit & { topics_count: number })[];
    resources: Paginated<Resource>;
    type: string;
}

const resourceTypes: ResourceType[] = ['note', 'video', 'literature', 'previous_paper', 'practical'];

const typePlural: Record<ResourceType, string> = {
    note: 'Notes',
    video: 'Videos',
    literature: 'Literature',
    previous_paper: 'Previous Papers',
    practical: 'Practical & Viva',
};

export default function Show() {
    const page = usePage<ShowPageProps>();
    const { subject, units, resources, type } = page.props;

    const selectType = (next: string) => {
        router.get(`/subjects/${subject.slug}`, { type: next }, { preserveState: true });
    };

    return (
        <>
            <Head title={subject.name} />
            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <Breadcrumb
                    items={[
                        { label: 'Home', href: '/' },
                        { label: 'Subjects', href: '/subjects' },
                        { label: subject.name },
                    ]}
                />

                <section className="card mt-4 p-6">
                    <div className="flex flex-wrap items-center gap-3">
                        <span
                            className="h-4 w-4 rounded-full"
                            style={{ backgroundColor: subject.color ?? '#0b63ce' }}
                        />
                        <h1 className="text-2xl font-bold text-ink sm:text-3xl">{subject.name}</h1>
                        {subject.code && <Badge color="neutral">{subject.code}</Badge>}
                        <Badge color="blue">{formatNumber(subject.resources_count ?? 0)} resources</Badge>
                    </div>
                    {subject.description && (
                        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted">{subject.description}</p>
                    )}
                </section>

                <div className="mt-6 flex flex-wrap gap-2">
                    <span className="self-center text-sm font-medium text-muted">Filter by type:</span>
                    {resourceTypes.map((rt) => (
                        <button
                            key={rt}
                            type="button"
                            onClick={() => selectType(rt)}
                            className={cn(
                                'rounded-full border px-3.5 py-1.5 text-sm font-medium transition',
                                type === rt
                                    ? 'border-primary-700 bg-primary-700 text-white'
                                    : 'border-slate-300 bg-white text-slate-600 hover:bg-slate-50'
                            )}
                        >
                            {resourceTypeLabel(rt)}
                        </button>
                    ))}
                </div>

                <section className="mt-8">
                    <h2 className="flex items-center gap-2 text-xl font-bold text-ink">
                        <Layers className="h-5 w-5 text-primary-700" />
                        Units &amp; Topics
                    </h2>
                    {units.length === 0 ? (
                        <div className="mt-4">
                            <EmptyState icon={Layers} title="No units yet" description="Units will appear here once added." />
                        </div>
                    ) : (
                        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {units.map((unit) => (
                                <Card key={unit.id} className="p-5">
                                    <h3 className="font-semibold text-ink">{unit.name}</h3>
                                    {unit.description && (
                                        <p className="mt-1 line-clamp-2 text-sm text-muted">{unit.description}</p>
                                    )}
                                    <p className="mt-3 text-sm font-medium text-primary-700">
                                        {formatNumber(unit.topics_count ?? 0)} topics
                                    </p>
                                </Card>
                            ))}
                        </div>
                    )}
                </section>

                <h2 className="mt-10 flex items-center gap-2 text-xl font-bold text-ink">
                    <BookOpen className="h-5 w-5 text-primary-700" />
                    {typePlural[type as ResourceType]}
                </h2>
                {resources.data.length === 0 ? (
                    <div className="mt-4">
                        <EmptyState
                            icon={type === 'video' ? PlayCircle : FileText}
                            title={`No ${typePlural[type as ResourceType].toLowerCase()} found`}
                            description="Try another type."
                        />
                    </div>
                ) : (
                    <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {resources.data.map((resource) => (
                            <Link
                                key={resource.id}
                                href={`/${resourceTypeRoute(resource.resource_type)}/${resource.slug}`}
                                className="block"
                            >
                                <Card hoverable className="h-full p-5">
                                    <div className="flex items-start justify-between gap-3">
                                        <h3 className="font-semibold text-ink">{resource.title}</h3>
                                        <Badge color="blue" size="sm">
                                            {resourceTypeLabel(resource.resource_type)}
                                        </Badge>
                                    </div>
                                    {resource.description && (
                                        <p className="mt-2 line-clamp-2 text-sm text-muted">{truncate(resource.description, 110)}</p>
                                    )}
                                    {(resource.unit || resource.topic) && (
                                        <p className="mt-2 text-xs text-muted">
                                            {[resource.unit?.name, resource.topic?.name].filter(Boolean).join(' / ')}
                                        </p>
                                    )}
                                    <p className="mt-3 text-xs text-muted">
                                        {resource.published_at ? formatDate(resource.published_at) : 'Unpublished'} ·{' '}
                                        {formatNumber(resource.views_count ?? 0)} views
                                    </p>
                                </Card>
                            </Link>
                        ))}
                    </div>
                )}
                {resources.data.length > 0 && (
                    <div className="mt-8 flex justify-center">
                        <Pagination links={resources.links} />
                    </div>
                )}
            </div>
        </>
    );
}
