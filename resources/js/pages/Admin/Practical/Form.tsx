import { Link, useForm, usePage } from '@inertiajs/react';
import { Alert, Button, Card, FileUpload, Input, Label, Select, Textarea } from '@/components/ui';
import { ArrowLeft } from 'lucide-react';
import AcademicCascade from '@/components/admin/AcademicCascade';

interface PracticalResourceModel {
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

interface Practical {
    id: number;
    resource?: PracticalResourceModel;
    practical_type?: string | null;
    resource_path?: string | null;
    thumbnail?: string | null;
    steps?: string[] | null;
}

interface Academy {
    id: number;
    name: string;
}

interface PracticalType {
    value: string;
    label: string;
}

interface Props {
    practical?: Practical;
    universities: Academy[];
    colleges: Academy[];
    programs: Academy[];
    semesters: Academy[];
    subjects: Academy[];
    units: Academy[];
    topics: Academy[];
    practicalTypes: PracticalType[];
}

export default function Form({ practical, universities, practicalTypes }: Props) {
    const { flash } = usePage<{ flash: { success?: string } }>().props;
    const isEdit = !!practical;
    const resource = practical?.resource;

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
        practical_type: practical?.practical_type ?? '',
        resource_path: practical?.resource_path ?? '',
        steps: practical?.steps ? practical.steps.join('\n') : '',
        tags: resource?.tags ? resource.tags.map((t) => t.name).join(', ') : '',
        resource_file: null as File | null,
        thumbnail: null as File | null,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        transform(() => ({
            ...data,
            steps: data.steps
                ? data.steps.split('\n').map((s: string) => s.trim()).filter(Boolean)
                : [],
            tags: data.tags
                ? data.tags.split(',').map((t: string) => t.trim()).filter(Boolean)
                : [],
        }));
        if (isEdit) {
            put(`/admin/practical/${practical!.id}`, { forceFormData: true });
        } else {
            post('/admin/practical', { forceFormData: true });
        }
    };

    return (
        <>
            <Link href="/admin/practical" className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-ink">
                <ArrowLeft className="h-4 w-4" /> Back to Practical
            </Link>

            {flash.success && <Alert type="success" dismissible>{flash.success}</Alert>}

            <Card className="mx-auto max-w-3xl p-6">
                <h1 className="mb-6 text-xl font-bold text-ink">{isEdit ? 'Edit Practical' : 'Create Practical'}</h1>

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
                            id="practical_type"
                            label="Type"
                            value={data.practical_type}
                            onChange={(e) => setData('practical_type', e.target.value)}
                            error={errors.practical_type}
                            required
                        >
                            <option value="">Select type</option>
                            {practicalTypes.map((t) => (
                                <option key={t.value} value={t.value}>{t.label}</option>
                            ))}
                        </Select>
                    </div>

                    <FileUpload
                        label="Resource File"
                        value={data.resource_file}
                        onChange={(f) => setData('resource_file', f)}
                        hint={isEdit && practical?.resource_path ? 'Leave empty to keep the current file.' : 'Any file type (max 50MB)'}
                    />
                    {errors.resource_file && <p className="mt-1 text-xs text-red-500">{errors.resource_file}</p>}

                    <Input
                        id="resource_path"
                        label="Resource Path"
                        value={data.resource_path}
                        onChange={(e) => setData('resource_path', e.target.value)}
                        error={errors.resource_path}
                        placeholder="/storage/practical/..."
                    />

                    <FileUpload
                        label="Thumbnail"
                        accept="image/*"
                        value={data.thumbnail}
                        onChange={(f) => setData('thumbnail', f)}
                        hint="Optional image preview."
                    />
                    {errors.thumbnail && <p className="mt-1 text-xs text-red-500">{errors.thumbnail}</p>}

                    <Textarea
                        id="steps"
                        label="Steps (one per line)"
                        value={data.steps}
                        onChange={(e) => setData('steps', e.target.value)}
                        error={errors.steps}
                        rows={5}
                        placeholder={'Step 1: ...\nStep 2: ...'}
                    />

                    <Input
                        id="tags"
                        label="Tags (comma separated)"
                        value={data.tags}
                        onChange={(e) => setData('tags', e.target.value)}
                        error={errors.tags}
                        placeholder="Lab, Procedure, Unit 4"
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
                        <Button type="submit" loading={processing}>{isEdit ? 'Update Practical' : 'Create Practical'}</Button>
                        <Link href="/admin/practical" className="text-sm font-medium text-muted hover:text-ink">Cancel</Link>
                    </div>
                </form>
            </Card>
        </>
    );
}