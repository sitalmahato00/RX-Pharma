import { Head, Link, router, usePage } from '@inertiajs/react';
import { BookMarked, Download, ExternalLink, Landmark, Star, User } from 'lucide-react';
import Button from '@/components/ui/Button';
import { Badge, Breadcrumb } from '@/components/ui';
import { formatDate } from '@/lib/utils';
import type { Resource } from '@/types';

type ShowPageProps = {
    resource: Resource;
}

const RESOURCE_MODEL = 'App\\Models\\Resource';

export default function Show() {
    const { resource } = usePage<ShowPageProps>().props;
    const { auth } = usePage().props as unknown as { auth: { user: { id: number } | null } };
    const user = auth.user;
    const lit = resource.literature;

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
                        { label: 'Literature', href: '/literature' },
                        { label: resource.title },
                    ]}
                />

                <div className="mt-6 flex flex-wrap items-start justify-between gap-4">
                    <div>
                        <div className="flex flex-wrap items-center gap-2">
                            {lit?.category ? (
                                <Badge color="purple">{lit.category.replace(/_/g, ' ')}</Badge>
                            ) : null}
                            {resource.subject && (
                                <Link href={`/subjects/${resource.subject.slug}`}>
                                    <Badge color="blue">{resource.subject.name}</Badge>
                                </Link>
                            )}
                            {resource.semester && <Badge color="neutral">{resource.semester.name}</Badge>}
                        </div>
                        <h1 className="mt-3 text-2xl font-bold text-ink sm:text-3xl">{resource.title}</h1>
                        {lit?.author && (
                            <p className="mt-2 flex items-center gap-1.5 text-sm text-muted">
                                <User className="h-4 w-4" />
                                {lit.author}
                            </p>
                        )}
                        {lit?.organization && (
                            <p className="mt-1 flex items-center gap-1.5 text-sm text-muted">
                                <Landmark className="h-4 w-4" />
                                {lit.organization}
                            </p>
                        )}
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

                <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted">
                    {lit?.year && <span>Year: {lit.year}</span>}
                    {resource.published_at && <span>Published {formatDate(resource.published_at)}</span>}
                    <span>{resource.views_count} views</span>
                </div>

                <div className="mt-8 flex flex-wrap gap-3">
                    {lit?.external_url ? (
                        <a
                            href={lit.external_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 rounded-lg bg-primary-700 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-primary-800"
                        >
                            <ExternalLink className="h-4 w-4" />
                            Open External Source
                        </a>
                    ) : (
                        <>
                            <a
                                href={`/files/${resource.id}/stream`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 rounded-lg bg-primary-700 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-primary-800"
                            >
                                <BookMarked className="h-4 w-4" />
                                Read Online
                            </a>
                            <a
                                href={`/files/${resource.id}/download`}
                                className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-ink transition hover:bg-slate-50"
                            >
                                <Download className="h-4 w-4" />
                                Download
                            </a>
                        </>
                    )}
                </div>

                {resource.tags?.length ? (
                    <div className="mt-6 flex flex-wrap gap-2">
                        {resource.tags.map((tag) => (
                            <Badge key={tag.id} color="green" size="sm">
                                #{tag.name}
                            </Badge>
                        ))}
                    </div>
                ) : null}

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

