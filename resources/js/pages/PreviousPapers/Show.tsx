import { Head, Link, router, usePage } from '@inertiajs/react';
import { Calendar, CheckCircle2, Download, FileText, Star } from 'lucide-react';
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
    const paper = resource.previous_paper;

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
                        { label: 'Previous Papers', href: '/previous-papers' },
                        { label: resource.title },
                    ]}
                />

                <div className="mt-6 flex flex-wrap items-start justify-between gap-4">
                    <div>
                        <div className="flex flex-wrap items-center gap-2">
                            {paper?.year && <Badge color="orange">{paper.year}</Badge>}
                            {paper?.exam_type && <Badge color="neutral">{paper.exam_type}</Badge>}
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

                <div className="mt-5 flex flex-wrap gap-4 text-sm text-muted">
                    <span className="inline-flex items-center gap-1.5">
                        <Calendar className="h-4 w-4 text-primary-700" />
                        Year: {paper?.year}
                    </span>
                    {paper?.exam_type && <span>Exam: {paper.exam_type}</span>}
                    {resource.published_at && <span>Published {formatDate(resource.published_at)}</span>}
                    <span>{resource.views_count} views</span>
                </div>

                {paper?.has_answer_key && (
                    <div className="mt-4 inline-flex items-center gap-2 rounded-lg bg-green-50 px-3 py-2 text-sm text-green-800">
                        <CheckCircle2 className="h-4 w-4" />
                        Answer key included
                    </div>
                )}

                <div className="mt-8 flex flex-wrap gap-3">
                    <a
                        href={`/files/${resource.id}/stream`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 rounded-lg bg-primary-700 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-primary-800"
                    >
                        <FileText className="h-4 w-4" />
                        View Paper
                    </a>
                    <a
                        href={`/files/${resource.id}/download`}
                        className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-ink transition hover:bg-slate-50"
                    >
                        <Download className="h-4 w-4" />
                        Download
                    </a>
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

