import { Head, Link, usePage } from '@inertiajs/react';
import { Building2, FileText, MapPin } from 'lucide-react';
import { Avatar, Breadcrumb, Card, EmptyState, Pagination } from '@/components/ui';
import { formatNumber } from '@/lib/utils';
import type { College } from '@/types';

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
    colleges: Paginated<College>;
}

export default function Index() {
    const { colleges } = usePage<IndexPageProps>().props;

    return (
        <>
            <Head title="Colleges" />
            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Colleges' }]} />
                <header className="mt-4 flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-100 text-primary-700">
                        <Building2 className="h-5 w-5" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-ink">Colleges</h1>
                        <p className="text-sm text-muted">{formatNumber(colleges.total)} pharmacy colleges</p>
                    </div>
                </header>

                {colleges.data.length === 0 ? (
                    <div className="mt-8">
                        <EmptyState icon={Building2} title="No colleges found" description="Check back soon." />
                    </div>
                ) : (
                    <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                        {colleges.data.map((college) => (
                            <Link key={college.id} href={`/colleges/${college.slug}`} className="block">
                                <Card hoverable className="h-full p-5">
                                    <div className="flex items-center gap-3">
                                        <Avatar name={college.name} src={college.logo_url ?? undefined} />
                                        <div>
                                            <h2 className="font-semibold text-ink">{college.name}</h2>
                                            {college.university && (
                                                <p className="text-xs text-muted">{college.university.name}</p>
                                            )}
                                        </div>
                                    </div>
                                    {college.location && (
                                        <p className="mt-3 flex items-center gap-1.5 text-sm text-muted">
                                            <MapPin className="h-3.5 w-3.5" />
                                            {college.location}
                                        </p>
                                    )}
                                    {college.description && (
                                        <p className="mt-2 line-clamp-2 text-sm text-muted">{college.description}</p>
                                    )}
                                    <p className="mt-4 flex items-center gap-1.5 text-sm font-medium text-primary-700">
                                        <FileText className="h-4 w-4" />
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
