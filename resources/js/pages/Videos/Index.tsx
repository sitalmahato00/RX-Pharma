import { Head, Link, router, usePage } from '@inertiajs/react';
import { PlayCircle, Video } from 'lucide-react';
import { useState } from 'react';
import { Badge, Breadcrumb, Card, EmptyState, Pagination, Select } from '@/components/ui';
import { formatDuration, formatNumber } from '@/lib/utils';
import type { Resource } from '@/types';

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

interface SubjectOption {
    id: number;
    name: string;
}

interface SemesterOption {
    id: number;
    name: string;
    number: number;
}

type IndexPageProps = {
    resources: Paginated<Resource>;
    subjects: SubjectOption[];
    semesters: SemesterOption[];
    filters: { subject_id?: string; semester_id?: string };
}

export default function Index() {
    const { resources, subjects, semesters, filters } = usePage<IndexPageProps>().props;
    const [subjectId, setSubjectId] = useState(filters.subject_id ?? '');
    const [semesterId, setSemesterId] = useState(filters.semester_id ?? '');

    const applyFilters = (nextSubject: string, nextSemester: string) => {
        const params: Record<string, string> = {};
        if (nextSubject) params.subject_id = nextSubject;
        if (nextSemester) params.semester_id = nextSemester;
        router.get('/videos', params, { preserveState: true });
    };

    return (
        <>
            <Head title="Videos" />
            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Videos' }]} />
                <header className="mt-4 flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-100 text-primary-700">
                        <Video className="h-5 w-5" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-ink">Videos</h1>
                        <p className="text-sm text-muted">{formatNumber(resources.total)} videos</p>
                    </div>
                </header>

                {(subjects.length > 0 || semesters.length > 0) && (
                    <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:max-w-xl">
                        {subjects.length > 0 && (
                            <Select
                                label="Subject"
                                value={subjectId}
                                onChange={(e) => {
                                    setSubjectId(e.target.value);
                                    applyFilters(e.target.value, semesterId);
                                }}
                            >
                                <option value="">All subjects</option>
                                {subjects.map((subject) => (
                                    <option key={subject.id} value={String(subject.id)}>
                                        {subject.name}
                                    </option>
                                ))}
                            </Select>
                        )}
                        {semesters.length > 0 && (
                            <Select
                                label="Semester"
                                value={semesterId}
                                onChange={(e) => {
                                    setSemesterId(e.target.value);
                                    applyFilters(subjectId, e.target.value);
                                }}
                            >
                                <option value="">All semesters</option>
                                {semesters.map((semester) => (
                                    <option key={semester.id} value={String(semester.id)}>
                                        {semester.name}
                                    </option>
                                ))}
                            </Select>
                        )}
                    </div>
                )}

                {resources.data.length === 0 ? (
                    <div className="mt-8">
                        <EmptyState icon={Video} title="No videos found" description="Try adjusting the filters." />
                    </div>
                ) : (
                    <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                        {resources.data.map((resource) => {
                            const video = resource.video;
                            const thumbnail = video?.thumbnail_url ?? video?.thumbnail ?? null;
                            return (
                                <Link key={resource.id} href={`/videos/${resource.slug}`} className="block">
                                    <Card hoverable className="h-full overflow-hidden">
                                        <div className="relative">
                                            {thumbnail ? (
                                                <img
                                                    src={thumbnail}
                                                    alt={resource.title}
                                                    className="aspect-video w-full bg-slate-100 object-cover"
                                                    loading="lazy"
                                                />
                                            ) : (
                                                <div className="flex aspect-video w-full items-center justify-center bg-primary-50 text-primary-300">
                                                    <Video className="h-10 w-10" />
                                                </div>
                                            )}
                                            <span className="absolute bottom-2 right-2 inline-flex items-center gap-1 rounded-md bg-black/70 px-2 py-0.5 text-xs font-medium text-white">
                                                <PlayCircle className="h-3 w-3" />
                                                {video?.duration_seconds ? formatDuration(video.duration_seconds) : (video?.duration_label ?? '—')}
                                            </span>
                                        </div>
                                        <div className="p-5">
                                            {resource.subject && (
                                                <Badge color="blue" size="sm">
                                                    {resource.subject.name}
                                                </Badge>
                                            )}
                                            <h2 className="mt-3 font-semibold text-ink">{resource.title}</h2>
                                            {resource.description && (
                                                <p className="mt-1 line-clamp-2 text-sm text-muted">{resource.description}</p>
                                            )}
                                            <p className="mt-3 text-xs text-muted">
                                                {formatNumber(video?.views ?? resource.views_count ?? 0)} views ·{' '}
                                                {formatNumber(resource.bookmarks_count ?? 0)} bookmarks
                                            </p>
                                        </div>
                                    </Card>
                                </Link>
                            );
                        })}
                    </div>
                )}

                <div className="mt-8 flex justify-center">
                    <Pagination links={resources.links} />
                </div>
            </div>
        </>
    );
}
