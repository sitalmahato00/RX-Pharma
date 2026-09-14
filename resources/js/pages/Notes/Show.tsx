import { Head, Link, router, usePage } from '@inertiajs/react';
import { BookOpen, CheckCircle2, Download, Eye, FileText, ListOrdered, Star } from 'lucide-react';
import Button from '@/components/ui/Button';
import { Avatar, Badge, Breadcrumb } from '@/components/ui';
import { formatNumber } from '@/lib/utils';
import type { Resource } from '@/types';

type ShowPageProps = {
    resource: Resource;
}

const RESOURCE_MODEL = 'App\\Models\\Resource';

function formatSize(bytes?: number | null): string {
    if (!bytes) return '—';
    if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${Math.round(bytes / 1024)} KB`;
}

export default function Show() {
    const { resource } = usePage<ShowPageProps>().props;
    const { auth } = usePage().props as unknown as { auth: { user: { id: number } | null } };
    const user = auth.user;
    const note = resource.note;

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
                        { label: 'Notes', href: '/notes' },
                        { label: resource.title },
                    ]}
                />

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

                <div className="mt-6 flex flex-wrap gap-3">
                    <a
                        href={`/files/${resource.id}/stream`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 rounded-lg bg-primary-700 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-primary-800"
                    >
                        <BookOpen className="h-4 w-4" />
                        Read Online
                    </a>
                    <a
                        href={`/files/${resource.id}/download`}
                        className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-ink transition hover:bg-slate-50"
                    >
                        <Download className="h-4 w-4" />
                        Download
                    </a>
                </div>

                <section className="mt-8 grid gap-4 sm:grid-cols-3">
                    <div className="card p-4 text-center">
                        <Eye className="mx-auto h-5 w-5 text-primary-700" />
                        <p className="mt-2 text-lg font-semibold text-ink">{formatNumber(resource.views_count)}</p>
                        <p className="text-xs text-muted">Views</p>
                    </div>
                    <div className="card p-4 text-center">
                        <FileText className="mx-auto h-5 w-5 text-primary-700" />
                        <p className="mt-2 text-lg font-semibold text-ink">{note?.pages ?? '—'}</p>
                        <p className="text-xs text-muted">Pages</p>
                    </div>
                    <div className="card p-4 text-center">
                        <Download className="mx-auto h-5 w-5 text-primary-700" />
                        <p className="mt-2 text-lg font-semibold text-ink">{formatSize(note?.file_size)}</p>
                        <p className="text-xs text-muted">File size</p>
                    </div>
                </section>

                {resource.note?.author && (
                    <div className="mt-6 flex items-center gap-3">
                        <Avatar name={resource.note.author} size="sm" />
                        <p className="text-sm text-muted">
                            Compiled by <span className="font-medium text-ink">{resource.note.author}</span>
                        </p>
                    </div>
                )}

                {note?.toc && note.toc.length > 0 && (
                    <section className="card mt-8 p-6">
                        <h2 className="flex items-center gap-2 text-lg font-bold text-ink">
                            <ListOrdered className="h-5 w-5 text-primary-700" />
                            Table of Contents
                        </h2>
                        <ol className="mt-4 space-y-2">
                            {note.toc.map((item, index) => (
                                <li key={index} className="flex items-center gap-3 text-sm text-ink">
                                    <CheckCircle2 className="h-4 w-4 shrink-0 text-primary-500" />
                                    <span>{item.title}</span>
                                    {item.page != null && <span className="ml-auto text-xs text-muted">p. {item.page}</span>}
                                </li>
                            ))}
                        </ol>
                    </section>
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

