import { Link, router, useForm, usePage } from '@inertiajs/react';
import { Alert, Button, Card, Input, Label, Select, Textarea } from '@/components/ui';
import { ArrowLeft } from 'lucide-react';

interface Unit {
    id: number;
    name: string;
    subject_id: number;
    subject?: { id: number; name: string };
}

interface Topic {
    id: number;
    name: string;
    slug: string;
    unit_id: number;
    sort_order: number;
    description?: string | null;
    is_active: boolean;
}

interface Props {
    topic?: Topic;
    units: Unit[];
}

export default function Form({ topic, units }: Props) {
    const { flash } = usePage<{ flash: { success?: string } }>().props;
    const isEdit = !!topic;

    const { data, setData, post, put, processing, errors } = useForm({
        unit_id: topic?.unit_id ?? '',
        name: topic?.name ?? '',
        sort_order: topic?.sort_order ?? '',
        description: topic?.description ?? '',
        is_active: topic?.is_active ?? true,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isEdit) {
            put(`/admin/topics/${topic!.id}`);
        } else {
            post('/admin/topics');
        }
    };

    return (
        <>
            <Link href="/admin/topics" className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-ink">
                <ArrowLeft className="h-4 w-4" /> Back to Topics
            </Link>

            {flash.success && <Alert type="success" dismissible>{flash.success}</Alert>}

            <Card className="mx-auto max-w-2xl p-6">
                <h1 className="mb-6 text-xl font-bold text-ink">{isEdit ? 'Edit Topic' : 'Create Topic'}</h1>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <Select
                        id="unit_id"
                        label="Unit"
                        value={data.unit_id}
                        onChange={(e) => setData('unit_id', e.target.value)}
                        error={errors.unit_id}
                        required
                    >
                        <option value="">Select Unit</option>
                        {units.map((u) => (
                            <option key={u.id} value={u.id}>{u.subject ? `${u.subject.name} — ` : ''}{u.name}</option>
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
                        <Button type="submit" loading={processing}>{isEdit ? 'Update Topic' : 'Create Topic'}</Button>
                        <Link href="/admin/topics" className="text-sm font-medium text-muted hover:text-ink">Cancel</Link>
                    </div>
                </form>
            </Card>
        </>
    );
}