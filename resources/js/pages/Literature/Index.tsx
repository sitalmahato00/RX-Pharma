import { Head, Link, router, usePage } from '@inertiajs/react';
import { BookMarked, User } from 'lucide-react';
import { useState } from 'react';
import { Badge, Breadcrumb, Card, EmptyState, Pagination, Select } from '@/components/ui';
import { formatDate, formatNumber, truncate } from '@/lib/utils';
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

interface CategoryOption {
    value: string;
    label: string;
}

type IndexPageProps = {
    resources: Paginated<Resource>;
    categories: CategoryOption[];
    filters: { category?: string };
}

function categoryLabel(value: string, categories: CategoryOption[]): string {
    return categories.find((c) => c.value === value)?.label ?? value;
}

export default function Index() {
    const { resources, categories, filters } = usePage<IndexPageProps>().props;
    const [category, setCategory] = useState(filters.category ?? '');

    const applyFilter = (value: string) => {
        const params: Record<string, string> = {};
        if (value) params.category = value;
        router.get('/literature', params, { preserveState: true });
    };

    return (
        <>
            <Head title="Literature" />
            <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
                <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Literature' }]} />
                <header className="mt-4 flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-100 text-primary-700">
                        <BookMarked className="h-5 w-5" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-ink">Literature</h1>
                        <p className="text-sm text-muted">
                            {formatNumber(resources.total)} guidelines, papers and reference documents
                        </p>
                    </div>
                </header>

                {categories.length > 0 && (
                    <div className="mt-6 max-w-xs">
                        <Select
                            label="Category"
                            value={category}
                            onChange={(e) => {
                                setCategory(e.target.value);
                                applyFilter(e.target.value);
                            }}
                        >
                            <option value="">All categories</option>
                            {categories.map((c) => (
                                <option key={c.value} value={c.value}>
                                    {c.label}
                                </option>
                            ))}
                        </Select>
                    </div>
                )}

                {resources.data.length === 0 ? (
                    <div className="mt-8">
                        <EmptyState icon={BookMarked} title="No literature found" description="Try adjusting the category." />
                    </div>
                ) : (
                    <div className="mt-8 space-y-4">
                        {resources.data.map((resource) => {
                            const lit = resource.literature;
                            return (
                                <Link key={resource.id} href={`/literature/${resource.slug}`} className="block">
                                    <Card hoverable className="p-5">
                                        <div className="flex flex-wrap items-center gap-2">
                                            {lit?.category && (
                                                <Badge color="purple" size="sm">
                                                    {categoryLabel(lit.category, categories)}
                                                </Badge>
                                            )}
                                            {resource.subject && (
                                                <Badge color="blue" size="sm">
                                                    {resource.subject.name}
                                                </Badge>
                                            )}
                                            {lit?.year && (
                                                <span className="text-xs text-muted">{lit.year}</span>
                                            )}
                                        </div>
                                        <h2 className="mt-3 font-semibold text-ink">{resource.title}</h2>
                                        {resource.description && (
                                            <p className="mt-1 line-clamp-2 text-sm text-muted">
                                                {truncate(resource.description, 120)}
                                            </p>
                                        )}
                                        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted">
                                            {lit?.author && (
                                                <span className="inline-flex items-center gap-1">
                                                    <User className="h-3 w-3" />
                                                    {lit.author}
                                                </span>
                                            )}
                                            {lit?.organization && <span>by {lit.organization}</span>}
                                            {resource.published_at && <span>{formatDate(resource.published_at)}</span>}
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
