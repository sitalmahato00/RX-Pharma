import { Link, useForm, usePage } from '@inertiajs/react';
import { Alert, Button, Card, FileUpload, Input, Label, MediaPreview, Select, Textarea } from '@/components/ui';
import { ArrowLeft } from 'lucide-react';
import AcademicCascade from '@/components/admin/AcademicCascade';

interface PaperResource {
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

interface PreviousPaper {
    id: number;
    resource?: PaperResource;
    year?: number | null;
    exam_type?: string | null;
    file_path?: string | null;
    file_name?: string | null;
    answer_key_path?: string | null;
    has_answer_key: boolean;
}

interface Academy {
    id: number;
    name: string;
}

interface Props {
    paper?: PreviousPaper;
    universities: Academy[];
    colleges: Academy[];
    programs: Academy[];
    semesters: Academy[];
    subjects: Academy[];
    units: Academy[];
    topics: Academy[];
}

export default function Form({ paper, universities }: Props) {
    const { flash } = usePage<{ flash: { success?: string } }>().props;
    const isEdit = !!paper;
    const resource = paper?.resource;

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
        year: paper?.year ?? '',
        exam_type: paper?.exam_type ?? '',
        file_path: paper?.file_path ?? '',
        answer_key_path: paper?.answer_key_path ?? '',
        tags: resource?.tags ? resource.tags.map((t) => t.name).join(', ') : '',
        file: null as File | null,
        answer_key: null as File | null,
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
            put(`/admin/papers/${paper!.id}`, { forceFormData: true });
        } else {
            post('/admin/papers', { forceFormData: true });
        }
    };

    return (
        <>
            <Link href="/admin/papers" className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-ink">
                <ArrowLeft className="h-4 w-4" /> Back to Previous Papers
            </Link>

            {flash.success && <Alert type="success" dismissible>{flash.success}</Alert>}

            <Card className="mx-auto max-w-3xl p-6">
                <h1 className="mb-6 text-xl font-bold text-ink">{isEdit ? 'Edit Paper' : 'Create Paper'}</h1>

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

                        <Input
                            id="year"
                            label="Year"
                            type="number"
                            min={1990}
                            max={2100}
                            value={data.year}
                            onChange={(e) => setData('year', e.target.value)}
                            error={errors.year}
                            required
                        />
                    </div>

                    <Input
                        id="exam_type"
                        label="Exam Type"
                        value={data.exam_type}
                        onChange={(e) => setData('exam_type', e.target.value)}
                        error={errors.exam_type}
                        placeholder="Midterm, Final, ..."
                    />

                    <FileUpload
                        label="Paper File"
                        accept=".pdf,.doc,.docx,.zip"
                        value={data.file}
                        onChange={(f) => setData('file', f)}
                        hint={isEdit && paper?.file_name ? `Leave empty to keep the current file (${paper.file_name}).` : 'pdf, doc, docx or zip (max 50MB)'}
                    />
                    <MediaPreview source={data.file || (isEdit ? paper?.file_path : null)} type="pdf" label="Paper preview" />
                    {errors.file && <p className="mt-1 text-xs text-red-500">{errors.file}</p>}

                    <Input
                        id="file_path"
                        label="File Path"
                        value={data.file_path}
                        onChange={(e) => setData('file_path', e.target.value)}
                        error={errors.file_path}
                        placeholder="/storage/papers/..."
                    />

                    <FileUpload
                        label="Answer Key File"
                        accept=".pdf,.doc,.docx,.zip"
                        value={data.answer_key}
                        onChange={(f) => setData('answer_key', f)}
                        hint={isEdit && paper?.answer_key_path ? 'Leave empty to keep the current answer key.' : 'pdf, doc, docx or zip (max 50MB)'}
                    />
                    <MediaPreview source={data.answer_key || (isEdit ? paper?.answer_key_path : null)} type="pdf" label="Answer key preview" />
                    {errors.answer_key && <p className="mt-1 text-xs text-red-500">{errors.answer_key}</p>}

                    <Input
                        id="answer_key_path"
                        label="Answer Key Path"
                        value={data.answer_key_path}
                        onChange={(e) => setData('answer_key_path', e.target.value)}
                        error={errors.answer_key_path}
                        placeholder="/storage/papers/answers/..."
                    />

                    <Input
                        id="tags"
                        label="Tags (comma separated)"
                        value={data.tags}
                        onChange={(e) => setData('tags', e.target.value)}
                        error={errors.tags}
                        placeholder="Exam, Final, Unit 3"
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
                        <Button type="submit" loading={processing}>{isEdit ? 'Update Paper' : 'Create Paper'}</Button>
                        <Link href="/admin/papers" className="text-sm font-medium text-muted hover:text-ink">Cancel</Link>
                    </div>
                </form>
            </Card>
        </>
    );
}