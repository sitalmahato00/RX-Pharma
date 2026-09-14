import { Link, router, useForm, usePage } from '@inertiajs/react';
import { Alert, Button, Card, Input, Label, Select, Textarea } from '@/components/ui';
import { ArrowLeft } from 'lucide-react';

interface University {
    id: number;
    name: string;
}

interface Program {
    id: number;
    name: string;
    slug: string;
    university_id?: number | null;
    code?: string | null;
    level?: string | null;
    duration_years?: number | null;
    description?: string | null;
    is_active: boolean;
}

interface Props {
    program?: Program;
    universities: University[];
}

export default function Form({ program, universities }: Props) {
    const { flash } = usePage<{ flash: { success?: string } }>().props;
    const isEdit = !!program;

    const { data, setData, post, put, processing, errors } = useForm({
        university_id: program?.university_id ?? '',
        name: program?.name ?? '',
        code: program?.code ?? '',
        level: program?.level ?? '',
        duration_years: program?.duration_years ?? '',
        description: program?.description ?? '',
        is_active: program?.is_active ?? true,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isEdit) {
            put(`/admin/programs/${program!.id}`);
        } else {
            post('/admin/programs');
        }
    };

    return (
        <>
            <Link href="/admin/programs" className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-ink">
                <ArrowLeft className="h-4 w-4" /> Back to Programs
            </Link>

            {flash.success && <Alert type="success" dismissible>{flash.success}</Alert>}

            <Card className="mx-auto max-w-2xl p-6">
                <h1 className="mb-6 text-xl font-bold text-ink">{isEdit ? 'Edit Program' : 'Create Program'}</h1>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <Select
                        id="university_id"
                        label="University"
                        value={data.university_id}
                        onChange={(e) => setData('university_id', e.target.value)}
                        error={errors.university_id}
                    >
                        <option value="">Select University</option>
                        {universities.map((u) => (
                            <option key={u.id} value={u.id}>{u.name}</option>
                        ))}
                    </Select>

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
                            id="level"
                            label="Level"
                            value={data.level}
                            onChange={(e) => setData('level', e.target.value)}
                            error={errors.level}
                        />
                    </div>

                    <Input
                        id="duration_years"
                        label="Duration (years)"
                        type="number"
                        min={1}
                        max={10}
                        value={data.duration_years}
                        onChange={(e) => setData('duration_years', e.target.value)}
                        error={errors.duration_years}
                    />

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
                        <Button type="submit" loading={processing}>{isEdit ? 'Update Program' : 'Create Program'}</Button>
                        <Link href="/admin/programs" className="text-sm font-medium text-muted hover:text-ink">Cancel</Link>
                    </div>
                </form>
            </Card>
        </>
    );
}