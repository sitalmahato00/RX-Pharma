import { Link, useForm, usePage } from '@inertiajs/react';
import { Alert, Button, Card, FileUpload, Input, Label, Select, Textarea } from '@/components/ui';
import { ArrowLeft } from 'lucide-react';
import AcademicCascade from '@/components/admin/AcademicCascade';

interface LiteratureResource {
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

interface Literature {
    id: number;
    resource?: LiteratureResource;
    category?: string | null;
    author?: string | null;
    organization?: string | null;
    year?: number | null;
    file_path?: string | null;
    external_url?: string | null;
    cover_image?: string | null;
}

interface Academy {
    id: number;
    name: string;
}

interface Category {
    value: string;
    label: string;
}

interface Props {
    literature?: Literature;
    universities: Academy[];
    colleges: Academy[];
    programs: Academy[];
    semesters: Academy[];
    subjects: Academy[];
    units: Academy[];
    topics: Academy[];
    categories: Category[];
}

export default function Form({ literature, universities, categories }: Props) {
    const { flash } = usePage<{ flash: { success?: string } }>().props;
    const isEdit = !!literature;
    const resource = literature?.resource;

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
        category: literature?.category ?? '',
        author: literature?.author ?? '',
        organization: literature?.organization ?? '',
        year: literature?.year ?? '',
        file_path: literature?.file_path ?? '',
        external_url: literature?.external_url ?? '',
        cover_image: literature?.cover_image ?? '',
        tags: resource?.tags ? resource.tags.map((t) => t.name).join(', ') : '',
        file: null as File | null,
        cover_image_file: null as File | null,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        transform(() => ({
            ...data,
            year: data.year === '' ? undefined : data.year,
            tags: data.tags
                ? data.tags.split(',').map((t: string) => t.trim()).filter(Boolean)
                : [],
        }));
        if (isEdit) {
            put(`/admin/literature/${literature!.id}`, { forceFormData: true });
        } else {
            post('/admin/literature', { forceFormData: true });
        }
    };

    return (
        <>
            <Link href="/admin/literature" className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-ink">
                <ArrowLeft className="h-4 w-4" /> Back to Literature
            </Link>

            {flash.success && <Alert type="success" dismissible>{flash.success}</Alert>}

            <Card className="mx-auto max-w-3xl p-6">
                <h1 className="mb-6 text-xl font-bold text-ink">{isEdit ? 'Edit Literature' : 'Create Literature'}</h1>

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
                            id="category"
                            label="Category"
                            value={data.category}
                            onChange={(e) => setData('category', e.target.value)}
                            error={errors.category}
                            required
                        >
                            <option value="">Select category</option>
                            {categories.map((c) => (
                                <option key={c.value} value={c.value}>{c.label}</option>
                            ))}
                        </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            id="author"
                            label="Author"
                            value={data.author}
                            onChange={(e) => setData('author', e.target.value)}
                            error={errors.author}
                        />
                        <Input
                            id="organization"
                            label="Organization"
                            value={data.organization}
                            onChange={(e) => setData('organization', e.target.value)}
                            error={errors.organization}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            id="year"
                            label="Year"
                            type="number"
                            min={1900}
                            max={2100}
                            value={data.year}
                            onChange={(e) => setData('year', e.target.value)}
                            error={errors.year}
                        />
                        <Input
                            id="external_url"
                            label="External URL"
                            value={data.external_url}
                            onChange={(e) => setData('external_url', e.target.value)}
                            error={errors.external_url}
                            placeholder="https://..."
                        />
                    </div>

                    <FileUpload
                        label="Document File"
                        accept=".pdf,.doc,.docx,.txt"
                        value={data.file}
                        onChange={(f) => setData('file', f)}
                        hint={isEdit && literature?.file_path ? 'Leave empty to keep the current file.' : 'pdf, doc, docx or txt (max 50MB)'}
                    />
                    {errors.file && <p className="mt-1 text-xs text-red-500">{errors.file}</p>}

                    <Input
                        id="file_path"
                        label="File Path"
                        value={data.file_path}
                        onChange={(e) => setData('file_path', e.target.value)}
                        error={errors.file_path}
                        placeholder="/storage/literature/..."
                    />

                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            id="cover_image"
                            label="Cover Image Path"
                            value={data.cover_image}
                            onChange={(e) => setData('cover_image', e.target.value)}
                            error={errors.cover_image}
                            placeholder="/storage/literature/covers/..."
                        />
                        <FileUpload
                            label="Cover Image"
                            accept="image/*"
                            value={data.cover_image_file}
                            onChange={(f) => setData('cover_image_file', f)}
                            hint="Or fill the path above."
                        />
                    </div>
                    {errors.cover_image_file && <p className="mt-1 text-xs text-red-500">{errors.cover_image_file}</p>}

                    <Input
                        id="tags"
                        label="Tags (comma separated)"
                        value={data.tags}
                        onChange={(e) => setData('tags', e.target.value)}
                        error={errors.tags}
                        placeholder="Guidelines, Reference, Unit 2"
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
                        <Button type="submit" loading={processing}>{isEdit ? 'Update Literature' : 'Create Literature'}</Button>
                        <Link href="/admin/literature" className="text-sm font-medium text-muted hover:text-ink">Cancel</Link>
                    </div>
                </form>
            </Card>
        </>
    );
}