import { Head, Link, router, usePage } from '@inertiajs/react';
import { Bookmark as BookmarkIcon, Trash2 } from 'lucide-react';
import { Alert, Badge, Button, Card, EmptyState, Tabs, type BadgeColor } from '@/components/ui';
import { resourceTypeLabel, resourceTypeRoute, timeAgo } from '@/lib/utils';
import type { Quiz, Resource, Subject } from '@/types';

interface BookmarkItem {
    id: number;
    type: string;
    subject: Subject | null;
    resource: Resource | Quiz;
    created_at: string;
}

interface BookmarkTab {
    key: string;
    label: string;
}

interface BookmarksProps {
    bookmarks: Record<string, BookmarkItem[]>;
    tabs: BookmarkTab[];
    activeType: string;
}

function isQuiz(resource: Resource | Quiz): resource is Quiz {
    return !('resource_type' in resource);
}

function resourcePath(resource: Resource | Quiz, type: string): string {
    if (type === 'quiz' || isQuiz(resource)) return `/quizzes/${resource.slug}`;
    return `/${resourceTypeRoute(type)}/${resource.slug}`;
}

const typeBadgeColor: Record<string, BadgeColor> = {
    note: 'blue',
    video: 'orange',
    literature: 'purple',
    previous_paper: 'amber',
    practical: 'green',
    quiz: 'red',
};

export default function Bookmarks(props: BookmarksProps) {
    const { flash } = usePage<{ flash?: { success?: string; error?: string; warning?: string } }>().props;
    const { bookmarks, tabs, activeType } = props;

    const items =
        activeType === 'all'
            ? Object.values(bookmarks).flat()
            : (bookmarks[activeType] ?? []);

    function handleTabChange(key: string) {
        router.get('/my-bookmarks', { type: key }, { preserveState: true, replace: true });
    }

    function handleRemove(id: number) {
        router.post(
            '/bookmarks/remove',
            { id },
            { preserveScroll: true }
        );
    }

    return (
        <div className="space-y-6">
            <Head title="My Bookmarks" />

            {flash?.success && (
                <Alert type="success" dismissible>
                    {flash.success}
                </Alert>
            )}
            {flash?.error && (
                <Alert type="error" dismissible>
                    {flash.error}
                </Alert>
            )}
            {flash?.warning && (
                <Alert type="warning" dismissible>
                    {flash.warning}
                </Alert>
            )}

            <div>
                <h1 className="text-2xl font-bold text-ink">My Bookmarks</h1>
                <p className="mt-1 text-sm text-muted">Everything you have saved for quick access.</p>
            </div>

            <Card className="p-6">
                <Tabs
                    tabs={tabs.map((t) => ({ label: t.label, value: t.key }))}
                    value={activeType}
                    onChange={handleTabChange}
                />

                <div className="mt-6">
                    {items.length === 0 ? (
                        <EmptyState
                            icon={BookmarkIcon}
                            title="No bookmarks here"
                            description="Bookmark notes, videos, quizzes and more from the library."
                            action={
                                <Button size="sm" href="/notes">
                                    Browse resources
                                </Button>
                            }
                        />
                    ) : (
                        <div className="space-y-3">
                            {items.map((item) => (
                                <div key={item.id} className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white p-4">
                                    <div className="flex min-w-0 items-start gap-3">
                                        <div className="min-w-0 flex-1">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <Badge size="sm" color={typeBadgeColor[item.type]}>
                                                    {resourceTypeLabel(item.type)}
                                                </Badge>
                                                {(item.subject?.name ?? item.resource.subject?.name) && (
                                                    <span className="text-xs text-muted">
                                                        {item.subject?.name ?? item.resource.subject?.name}
                                                    </span>
                                                )}
                                            </div>
                                            <Link
                                                href={resourcePath(item.resource, item.type)}
                                                className="mt-1.5 block truncate font-semibold text-ink transition hover:text-primary-700"
                                            >
                                                {item.resource.title}
                                            </Link>
                                            <p className="mt-0.5 text-xs text-muted">{timeAgo(item.created_at)}</p>
                                        </div>
                                    </div>
                                    <div className="flex shrink-0 items-center gap-2">
                                        <Button size="sm" variant="secondary" href={resourcePath(item.resource, item.type)}>
                                            Open
                                        </Button>
                                        <Button size="icon" variant="ghost" aria-label="Remove bookmark" onClick={() => handleRemove(item.id)}>
                                            <Trash2 className="h-4 w-4 text-red-500" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </Card>
        </div>
    );
}