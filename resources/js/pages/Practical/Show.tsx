import { Head, Link, router, usePage } from '@inertiajs/react';
import { ExternalLink, FlaskConical, ListOrdered, Star } from 'lucide-react';
import Button from '@/components/ui/Button';
import { Badge, Breadcrumb } from '@/components/ui';
import type { Resource } from '@/types';

type ShowPageProps = {
    resource: Resource;
}

const RESOURCE_MODEL = 'App\\Models\\Resource';

export default function Show() {
    const { resource } = usePage<ShowPageProps>().props;
    const { auth } = usePage().props as unknown as { auth: { user: { id: number } | null } };
    const user = auth.user;
    const practical = resource.practical_resource;
    const steps = practical?.steps ?? [];

    const handleToggle = () => {
        if (!user) return;
        router.post(
            '/bookmarks/toggle',
            { bookmarkable_type: RESOURCE_MODEL, bookmarkable_id: resource.id },
            { preserveScroll: true }
        );
    };

    return (
        <>
            <Head title={resource.title} />
            <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
                <Breadcrumb
                    items={[
                        { label: 'Home', href: '/' },
                        { label: 'Practical & Viva', href: '/practical-viva' },
                        { label: resource.title },
                    ]}
                />

                <div className="mt-6 flex flex-wrap items-start justify-between gap-4">
                    <div>
                        <div className="flex flex-wrap items-center gap-2">
                            {practical?.practical_type && (
                                <Badge color="green">{practical.practical_type.replace(/_/g, ' ')}</Badge>
                            )}
                            {resource.subject && (
                                <Link href={`/subjects/${resource.subject.slug}`}>
                                    <Badge color="blue">{resource.subject.name}</Badge>
                                </Link>
                            )}
                            {resource.semester && <Badge color="neutral">{resource.semester.name}</Badge>}
                        </div>
                        <h1 className="mt-3 text-2xl font-bold text-ink sm:text-3xl">{resource.title}</h1>
                    </div>
                    {user && (
                        <Button variant="secondary" size="sm" onClick={handleToggle}>
                            <Star className="h-4 w-4" />
                            Bookmark
                        </Button>
                    )}
                </div>

                {resource.description && (
                    <p className="mt-5 text-sm leading-relaxed text-muted">{resource.description}</p>
                )}

                {steps.length > 0 && (
                    <section className="card mt-8 p-6">
                        <h2 className="flex items-center gap-2 text-lg font-bold text-ink">
                            <ListOrdered className="h-5 w-5 text-primary-700" />
                            Steps / Procedure
                        </h2>
                        <ol className="mt-4 space-y-3">
                            {steps.map((step, index) => (
                                <li key={index} className="flex gap-3 text-sm text-ink">
                                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary-100 text-xs font-semibold text-primary-700">
                                        {index + 1}
                                    </span>
                                    <span className="leading-relaxed">{step}</span>
                                </li>
                            ))}
                        </ol>
                    </section>
                )}

                {practical?.resource_url && (
                    <a
                        href={practical.resource_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-8 inline-flex items-center gap-2 rounded-lg bg-primary-700 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-primary-800"
                    >
                        <ExternalLink className="h-4 w-4" />
                        Open Linked Resource
                    </a>
                )}

                <div className="mt-6 flex items-center gap-2 text-sm text-muted">
                    <FlaskConical className="h-4 w-4 text-primary-700" />
                    {resource.views_count} views
                </div>

                <p className="mt-8 text-sm text-muted">
                    Report an issue?{' '}
                    <Link href="/contact" className="font-medium text-primary-700 hover:text-primary-800">
                        Contact us
                    </Link>
                </p>
            </div>
        </>
    );
}

