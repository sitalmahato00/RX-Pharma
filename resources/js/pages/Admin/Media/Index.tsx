import { Head, router, useForm, usePage } from '@inertiajs/react';
import { File, FileText, Film, Search, Trash2, UploadCloud } from 'lucide-react';
import { useState } from 'react';
import { Alert, Badge, Button, Card, ConfirmDialog, EmptyState, FileUpload, Input, Pagination, Select } from '@/components/ui';
import type { PaginationLink } from '@/components/ui';
import { formatDate, timeAgo } from '@/lib/utils';

interface Paginated<T> {
    data: T[];
    links: PaginationLink[];
    current_page: number;
    last_page: number;
    total: number;
    from: number;
    to: number;
    per_page: number;
}

interface MediaRow {
    id: number;
    name: string;
    original_name: string;
    url: string;
    mime_type: string;
    extension: string;
    size: number;
    size_label?: string;
    collection: string;
    created_at?: string;
    user?: { id: number; name: string } | null;
}

interface PageProps {
    flash?: { success?: string; error?: string };
    media: Paginated<MediaRow>;
    collections: string[];
    filters: { collection?: string; search?: string };
    [key: string]: unknown;
}

const imageExtensions = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg'];

function isImage(media: MediaRow): boolean {
    return imageExtensions.includes(media.extension.toLowerCase()) || media.mime_type.startsWith('image/');
}

function isVideo(media: MediaRow): boolean {
    return media.mime_type.startsWith('video/');
}

function formatSize(bytes: number): string {
    if (bytes >= 1048576) return `${(bytes / 1048576).toFixed(1)} MB`;
    if (bytes >= 1024) return `${Math.round(bytes / 1024)} KB`;
    return `${bytes} B`;
}

