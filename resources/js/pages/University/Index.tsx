import { Head, Link, usePage } from '@inertiajs/react';
import { Building2, GraduationCap, MapPin } from 'lucide-react';
import { Avatar, Badge, Breadcrumb, Card, EmptyState, Pagination } from '@/components/ui';
import { formatNumber } from '@/lib/utils';
import type { University } from '@/types';

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
    universities: Paginated<University>;
}

export default function Index() {
    const { universities } = usePage<IndexPageProps>().props;

    return (
        <>
            <Head title="Universities" />
            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Universities' }]} />
                <header className="mt-4 flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-100 text-primary-700">
                        <Building2 className="h-5 w-5" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-ink">Universities</h1>
                        <p className="text-sm text-muted">{formatNumber(universities.total)} universities on RX Pharma</p>
                    </div>
                </header>

                {universities.data.length === 0 ? (
                    <div className="mt-8">
                        <EmptyState icon={Building2} title="No universities found" description="Check back soon." />
                    </div>
                ) : (
                    <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                        {universities.data.map((university) => (
                            <Link key={university.id} href={`/universities/${university.slug}`} className="block">
                                <Card hoverable className="h-full p-5">
                                    <div className="flex items-start justify-between gap-3">
                                        <Avatar name={university.name} src={university.logo_url ?? undefined} size="lg" />
                                        {university.acronym && (
                                            <Badge color="neutral" size="sm">
                                                {university.acronym}
                                            </Badge>
                                        )}
                                    </div>
                                    <h2 className="mt-4 text-lg font-semibold text-ink">{university.name}</h2>
                                    {university.location && (
                                        <p className="mt-1 flex items-center gap-1.5 text-sm text-muted">
                                            <MapPin className="h-3.5 w-3.5" />
                                            {university.location}
                                        </p>
                                    )}
                                    {university.description && (
                                        <p className="mt-2 line-clamp-2 text-sm text-muted">{university.description}</p>
                                    )}
                                    <p className="mt-4 flex items-center gap-1.5 text-sm font-medium text-primary-700">
                                        <GraduationCap className="h-4 w-4" />
                                        {formatNumber(university.colleges_count ?? 0)} colleges
                                    </p>
                                </Card>
                            </Link>
                        ))}
                    </div>
                )}

                <div className="mt-8 flex justify-center">
                    <Pagination links={universities.links} />
                </div>
            </div>
        </>
    );
}
