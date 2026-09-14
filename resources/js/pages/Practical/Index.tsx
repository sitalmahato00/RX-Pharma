import { Head, Link, router, usePage } from '@inertiajs/react';
import { FlaskConical } from 'lucide-react';
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

interface PracticalTypeOption {
    value: string;
    label: string;
}

type IndexPageProps = {
    resources: Paginated<Resource>;
    practicalTypes: PracticalTypeOption[];
    filters: { practical_type?: string };
}

function typeLabel(value: string, options: PracticalTypeOption[]): string {
    return options.find((o) => o.value === value)?.label ?? value;
}

export default function Index() {
    const { resources, practicalTypes, filters } = usePage<IndexPageProps>().props;
    const [practicalType, setPracticalType] = useState(filters.practical_type ?? '');

    const applyFilter = (value: string) => {
        const params: Record<string, string> = {};
        if (value) params.practical_type = value;
        router.get('/practical-viva', params, { preserveState: true });
    };

    return (
        <>
            <Head title="Practical & Viva" />
            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Practical & Viva' }]} />
                <header className="mt-4 flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-100 text-primary-700">
                        <FlaskConical className="h-5 w-5" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-ink">Practical &amp; Viva</h1>
                        <p className="text-sm text-muted">{formatNumber(resources.total)} practical resources</p>
                    </div>
                </header>

                {practicalTypes.length > 0 && (
                    <div className="mt-6 max-w-xs">
                        <Select
                            label="Type"
                            value={practicalType}
                            onChange={(e) => {
                                setPracticalType(e.target.value);
                                applyFilter(e.target.value);
                            }}
                        >
                            <option value="">All types</option>
                            {practicalTypes.map((t) => (
                                <option key={t.value} value={t.value}>
                                    {t.label}
                                </option>
                            ))}
                        </Select>
                    </div>
                )}

                {resources.data.length === 0 ? (
                    <div className="mt-8">
                        <EmptyState icon={FlaskConical} title="No practical resources found" description="Try adjusting the type." />
                    </div>
                ) : (
                    <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                        {resources.data.map((resource) => {
                            const practical = resource.practical_resource;
                            return (
                                <Link key={resource.id} href={`/practical-viva/${resource.slug}`} className="block">
                                    <Card hoverable className="h-full p-5">
                                        <div className="flex flex-wrap items-center gap-2">
                                            {practical?.practical_type && (
                                                <Badge color="green" size="sm">
                                                    {typeLabel(practical.practical_type, practicalTypes)}
                                                </Badge>
                                            )}
                                            {resource.subject && (
                                                <Badge color="blue" size="sm">
                                                    {resource.subject.name}
                                                </Badge>
                                            )}
                                        </div>
                                        <h2 className="mt-3 font-semibold text-ink">{resource.title}</h2>
                                        {resource.description && (
                                            <p className="mt-1 line-clamp-2 text-sm text-muted">
                                                {truncate(resource.description, 100)}
                                            </p>
                                        )}
                                        {practical?.steps?.length ? (
                                            <p className="mt-3 text-xs text-muted">{practical.steps.length} steps</p>
                                        ) : null}
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
