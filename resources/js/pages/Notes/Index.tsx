import { Head, Link, router, usePage } from '@inertiajs/react';
import { BookOpen, FileText } from 'lucide-react';
import { useState } from 'react';
import { Badge, Breadcrumb, Card, EmptyState, Pagination, Select } from '@/components/ui';
import { formatNumber, truncate } from '@/lib/utils';
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

function formatSize(bytes?: number | null): string {
    if (!bytes) return '';
    if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${Math.round(bytes / 1024)} KB`;
}

export default function Index() {
    const { resources, subjects, semesters, filters } = usePage<IndexPageProps>().props;
    const [subjectId, setSubjectId] = useState(filters.subject_id ?? '');
    const [semesterId, setSemesterId] = useState(filters.semester_id ?? '');

    const applyFilters = (nextSubject: string, nextSemester: string) => {
        const params: Record<string, string> = {};
        if (nextSubject) params.subject_id = nextSubject;
        if (nextSemester) params.semester_id = nextSemester;
        router.get('/notes', params, { preserveState: true });
    };

    return (
        <>
            <Head title="Notes" />
            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Notes' }]} />
                <header className="mt-4 flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-100 text-primary-700">
                        <BookOpen className="h-5 w-5" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-ink">Notes</h1>
                        <p className="text-sm text-muted">{formatNumber(resources.total)} notes</p>
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
                        <EmptyState icon={BookOpen} title="No notes found" description="Try adjusting the filters." />
                    </div>
                ) : (
                    <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                        {resources.data.map((resource) => {
                            const note = resource.note;
                            const cover = note?.cover_url ?? note?.cover_image ?? null;
                            const size = formatSize(note?.file_size);
                            return (
                                <Link key={resource.id} href={`/notes/${resource.slug}`} className="block">
                                    <Card hoverable className="h-full overflow-hidden">
                                        {cover ? (
                                            <img
                                                src={cover}
                                                alt={resource.title}
                                                className="h-40 w-full object-cover"
                                                loading="lazy"
                                            />
                                        ) : (
                                            <div className="flex h-40 w-full items-center justify-center bg-primary-50 text-primary-300">
                                                <FileText className="h-10 w-10" />
                                            </div>
                                        )}
                                        <div className="p-5">
                                            <div className="flex items-center justify-between gap-2">
                                                {resource.subject && (
                                                    <Badge color="blue" size="sm">
                                                        {resource.subject.name}
                                                    </Badge>
                                                )}
                                                {(note?.pages ?? 0) > 0 && (
                                                    <span className="text-xs text-muted">{note?.pages} pages</span>
                                                )}
                                            </div>
                                            <h2 className="mt-3 font-semibold text-ink">{resource.title}</h2>
                                            {resource.description && (
                                                <p className="mt-1 line-clamp-2 text-sm text-muted">
                                                    {truncate(resource.description, 100)}
                                                </p>
                                            )}
                                            {size && <p className="mt-3 text-xs text-muted">Size: {size}</p>}
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
