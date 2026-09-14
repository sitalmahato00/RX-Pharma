import { Head, Link, usePage } from '@inertiajs/react';
import { Building2, GraduationCap, MapPin } from 'lucide-react';
import { Avatar, Badge, Breadcrumb, Card, EmptyState, Pagination } from '@/components/ui';
import { formatNumber } from '@/lib/utils';
import type { College, University } from '@/types';

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

type ShowPageProps = {
    university: University;
    colleges: Paginated<College>;
}

export default function Show() {
    const { university, colleges } = usePage<ShowPageProps>().props;

    return (
        <>
            <Head title={university.name} />
            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <Breadcrumb
                    items={[
                        { label: 'Home', href: '/' },
                        { label: 'Universities', href: '/universities' },
                        { label: university.name },
                    ]}
                />

                <section className="card mt-4 p-6 sm:p-8">
                    <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
                        <Avatar name={university.name} src={university.logo_url ?? undefined} size="lg" />
                        <div className="flex-1">
                            <div className="flex flex-wrap items-center gap-3">
                                <h1 className="text-2xl font-bold text-ink sm:text-3xl">{university.name}</h1>
                                {university.acronym && <Badge color="neutral">{university.acronym}</Badge>}
                            </div>
                            {university.location && (
                                <p className="mt-1.5 flex items-center gap-1.5 text-sm text-muted">
                                    <MapPin className="h-3.5 w-3.5" />
                                    {university.location}
                                </p>
                            )}
                            {university.description && (
                                <p className="mt-3 text-sm leading-relaxed text-muted">{university.description}</p>
                            )}
                            <p className="mt-4 flex items-center gap-1.5 text-sm font-medium text-primary-700">
                                <GraduationCap className="h-4 w-4" />
                                {formatNumber(university.colleges_count ?? 0)} colleges
                            </p>
                        </div>
                    </div>
                </section>

                <h2 className="mt-10 text-xl font-bold text-ink">Colleges</h2>
                {colleges.data.length === 0 ? (
                    <div className="mt-4">
                        <EmptyState icon={Building2} title="No colleges yet" description="Colleges will appear here once added." />
                    </div>
                ) : (
                    <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                        {colleges.data.map((college) => (
                            <Link key={college.id} href={`/colleges/${college.slug}`} className="block">
                                <Card hoverable className="h-full p-5">
                                    <div className="flex items-center gap-3">
                                        <Avatar name={college.name} src={college.logo_url ?? undefined} />
                                        <div>
                                            <h3 className="font-semibold text-ink">{college.name}</h3>
                                            {college.location && (
                                                <p className="flex items-center gap-1 text-xs text-muted">
                                                    <MapPin className="h-3 w-3" />
                                                    {college.location}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    <p className="mt-4 text-sm font-medium text-primary-700">
                                        {formatNumber(college.resources_count ?? 0)} resources
                                    </p>
                                </Card>
                            </Link>
                        ))}
                    </div>
                )}

                <div className="mt-8 flex justify-center">
                    <Pagination links={colleges.links} />
                </div>
            </div>
        </>
    );
}
