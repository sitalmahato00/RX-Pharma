import { Link, router, useForm, usePage } from '@inertiajs/react';
import { Alert, Button, Card, Input, Label, Select, Textarea } from '@/components/ui';
import { ArrowLeft } from 'lucide-react';

interface University {
    id: number;
    name: string;
}

interface College {
    id: number;
    name: string;
    slug: string;
    university_id: number;
    location?: string | null;
    address?: string | null;
    description?: string | null;
    website?: string | null;
    is_active: boolean;
}

interface Props {
    college?: College;
    universities: University[];
}

export default function Form({ college, universities }: Props) {
    const { flash } = usePage<{ flash: { success?: string } }>().props;
    const isEdit = !!college;

    const { data, setData, post, put, processing, errors } = useForm({
        university_id: college?.university_id ?? '',
        name: college?.name ?? '',
        location: college?.location ?? '',
        address: college?.address ?? '',
        description: college?.description ?? '',
        website: college?.website ?? '',
        is_active: college?.is_active ?? true,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isEdit) {
            put(`/admin/colleges/${college!.id}`);
        } else {
            post('/admin/colleges');
        }
    };

    return (
        <>
            <Link href="/admin/colleges" className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-ink">
                <ArrowLeft className="h-4 w-4" /> Back to Colleges
            </Link>

            {flash.success && <Alert type="success" dismissible>{flash.success}</Alert>}

            <Card className="mx-auto max-w-2xl p-6">
                <h1 className="mb-6 text-xl font-bold text-ink">{isEdit ? 'Edit College' : 'Create College'}</h1>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <Select
                        id="university_id"
                        label="University"
                        value={data.university_id}
                        onChange={(e) => setData('university_id', e.target.value)}
                        error={errors.university_id}
                        required
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
                            id="location"
                            label="Location"
                            value={data.location}
                            onChange={(e) => setData('location', e.target.value)}
                            error={errors.location}
                        />
                        <Input
                            id="website"
                            label="Website"
                            type="url"
                            value={data.website}
                            onChange={(e) => setData('website', e.target.value)}
                            error={errors.website}
                            placeholder="https://..."
                        />
                    </div>

                    <Textarea
                        id="address"
                        label="Address"
                        value={data.address}
                        onChange={(e) => setData('address', e.target.value)}
                        error={errors.address}
                        rows={2}
                    />

                    <Textarea
                        id="description"
                        label="Description"
                        value={data.description}
                        onChange={(e) => setData('description', e.target.value)}
                        error={errors.description}
                        rows={3}
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
                        <Button type="submit" loading={processing}>{isEdit ? 'Update College' : 'Create College'}</Button>
                        <Link href="/admin/colleges" className="text-sm font-medium text-muted hover:text-ink">Cancel</Link>
                    </div>
                </form>
            </Card>
        </>
    );
}