export default function Index({ media, collections, filters }: PageProps) {
    const { props } = usePage<PageProps>();
    const flash = props.flash ?? {};
    const [deleteTarget, setDeleteTarget] = useState<MediaRow | null>(null);
    const [deleting, setDeleting] = useState(false);

    const uploadForm = useForm<{ file: File | null; collection: string; name: string }>({
        file: null,
        collection: 'general',
        name: '',
    });

    const form = useForm({
        collection: filters.collection ?? '',
        search: filters.search ?? '',
    });

    const applyFilters = () => {
        const data: Record<string, string> = {};
        if (form.data.collection) data.collection = form.data.collection;
        if (form.data.search.trim()) data.search = form.data.search.trim();
        router.get('/admin/media', data, { preserveState: true, replace: true });
    };

    const handleUpload = (e: React.FormEvent) => {
        e.preventDefault();
        uploadForm.post('/admin/media', {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => uploadForm.reset('file', 'name'),
        });
    };

    const confirmDelete = () => {
        if (!deleteTarget) return;
        setDeleting(true);
        router.delete(`/admin/media/${deleteTarget.id}`, {
            onFinish: () => {
                setDeleting(false);
                setDeleteTarget(null);
            },
        });
    };

    const allCollections = Array.from(new Set(['general', ...collections]));

    return (
        <div className="space-y-6">
            <Head title="Media Library" />
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold text-ink">Media Library</h1>
                    <p className="text-sm text-muted">Upload and manage media assets.</p>
                </div>
            </div>

            {flash.success && <Alert type="success">{flash.success}</Alert>}
            {flash.error && <Alert type="error">{flash.error}</Alert>}

            <Card className="space-y-4 p-6">
                <div>
                    <h2 className="font-semibold text-ink">Upload media</h2>
                    <p className="text-sm text-muted">Supported: images, PDF, video (max 100 MB).</p>
                </div>
                <form onSubmit={handleUpload} className="grid gap-4 lg:grid-cols-[1fr_200px_220px_auto]">
                    <FileUpload
                        label="File"
                        accept="image/*,.pdf,.mp4,.webm,.mov"
                        value={uploadForm.data.file}
                        onChange={(file) => uploadForm.setData('file', file)}
                        hint={uploadForm.errors.file}
                    />
                    <Select
                        label="Collection"
                        value={uploadForm.data.collection}
                        onChange={(e) => uploadForm.setData('collection', e.target.value)}
                    >
                        {allCollections.map((c) => (
                            <option key={c} value={c}>
                                {c}
                            </option>
                        ))}
                    </Select>
                    <Input
                        label="Name (optional)"
                        value={uploadForm.data.name}
                        onChange={(e) => uploadForm.setData('name', e.target.value)}
                        placeholder="Custom name..."
                    />
                    <div className="flex items-end">
                        <Button type="submit" loading={uploadForm.processing} disabled={!uploadForm.data.file}>
                            <UploadCloud className="h-4 w-4" />
                            Upload
                        </Button>
                    </div>
                </form>
            </Card>

            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    applyFilters();
                }}
                className="card flex flex-wrap items-end gap-3 p-4"
            >
                <div className="w-full sm:w-64">
                    <Input
                        label="Search"
                        placeholder="Search by name..."
                        value={form.data.search}
                        onChange={(e) => form.setData('search', e.target.value)}
                        className="pr-9"
                    />
                </div>
                <div className="w-full sm:w-48">
                    <Select
                        label="Collection"
                        value={form.data.collection}
                        onChange={(e) => form.setData('collection', e.target.value)}
                    >
                        <option value="">All collections</option>
                        {allCollections.map((c) => (
                            <option key={c} value={c}>
                                {c}
                            </option>
                        ))}
                    </Select>
                </div>
                <Button size="md" onClick={() => applyFilters()}>
                    <Search className="h-4 w-4" />
                    Filter
                </Button>
            </form>

            {media.data.length === 0 ? (
                <Card className="p-6">
                    <EmptyState icon={File} title="No media found" description="Upload files or clear your filters." />
                </Card>
            ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {media.data.map((item) => (
                        <Card key={item.id} className="flex flex-col overflow-hidden">
                            {isImage(item) ? (
                                <div className="flex h-44 items-center justify-center overflow-hidden bg-slate-100">
                                    <img src={item.url} alt={item.name} className="h-full w-full object-cover" />
                                </div>
                            ) : (
                                <div className="flex h-44 items-center justify-center bg-slate-100 text-slate-400">
                                    {isVideo(item) ? <Film className="h-10 w-10" /> : <FileText className="h-10 w-10" />}
                                </div>
                            )}
                            <div className="flex flex-1 flex-col p-4">
                                <p className="truncate font-medium text-ink" title={item.name}>
                                    {item.name}
                                </p>
                                <p className="truncate text-xs text-muted">{item.original_name}</p>
                                <div className="mt-2 flex flex-wrap items-center gap-1.5">
                                    <Badge color="neutral">{item.collection}</Badge>
                                    <Badge color="neutral">{item.extension.toUpperCase()}</Badge>
                                </div>
                                <div className="mt-3 flex items-center justify-between gap-2 border-t border-slate-100 pt-3 text-xs text-muted">
                                    <span>{item.size_label ?? formatSize(item.size)}</span>
                                    <span>{item.user ? `by ${item.user.name}` : 'System'}</span>
                                    <span>{timeAgo(item.created_at)}</span>
                                </div>
                                <div className="mt-3 flex items-center justify-between">
                                    <span className="text-xs text-slate-400">{formatDate(item.created_at)}</span>
                                    <Button size="sm" variant="danger" onClick={() => setDeleteTarget(item)}>
                                        <Trash2 className="h-3.5 w-3.5" />
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            {media.links && media.links.length > 3 && (
                <div className="flex justify-end">
                    <Pagination links={media.links} />
                </div>
            )}

            <ConfirmDialog
                open={!!deleteTarget}
                onClose={() => setDeleteTarget(null)}
                onConfirm={confirmDelete}
                title="Delete media?"
                description={`This will permanently delete "${deleteTarget?.name}" from storage.`}
                confirmText="Delete"
                loading={deleting}
            />
        </div>
    );
}