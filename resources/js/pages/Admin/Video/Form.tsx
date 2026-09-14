import { Link, useForm, usePage } from '@inertiajs/react';
import { Alert, Button, Card, FileUpload, Input, Label, MediaPreview, Select, Textarea } from '@/components/ui';
import { ArrowLeft } from 'lucide-react';
import AcademicCascade from '@/components/admin/AcademicCascade';

interface VideoResource {
    id: number;
    title: string;
    description?: string | null;
    status: 'draft' | 'published' | 'archived';
    featured: boolean;
    university_id?: number | null;
    college_id?: number | null;
    program_id?: number | null;
    semester_id?: number | null;
    subject_id?: number | null;
    unit_id?: number | null;
    topic_id?: number | null;
    tags?: { name: string }[];
}

interface Video {
    id: number;
    resource?: VideoResource;
    video_url?: string | null;
    video_path?: string | null;
    video_type: 'url' | 'upload';
    provider?: string | null;
    duration_seconds?: number | null;
    thumbnail?: string | null;
}

interface Academy {
    id: number;
    name: string;
}

interface Props {
    video?: Video;
    universities: Academy[];
    colleges: Academy[];
    programs: Academy[];
    semesters: Academy[];
    subjects: Academy[];
    units: Academy[];
    topics: Academy[];
}

export default function Form({ video, universities }: Props) {
    const { flash } = usePage<{ flash: { success?: string } }>().props;
    const isEdit = !!video;
    const resource = video?.resource;
    const videoType = video?.video_type ?? 'url';

    const { data, setData, post, put, transform, processing, errors } = useForm({
        title: resource?.title ?? '',
        university_id: resource?.university_id ?? '',
        college_id: resource?.college_id ?? '',
        program_id: resource?.program_id ?? '',
        semester_id: resource?.semester_id ?? '',
        subject_id: resource?.subject_id ?? '',
        unit_id: resource?.unit_id ?? '',
        topic_id: resource?.topic_id ?? '',
        description: resource?.description ?? '',
        status: resource?.status ?? 'draft',
        featured: resource?.featured ?? false,
        video_type: videoType,
        video_url: video?.video_url ?? '',
        thumbnail_path: video?.thumbnail ?? '',
        provider: video?.provider ?? '',
        duration_seconds: video?.duration_seconds ?? '',
        tags: resource?.tags ? resource.tags.map((t) => t.name).join(', ') : '',
        thumbnail: null as File | null,
        video: null as File | null,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        transform(() => ({
            ...data,
            tags: data.tags
                ? data.tags.split(',').map((t: string) => t.trim()).filter(Boolean)
                : [],
        }));
        if (isEdit) {
            put(`/admin/videos/${video!.id}`, { forceFormData: true });
        } else {
            post('/admin/videos', { forceFormData: true });
        }
    };

    return (
        <>
            <Link href="/admin/videos" className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-ink">
                <ArrowLeft className="h-4 w-4" /> Back to Videos
            </Link>

            {flash.success && <Alert type="success" dismissible>{flash.success}</Alert>}

            <Card className="mx-auto max-w-3xl p-6">
                <h1 className="mb-6 text-xl font-bold text-ink">{isEdit ? 'Edit Video' : 'Create Video'}</h1>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <Input
                        id="title"
                        label="Title"
                        value={data.title}
                        onChange={(e) => setData('title', e.target.value)}
                        error={errors.title}
                        required
                    />

                    <AcademicCascade
                        universities={universities}
                        values={{
                            university_id: data.university_id,
                            college_id: data.college_id,
                            program_id: data.program_id,
                            semester_id: data.semester_id,
                            subject_id: data.subject_id,
                            unit_id: data.unit_id,
                            topic_id: data.topic_id,
                        }}
                        onChange={(field, value) => setData(field as never, value as never)}
                        errors={errors}
                    />

                    <Textarea
                        id="description"
                        label="Description"
                        value={data.description}
                        onChange={(e) => setData('description', e.target.value)}
                        error={errors.description}
                        rows={3}
                    />

                    <div className="grid grid-cols-2 gap-4">
                        <Select
                            id="status"
                            label="Status"
                            value={data.status}
                            onChange={(e) => setData('status', e.target.value as 'draft' | 'published' | 'archived')}
                            error={errors.status}
                        >
                            <option value="draft">Draft</option>
                            <option value="published">Published</option>
                            <option value="archived">Archived</option>
                        </Select>

                        <Select
                            id="video_type"
                            label="Source"
                            value={data.video_type}
                            onChange={(e) => setData('video_type', e.target.value as 'url' | 'upload')}
                            error={errors.video_type}
                        >
                            <option value="url">Video URL</option>
                            <option value="upload">Upload File</option>
                        </Select>
                    </div>

                    {data.video_type === 'url' ? (
                        <div className="grid grid-cols-2 gap-4">
                            <Input
                                id="video_url"
                                label="Video URL"
                                value={data.video_url}
                                onChange={(e) => setData('video_url', e.target.value)}
                                error={errors.video_url}
                                placeholder="https://..."
                            />
                            <Input
                                id="provider"
                                label="Provider"
                                value={data.provider}
                                onChange={(e) => setData('provider', e.target.value)}
                                error={errors.provider}
                                placeholder="YouTube, Vimeo, ..."
                            />
                        </div>
                    ) : (
                        <FileUpload
                            label="Video File"
                            accept="video/mp4,video/webm,video/ogg,video/quicktime,.mkv"
                            value={data.video}
                            onChange={(f) => setData('video', f)}
                            hint={isEdit && video?.video_path ? 'Leave empty to keep the current file.' : 'mp4, webm, ogg, mov or mkv (max 500MB)'}
                        />
                    )}
                    {errors.video && <p className="mt-1 text-xs text-red-500">{errors.video}</p>}

                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            id="duration_seconds"
                            label="Duration (seconds)"
                            type="number"
                            min={0}
                            value={data.duration_seconds}
                            onChange={(e) => setData('duration_seconds', e.target.value)}
                            error={errors.duration_seconds}
                        />
                        <Input
                            id="thumbnail_path"
                            label="Thumbnail Path"
                            value={data.thumbnail_path}
                            onChange={(e) => setData('thumbnail_path', e.target.value)}
                            error={errors.thumbnail_path}
                            placeholder="/storage/videos/thumbnails/..."
                        />
                    </div>

                    <FileUpload
                        label="Thumbnail Image"
                        accept="image/*"
                        value={data.thumbnail}
                        onChange={(f) => setData('thumbnail', f)}
                        hint="Upload an image, or set a thumbnail path above."
                    />
                    <MediaPreview source={data.thumbnail || (isEdit ? video?.thumbnail : null)} type="image" label="Thumbnail preview" />
                    {errors.thumbnail && <p className="mt-1 text-xs text-red-500">{errors.thumbnail}</p>}

                    <Input
                        id="tags"
                        label="Tags (comma separated)"
                        value={data.tags}
                        onChange={(e) => setData('tags', e.target.value)}
                        error={errors.tags}
                        placeholder="Pharmacology, Lecture, Unit 1"
                    />

                    <label className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            checked={data.featured}
                            onChange={(e) => setData('featured', e.target.checked)}
                            className="h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                        />
                        <Label>Featured</Label>
                    </label>

                    <div className="flex items-center gap-3 border-t border-slate-200 pt-5">
                        <Button type="submit" loading={processing}>{isEdit ? 'Update Video' : 'Create Video'}</Button>
                        <Link href="/admin/videos" className="text-sm font-medium text-muted hover:text-ink">Cancel</Link>
                    </div>
                </form>
            </Card>
        </>
    );
}