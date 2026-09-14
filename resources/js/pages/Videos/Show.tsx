import { Head, Link, router, usePage } from '@inertiajs/react';
import { Clock, Download, Eye, Star } from 'lucide-react';
import Button from '@/components/ui/Button';
import { Badge, Breadcrumb } from '@/components/ui';
import { formatDate, formatDuration, formatNumber } from '@/lib/utils';
import type { Resource } from '@/types';

type ShowPageProps = {
    resource: Resource;
}

const RESOURCE_MODEL = 'App\\Models\\Resource';

export default function Show() {
    const { resource } = usePage<ShowPageProps>().props;
    const { auth } = usePage().props as unknown as { auth: { user: { id: number } | null } };
    const user = auth.user;
    const video = resource.video;
    const src = video?.playback_url ?? video?.video_url;

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
            <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
                <Breadcrumb
                    items={[
                        { label: 'Home', href: '/' },
                        { label: 'Videos', href: '/videos' },
                        { label: resource.title },
                    ]}
                />

                {video?.embed_url ? (
                    <div className="mt-6 aspect-video w-full overflow-hidden rounded-xl bg-black shadow-card">
                        <iframe
                            src={video.embed_url}
title={resource.title}
                            className="h-full w-full"
                            style={{ border: 'none' }}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        />
                    </div>
                ) : src ? (
                    <div className="mt-6 overflow-hidden rounded-xl bg-black shadow-card">
                        <video
                            src={src}
                            controls
                            poster={video?.thumbnail_url ?? undefined}
                            className="aspect-video h-auto w-full"
                        />
                    </div>
                ) : null}

                <div className="mt-6 flex flex-wrap items-start justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-ink sm:text-3xl">{resource.title}</h1>
                        <div className="mt-3 flex flex-wrap items-center gap-2">
                            {resource.subject && (
                                <Link href={`/subjects/${resource.subject.slug}`}>
                                    <Badge color="blue">{resource.subject.name}</Badge>
                                </Link>
                            )}
                            {resource.semester && <Badge color="neutral">{resource.semester.name}</Badge>}
                            {resource.tags?.map((tag) => (
                                <Badge key={tag.id} color="green" size="sm">
                                    #{tag.name}
                                </Badge>
                            ))}
                        </div>
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

                <div className="mt-6 flex flex-wrap gap-4 text-sm text-muted">
                    {video?.duration_seconds != null && (
                        <span className="inline-flex items-center gap-1.5">
                            <Clock className="h-4 w-4 text-primary-700" />
                            Duration: {formatDuration(video.duration_seconds)}
                        </span>
                    )}
                    <span className="inline-flex items-center gap-1.5">
                        <Eye className="h-4 w-4 text-primary-700" />
                        {formatNumber(video?.views ?? resource.views_count ?? 0)} views
                    </span>
                    {resource.published_at && <span>Published {formatDate(resource.published_at)}</span>}
                </div>

                {(resource.unit || resource.topic) && (
                    <p className="mt-3 text-sm text-muted">
                        Part of {[resource.unit?.name, resource.topic?.name].filter(Boolean).join(' / ')}
                    </p>
                )}

                {src && (
                    <a
                        href={`/files/${resource.id}/download`}
                        className="mt-8 inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-ink transition hover:bg-slate-50"
                    >
                        <Download className="h-4 w-4" />
                        Download Video
                    </a>
                )}

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


