import { Head, Link, router, usePage } from '@inertiajs/react';
import { Download, FileText } from 'lucide-react';
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

type IndexPageProps = {
    resources: Paginated<Resource>;
    years: number[];
    examTypes: string[];
    filters: { year?: string; exam_type?: string };
}

export default function Index() {
    const { resources, years, examTypes, filters } = usePage<IndexPageProps>().props;
    const [year, setYear] = useState(filters.year ?? '');
    const [examType, setExamType] = useState(filters.exam_type ?? '');

    const applyFilters = (nextYear: string, nextExamType: string) => {
        const params: Record<string, string> = {};
        if (nextYear) params.year = nextYear;
        if (nextExamType) params.exam_type = nextExamType;
        router.get('/previous-papers', params, { preserveState: true });
    };

    return (
        <>
            <Head title="Previous Papers" />
            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Previous Papers' }]} />
                <header className="mt-4 flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-100 text-primary-700">
                        <FileText className="h-5 w-5" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-ink">Previous Papers</h1>
                        <p className="text-sm text-muted">{formatNumber(resources.total)} past examination papers</p>
                    </div>
                </header>

                {(years.length > 0 || examTypes.length > 0) && (
                    <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:max-w-xl">
                        {years.length > 0 && (
                            <Select
                                label="Year"
                                value={year}
                                onChange={(e) => {
                                    setYear(e.target.value);
                                    applyFilters(e.target.value, examType);
                                }}
                            >
                                <option value="">All years</option>
                                {years.map((y) => (
                                    <option key={y} value={String(y)}>
                                        {y}
                                    </option>
                                ))}
                            </Select>
                        )}
                        {examTypes.length > 0 && (
                            <Select
                                label="Exam Type"
                                value={examType}
                                onChange={(e) => {
                                    setExamType(e.target.value);
                                    applyFilters(year, e.target.value);
                                }}
                            >
                                <option value="">All exam types</option>
                                {examTypes.map((t) => (
                                    <option key={t} value={t}>
                                        {t}
                                    </option>
                                ))}
                            </Select>
                        )}
                    </div>
                )}

                {resources.data.length === 0 ? (
                    <div className="mt-8">
                        <EmptyState icon={FileText} title="No papers found" description="Try adjusting the filters." />
                    </div>
                ) : (
                    <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                        {resources.data.map((resource) => {
                            const paper = resource.previous_paper;
                            return (
                                <Card key={resource.id} className="flex h-full flex-col p-5">
                                    <div className="flex flex-wrap items-center gap-2">
                                        {paper?.year && <Badge color="orange">{paper.year}</Badge>}
                                        {paper?.exam_type && (
                                            <Badge color="neutral" size="sm">
                                                {paper.exam_type}
                                            </Badge>
                                        )}
                                        {paper?.has_answer_key && (
                                            <Badge color="green" size="sm">
                                                Answer key
                                            </Badge>
                                        )}
                                    </div>
                                    <h2 className="mt-3 font-semibold text-ink">
                                        <Link
                                            href={`/previous-papers/${resource.slug}`}
                                            className="transition hover:text-primary-700"
                                        >
                                            {resource.title}
                                        </Link>
                                    </h2>
                                    {resource.description && (
                                        <p className="mt-1 line-clamp-2 text-sm text-muted">
                                            {truncate(resource.description, 100)}
                                        </p>
                                    )}
                                    <div className="mt-auto flex items-center justify-between gap-2 pt-4">
                                        {resource.subject ? (
                                            <Badge color="blue">{resource.subject.name}</Badge>
                                        ) : (
                                            <span />
                                        )}
                                        <a
                                            href={`/files/${resource.id}/download`}
                                            className="inline-flex items-center gap-1.5 rounded-lg bg-primary-700 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-primary-800"
                                        >
                                            <Download className="h-3.5 w-3.5" />
                                            Download
                                        </a>
                                    </div>
                                </Card>
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
