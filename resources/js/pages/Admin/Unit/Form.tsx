import { Link, router, useForm, usePage } from '@inertiajs/react';
import { Alert, Button, Card, Input, Label, Select, Textarea } from '@/components/ui';
import { ArrowLeft } from 'lucide-react';

interface Subject {
    id: number;
    name: string;
}

interface Unit {
    id: number;
    name: string;
    slug: string;
    subject_id: number;
    sort_order: number;
    description?: string | null;
    is_active: boolean;
}

interface Props {
    unit?: Unit;
    subjects: Subject[];
}

export default function Form({ unit, subjects }: Props) {
    const { flash } = usePage<{ flash: { success?: string } }>().props;
    const isEdit = !!unit;

    const { data, setData, post, put, processing, errors } = useForm({
        subject_id: unit?.subject_id ?? '',
        name: unit?.name ?? '',
        sort_order: unit?.sort_order ?? '',
        description: unit?.description ?? '',
        is_active: unit?.is_active ?? true,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isEdit) {
            put(`/admin/units/${unit!.id}`);
        } else {
            post('/admin/units');
        }
    };

    return (
        <>
            <Link href="/admin/units" className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-ink">
                <ArrowLeft className="h-4 w-4" /> Back to Units
            </Link>

            {flash.success && <Alert type="success" dismissible>{flash.success}</Alert>}

            <Card className="mx-auto max-w-2xl p-6">
                <h1 className="mb-6 text-xl font-bold text-ink">{isEdit ? 'Edit Unit' : 'Create Unit'}</h1>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <Select
                        id="subject_id"
                        label="Subject"
                        value={data.subject_id}
                        onChange={(e) => setData('subject_id', e.target.value)}
                        error={errors.subject_id}
                        required
                    >
                        <option value="">Select Subject</option>
                        {subjects.map((s) => (
                            <option key={s.id} value={s.id}>{s.name}</option>
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
                            id="sort_order"
                            label="Sort Order"
                            type="number"
                            min={0}
                            value={data.sort_order}
                            onChange={(e) => setData('sort_order', e.target.value)}
                            error={errors.sort_order}
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
                        <Button type="submit" loading={processing}>{isEdit ? 'Update Unit' : 'Create Unit'}</Button>
                        <Link href="/admin/units" className="text-sm font-medium text-muted hover:text-ink">Cancel</Link>
                    </div>
                </form>
            </Card>
        </>
    );
}