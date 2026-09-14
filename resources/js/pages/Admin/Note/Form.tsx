import { Link, router, useForm, usePage } from '@inertiajs/react';
import { Alert, Button, Card, FileUpload, Input, Label, Select, Textarea } from '@/components/ui';
import { ArrowLeft } from 'lucide-react';
import AcademicCascade from '@/components/admin/AcademicCascade';

interface NoteResource {
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

interface Note {
    id: number;
    resource?: NoteResource;
    cover_image?: string | null;
    file_name?: string | null;
    file_path?: string | null;
    author?: string | null;
}

interface Academy {
    id: number;
    name: string;
}

interface Props {
    note?: Note;
    universities: Academy[];
    colleges: Academy[];
    programs: Academy[];
    semesters: Academy[];
    subjects: Academy[];
    units: Academy[];
    topics: Academy[];
}

interface NoteFormData {
    title: string;
    university_id: number | string;
    college_id: number | string;
    program_id: number | string;
    semester_id: number | string;
    subject_id: number | string;
    unit_id: number | string;
    topic_id: number | string;
    description: string;
    status: string;
    featured: boolean;
    cover_image: string;
    author: string;
    tags: string;
    pdf: File | null;
}

export default function Form({ note, universities }: Props) {
    const { flash } = usePage<{ flash: { success?: string } }>().props;
    const isEdit = !!note;
    const resource = note?.resource;

    const { data, setData, post, put, transform, processing, errors } = useForm<NoteFormData>({
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
        cover_image: note?.cover_image ?? '',
        author: note?.author ?? '',
        tags: resource?.tags ? resource.tags.map((t) => t.name).join(', ') : '',
        pdf: null as File | null,
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
            put(`/admin/notes/${note!.id}`, { forceFormData: true });
        } else {
            post('/admin/notes', { forceFormData: true });
        }
    };

    return (
        <>
            <Link href="/admin/notes" className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-ink">
                <ArrowLeft className="h-4 w-4" /> Back to Notes
            </Link>

            {flash.success && <Alert type="success" dismissible>{flash.success}</Alert>}

            <Card className="mx-auto max-w-3xl p-6">
                <h1 className="mb-6 text-xl font-bold text-ink">{isEdit ? 'Edit Note' : 'Create Note'}</h1>

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
                        onChange={(field, value) => setData(field as keyof NoteFormData, value as never)}
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
                            onChange={(e) => setData('status', e.target.value)}
                            error={errors.status}
                        >
                            <option value="draft">Draft</option>
                            <option value="published">Published</option>
                            <option value="archived">Archived</option>
                        </Select>

                        <Input
                            id="author"
                            label="Author"
                            value={data.author}
                            onChange={(e) => setData('author', e.target.value)}
                            error={errors.author}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            id="cover_image"
                            label="Cover Image Path"
                            value={data.cover_image}
                            onChange={(e) => setData('cover_image', e.target.value)}
                            error={errors.cover_image}
                            placeholder="/storage/notes/covers/..."
                        />

                        <Input
                            id="tags"
                            label="Tags (comma separated)"
                            value={data.tags}
                            onChange={(e) => setData('tags', e.target.value)}
                            error={errors.tags}
                            placeholder="Pharmacology, Exam, Unit 1"
                        />
                    </div>

                    <FileUpload
                        label="PDF File"
                        accept=".pdf"
                        value={data.pdf}
                        onChange={(f) => setData('pdf', f)}
                        hint="Upload a PDF (max 50MB)"
                    />
                    {errors.pdf && <p className="mt-1 text-xs text-red-500">{errors.pdf}</p>}

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
                        <Button type="submit" loading={processing}>{isEdit ? 'Update Note' : 'Create Note'}</Button>
                        <Link href="/admin/notes" className="text-sm font-medium text-muted hover:text-ink">Cancel</Link>
                    </div>
                </form>
            </Card>
        </>
    );
}