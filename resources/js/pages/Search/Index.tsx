import { Head, router, usePage } from '@inertiajs/react';
import { BookOpen, ListChecks, Search, SearchX } from 'lucide-react';
import { Badge, Breadcrumb, Card, EmptyState, SearchBar } from '@/components/ui';
import { formatDate, resourceTypeLabel, resourceTypeRoute, truncate } from '@/lib/utils';
import type { Quiz, Resource, Subject } from '@/types';

interface Paginated<T> {
    data: T[];
    links: { url: string | null; label: string; active: boolean }[];
}

interface SearchPageProps {
    query: string;
    resources: Paginated<Resource> | [];
    subjects: Subject[];
    quizzes: Quiz[];
    [key: string]: unknown;
}

export default function Index() {
    const { query, resources, subjects, quizzes } = usePage<SearchPageProps>().props;

    const resourceList = Array.isArray(resources) ? [] : resources.data;
    const hasResults = resourceList.length > 0 || subjects.length > 0 || quizzes.length > 0;

    const handleSearch = (q: string) => {
        if (!q) return;
        router.get('/search', { q }, { preserveState: true });
    };

    return (
        <>
            <Head title="Search" />
            <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
                <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Search' }]} />

                <header className="mt-4">
                    <h1 className="text-2xl font-bold text-ink">Search</h1>
                    <div className="mt-4 max-w-xl">
                        <SearchBar placeholder="Search notes, videos, literature, MCQs..." defaultValue={query} onSearch={handleSearch} />
                    </div>
                    {query && (
                        <p className="mt-4 text-sm text-muted">
                            Results for <span className="font-semibold text-ink">"{query}"</span>
                        </p>
                    )}
                </header>

                {!query ? (
                    <div className="mt-12">
                        <EmptyState
                            icon={Search}
                            title="Type something to search"
                            description="Search across notes, videos, literature, subjects and quizzes."
                        />
                    </div>
                ) : !hasResults ? (
                    <div className="mt-12">
                        <EmptyState
                            icon={SearchX}
                            title="No results found"
                            description={`Nothing matched "${query}". Try different keywords.`}
                        />
                    </div>
                ) : (
                    <div className="mt-8 space-y-10">
                        {resourceList.length > 0 && (
                            <section>
                                <h2 className="flex items-center gap-2 text-lg font-bold text-ink">
                                    <BookOpen className="h-5 w-5 text-primary-700" />
                                    Resources
                                </h2>
                                <div className="mt-4 space-y-3">
                                    {resourceList.map((resource) => (
                                        <a
                                            key={resource.id}
                                            href={`/${resourceTypeRoute(resource.resource_type)}/${resource.slug}`}
                                            className="block"
                                        >
                                            <Card hoverable className="flex items-start gap-4 p-4">
                                                <Badge color="blue" size="sm" className="shrink-0">
                                                    {resourceTypeLabel(resource.resource_type)}
                                                </Badge>
                                                <div className="min-w-0 flex-1">
                                                    <h3 className="font-semibold text-ink">{resource.title}</h3>
                                                    {resource.description && (
                                                        <p className="mt-0.5 line-clamp-2 text-sm text-muted">
                                                            {truncate(resource.description, 120)}
                                                        </p>
                                                    )}
                                                    <p className="mt-1 text-xs text-muted">
                                                        {resource.subject?.name &&
                                                            `${resource.subject.name} · `}
                                                        {resource.published_at ? formatDate(resource.published_at) : ''}
                                                    </p>
                                                </div>
                                            </Card>
                                        </a>
                                    ))}
                                </div>
                            </section>
                        )}

                        {subjects.length > 0 && (
                            <section>
                                <h2 className="flex items-center gap-2 text-lg font-bold text-ink">
                                    <BookOpen className="h-5 w-5 text-primary-700" />
                                    Subjects
                                </h2>
                                <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                    {subjects.map((subject) => (
                                        <a key={subject.id} href={`/subjects/${subject.slug}`} className="block">
                                            <Card hoverable className="h-full p-4">
                                                <h3 className="font-semibold text-ink">{subject.name}</h3>
                                                {subject.code && <p className="mt-0.5 text-xs text-muted">{subject.code}</p>}
                                                <p className="mt-2 text-sm font-medium text-primary-700">
                                                    {subject.resources_count ?? 0} resources
                                                </p>
                                            </Card>
                                        </a>
                                    ))}
                                </div>
                            </section>
                        )}

                        {quizzes.length > 0 && (
                            <section>
                                <h2 className="flex items-center gap-2 text-lg font-bold text-ink">
                                    <ListChecks className="h-5 w-5 text-primary-700" />
                                    Quizzes
                                </h2>
                                <div className="mt-4 space-y-3">
                                    {quizzes.map((quiz) => (
                                        <a key={quiz.id} href={`/quizzes/${quiz.slug}`} className="block">
                                            <Card hoverable className="flex items-start gap-4 p-4">
                                                {quiz.subject && (
                                                    <Badge color="blue" size="sm" className="shrink-0">
                                                        {quiz.subject.name}
                                                    </Badge>
                                                )}
                                                <div className="min-w-0 flex-1">
                                                    <h3 className="font-semibold text-ink">{quiz.title}</h3>
                                                    <p className="mt-0.5 text-xs text-muted">
                                                        {quiz.total_questions} questions · {quiz.duration_minutes} minutes · Pass{' '}
                                                        {quiz.passing_score}%
                                                    </p>
                                                </div>
                                            </Card>
                                        </a>
                                    ))}
                                </div>
                            </section>
                        )}
                    </div>
                )}
            </div>
        </>
    );
}
