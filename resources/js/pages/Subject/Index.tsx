import { Head, Link, router, usePage } from '@inertiajs/react';
import { BookOpen, FileText } from 'lucide-react';
import { useState } from 'react';
import { Breadcrumb, Card, EmptyState, Pagination, Select } from '@/components/ui';
import { formatNumber } from '@/lib/utils';
import type { Subject } from '@/types';

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

interface ProgramOption {
    id: number;
    name: string;
    code?: string | null;
}

interface SemesterOption {
    id: number;
    name: string;
    number: number;
}

type IndexPageProps = {
    subjects: Paginated<Subject>;
    programs: ProgramOption[];
    semesters: SemesterOption[];
    filters: { program_id?: string; semester_id?: string };
}

export default function Index() {
    const { subjects, programs, semesters, filters } = usePage<IndexPageProps>().props;
    const [programId, setProgramId] = useState(filters.program_id ?? '');
    const [semesterId, setSemesterId] = useState(filters.semester_id ?? '');

    const applyFilters = (nextProgram: string, nextSemester: string) => {
        const params: Record<string, string> = {};
        if (nextProgram) params.program_id = nextProgram;
        if (nextSemester) params.semester_id = nextSemester;
        router.get('/subjects', params, { preserveState: true });
    };

    return (
        <>
            <Head title="Subjects" />
            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Subjects' }]} />
                <header className="mt-4 flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-100 text-primary-700">
                        <BookOpen className="h-5 w-5" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-ink">Subjects</h1>
                        <p className="text-sm text-muted">{formatNumber(subjects.total)} subjects</p>
                    </div>
                </header>

                {(programs.length > 0 || semesters.length > 0) && (
                    <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:max-w-xl">
                        {programs.length > 0 && (
                            <Select
                                label="Program"
                                value={programId}
                                onChange={(e) => {
                                    setProgramId(e.target.value);
                                    applyFilters(e.target.value, semesterId);
                                }}
                            >
                                <option value="">All programs</option>
                                {programs.map((program) => (
                                    <option key={program.id} value={String(program.id)}>
                                        {program.name}
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
                                    applyFilters(programId, e.target.value);
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

                {subjects.data.length === 0 ? (
                    <div className="mt-8">
                        <EmptyState icon={BookOpen} title="No subjects found" description="Try adjusting the filters." />
                    </div>
                ) : (
                    <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                        {subjects.data.map((subject) => (
                            <Link key={subject.id} href={`/subjects/${subject.slug}`} className="block">
                                <Card hoverable className="h-full p-5">
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <h2 className="text-lg font-semibold text-ink">{subject.name}</h2>
                                            {subject.code && <p className="mt-0.5 text-xs text-muted">{subject.code}</p>}
                                        </div>
                                        <span
                                            className="h-3 w-3 shrink-0 rounded-full"
                                            style={{ backgroundColor: subject.color ?? '#0b63ce' }}
                                        />
                                    </div>
                                    {subject.description && (
                                        <p className="mt-2 line-clamp-2 text-sm text-muted">{subject.description}</p>
                                    )}
                                    <div className="mt-4 flex gap-4 text-sm font-medium text-primary-700">
                                        <span className="inline-flex items-center gap-1">
                                            <FileText className="h-4 w-4" />
                                            {formatNumber(subject.resources_count ?? 0)} resources
                                        </span>
                                        <span>{formatNumber(subject.units_count ?? 0)} units</span>
                                    </div>
                                </Card>
                            </Link>
                        ))}
                    </div>
                )}

                <div className="mt-8 flex justify-center">
                    <Pagination links={subjects.links} />
                </div>
            </div>
        </>
    );
}
