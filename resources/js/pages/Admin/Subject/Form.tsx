import { Link, router, useForm, usePage } from '@inertiajs/react';
import { Alert, Button, Card, Input, Label, Select, Textarea } from '@/components/ui';
import { ArrowLeft } from 'lucide-react';

interface Semester {
    id: number;
    name: string;
    number: number;
}

interface Subject {
    id: number;
    name: string;
    slug: string;
    semester_id?: number | null;
    program_id?: number | null;
    code?: string | null;
    description?: string | null;
    color?: string | null;
    is_active: boolean;
}

interface Props {
    subject?: Subject;
    semesters: Semester[];
}

const semesterLabel = (s: Semester) => `Semester ${s.number} · ${s.name}`;

export default function Form({ subject, semesters }: Props) {
    const { flash } = usePage<{ flash: { success?: string } }>().props;
    const isEdit = !!subject;

    const { data, setData, post, put, processing, errors } = useForm({
        semester_id: subject?.semester_id ?? '',
        program_id: subject?.program_id ?? '',
        name: subject?.name ?? '',
        code: subject?.code ?? '',
        description: subject?.description ?? '',
        color: subject?.color ?? '',
        is_active: subject?.is_active ?? true,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isEdit) {
            put(`/admin/subjects/${subject!.id}`);
        } else {
            post('/admin/subjects');
        }
    };

    return (
        <>
            <Link href="/admin/subjects" className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-ink">
                <ArrowLeft className="h-4 w-4" /> Back to Subjects
            </Link>

            {flash.success && <Alert type="success" dismissible>{flash.success}</Alert>}

            <Card className="mx-auto max-w-2xl p-6">
                <h1 className="mb-6 text-xl font-bold text-ink">{isEdit ? 'Edit Subject' : 'Create Subject'}</h1>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <Select
                        id="semester_id"
                        label="Semester"
                        value={data.semester_id}
                        onChange={(e) => setData('semester_id', e.target.value)}
                        error={errors.semester_id}
                    >
                        <option value="">Select Semester</option>
                        {semesters.map((s) => (
                            <option key={s.id} value={s.id}>{semesterLabel(s)}</option>
                        ))}
                    </Select>

                    <input type="hidden" value={data.program_id} onChange={(e) => setData('program_id', e.target.value)} />

                    <Input
                        id="name"
                        label="Name"
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        error={errors.name}
                        required
                    />

                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            id="code"
                            label="Code"
                            value={data.code}
                            onChange={(e) => setData('code', e.target.value)}
                            error={errors.code}
                        />
                        <Input
                            id="color"
                            label="Color"
                            type="color"
                            value={data.color || '#0b63ce'}
                            onChange={(e) => setData('color', e.target.value)}
                            error={errors.color}
                            className="h-12 p-1.5"
                        />
                    </div>

                    <Textarea
                        id="description"
                        label="Description"
                        value={data.description}
                        onChange={(e) => setData('description', e.target.value)}
                        error={errors.description}
                        rows={4}
                    />

                    <label className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            checked={data.is_active}
                            onChange={(e) => setData('is_active', e.target.checked)}
                            className="h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                        />
                        <Label>Active</Label>
                    </label>

                    <div className="flex items-center gap-3 border-t border-slate-200 pt-5">
                        <Button type="submit" loading={processing}>{isEdit ? 'Update Subject' : 'Create Subject'}</Button>
                        <Link href="/admin/subjects" className="text-sm font-medium text-muted hover:text-ink">Cancel</Link>
                    </div>
                </form>
            </Card>
        </>
    );
}