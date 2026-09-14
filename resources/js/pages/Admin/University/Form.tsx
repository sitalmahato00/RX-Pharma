import { Link, router, useForm, usePage } from '@inertiajs/react';
import { Alert, Button, Card, Input, Label, Textarea } from '@/components/ui';
import { ArrowLeft } from 'lucide-react';

interface University {
    id: number;
    name: string;
    slug: string;
    code?: string | null;
    acronym?: string | null;
    location?: string | null;
    description?: string | null;
    website?: string | null;
    is_active: boolean;
}

interface Props {
    university?: University;
}

export default function Form({ university }: Props) {
    const { flash } = usePage<{ flash: { success?: string } }>().props;
    const isEdit = !!university;

    const { data, setData, post, put, processing, errors } = useForm({
        name: university?.name ?? '',
        code: university?.code ?? '',
        acronym: university?.acronym ?? '',
        location: university?.location ?? '',
        website: university?.website ?? '',
        description: university?.description ?? '',
        is_active: university?.is_active ?? true,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isEdit) {
            put(`/admin/universities/${university!.id}`);
        } else {
            post('/admin/universities');
        }
    };

    return (
        <>
            <Link href="/admin/universities" className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-ink">
                <ArrowLeft className="h-4 w-4" /> Back to Universities
            </Link>

            {flash.success && <Alert type="success" dismissible>{flash.success}</Alert>}

            <Card className="mx-auto max-w-2xl p-6">
                <h1 className="mb-6 text-xl font-bold text-ink">{isEdit ? 'Edit University' : 'Create University'}</h1>

                <form onSubmit={handleSubmit} className="space-y-5">
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
                            id="acronym"
                            label="Acronym"
                            value={data.acronym}
                            onChange={(e) => setData('acronym', e.target.value)}
                            error={errors.acronym}
                        />
                        <Input
                            id="code"
                            label="Code"
                            value={data.code}
                            onChange={(e) => setData('code', e.target.value)}
                            error={errors.code}
                        />
                    </div>

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
                        <Button type="submit" loading={processing}>{isEdit ? 'Update University' : 'Create University'}</Button>
                        <Link href="/admin/universities" className="text-sm font-medium text-muted hover:text-ink">Cancel</Link>
                    </div>
                </form>
            </Card>
        </>
    );
}
