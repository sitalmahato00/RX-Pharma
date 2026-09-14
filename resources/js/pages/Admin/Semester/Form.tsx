import { Link, router, useForm, usePage } from '@inertiajs/react';
import { Alert, Button, Card, Input, Label, Select } from '@/components/ui';
import { ArrowLeft } from 'lucide-react';

interface Program {
    id: number;
    name: string;
}

interface Semester {
    id: number;
    name: string;
    slug: string;
    program_id: number;
    number: number;
    is_active: boolean;
}

interface Props {
    semester?: Semester;
    programs: Program[];
}

export default function Form({ semester, programs }: Props) {
    const { flash } = usePage<{ flash: { success?: string } }>().props;
    const isEdit = !!semester;

    const { data, setData, post, put, processing, errors } = useForm({
        program_id: semester?.program_id ?? '',
        name: semester?.name ?? '',
        number: semester?.number ?? '',
        is_active: semester?.is_active ?? true,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isEdit) {
            put(`/admin/semesters/${semester!.id}`);
        } else {
            post('/admin/semesters');
        }
    };

    return (
        <>
            <Link href="/admin/semesters" className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-ink">
                <ArrowLeft className="h-4 w-4" /> Back to Semesters
            </Link>

            {flash.success && <Alert type="success" dismissible>{flash.success}</Alert>}

            <Card className="mx-auto max-w-2xl p-6">
                <h1 className="mb-6 text-xl font-bold text-ink">{isEdit ? 'Edit Semester' : 'Create Semester'}</h1>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <Select
                        id="program_id"
                        label="Program"
                        value={data.program_id}
                        onChange={(e) => setData('program_id', e.target.value)}
                        error={errors.program_id}
                        required
                    >
                        <option value="">Select Program</option>
                        {programs.map((p) => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                    </Select>

                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            id="name"
                            label="Name"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            error={errors.name}
                            required
                        />
                        <Input
                            id="number"
                            label="Number"
                            type="number"
                            min={1}
                            max={12}
                            value={data.number}
                            onChange={(e) => setData('number', e.target.value)}
                            error={errors.number}
                            required
                        />
                    </div>

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
                        <Button type="submit" loading={processing}>{isEdit ? 'Update Semester' : 'Create Semester'}</Button>
                        <Link href="/admin/semesters" className="text-sm font-medium text-muted hover:text-ink">Cancel</Link>
                    </div>
                </form>
            </Card>
        </>
    );
}