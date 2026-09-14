import { Head, Link, usePage } from '@inertiajs/react';
import { BookOpen, Building2, FileText, MapPin } from 'lucide-react';
import { Avatar, Breadcrumb, Card, EmptyState } from '@/components/ui';
import { formatNumber } from '@/lib/utils';
import type { College, Program, University } from '@/types';

type ShowPageProps = {
    college: College & { university: University };
    programs: (Program & { subjects_count: number; resources_count: number })[];
}

export default function Show() {
    const { college, programs } = usePage<ShowPageProps>().props;

    return (
        <>
            <Head title={college.name} />
            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <Breadcrumb
                    items={[
                        { label: 'Home', href: '/' },
                        { label: 'Colleges', href: '/colleges' },
                        { label: college.name },
                    ]}
                />

                <section className="card mt-4 p-6 sm:p-8">
                    <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
                        <Avatar name={college.name} src={college.logo_url ?? undefined} size="lg" />
                        <div className="flex-1">
                            <h1 className="text-2xl font-bold text-ink sm:text-3xl">{college.name}</h1>
                            {college.university && (
                                <Link
                                    href={`/universities/${college.university.slug}`}
                                    className="mt-1 inline-flex items-center gap-1.5 text-sm font-medium text-primary-700 hover:text-primary-800"
                                >
                                    <Building2 className="h-3.5 w-3.5" />
                                    {college.university.name}
                                </Link>
                            )}
                            {college.location && (
                                <p className="mt-1 flex items-center gap-1.5 text-sm text-muted">
                                    <MapPin className="h-3.5 w-3.5" />
                                    {college.location}
                                </p>
                            )}
                            {college.description && (
                                <p className="mt-3 text-sm leading-relaxed text-muted">{college.description}</p>
                            )}
                            <p className="mt-4 flex items-center gap-1.5 text-sm font-medium text-primary-700">
                                <FileText className="h-4 w-4" />
                                {formatNumber(college.resources_count ?? 0)} resources
                            </p>
                        </div>
                    </div>
                </section>

                <h2 className="mt-10 flex items-center gap-2 text-xl font-bold text-ink">
                    <BookOpen className="h-5 w-5 text-primary-700" />
                    Programs
                </h2>
                {programs.length === 0 ? (
                    <div className="mt-4">
                        <EmptyState icon={BookOpen} title="No programs yet" description="Programs will appear here once added." />
                    </div>
                ) : (
                    <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                        {programs.map((program) => (
                            <Card key={program.id} className="p-5">
                                <div className="flex items-start justify-between gap-3">
                                    <h3 className="font-semibold text-ink">{program.name}</h3>
                                    {program.code && (
                                        <span className="rounded-lg bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                                            {program.code}
                                        </span>
                                    )}
                                </div>
                                {program.description && (
                                    <p className="mt-2 line-clamp-2 text-sm text-muted">{program.description}</p>
                                )}
                                <div className="mt-4 flex gap-4 text-sm text-muted">
                                    <span>{formatNumber(program.subjects_count ?? 0)} subjects</span>
                                    <span>{formatNumber(program.resources_count ?? 0)} resources</span>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}
