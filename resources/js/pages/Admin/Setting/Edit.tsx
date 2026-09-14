import { Head, useForm, usePage } from '@inertiajs/react';
import { Alert, Button, Card, Input, Textarea } from '@/components/ui';

interface FieldDef {
    key: string;
    label: string;
    type: 'text' | 'textarea' | 'number' | 'color' | 'switch';
    span?: boolean;
}

const fieldDefs: FieldDef[] = [
    { key: 'site_name', label: 'Site name', type: 'text' },
    { key: 'site_tagline', label: 'Site tagline', type: 'text' },
    { key: 'support_email', label: 'Support email', type: 'text' },
    { key: 'contact_email', label: 'Contact email', type: 'text' },
    { key: 'primary_color', label: 'Primary color', type: 'color' },
    { key: 'max_file_size_mb', label: 'Max upload size (MB)', type: 'number' },
    { key: 'allow_registration', label: 'Allow registration', type: 'switch' },
    { key: 'maintenance_mode', label: 'Maintenance mode', type: 'switch' },
    { key: 'analytics_id', label: 'Analytics ID', type: 'text' },
    { key: 'footer_text', label: 'Footer text', type: 'textarea', span: true },
    { key: 'meta_description', label: 'Meta description', type: 'textarea', span: true },
];

interface SettingsProps {
    settings: Record<string, string | number | boolean>;
    flash?: { success?: string; error?: string };
    [key: string]: unknown;
}

export default function Edit({ settings, flash }: SettingsProps) {
    const initial: Record<string, string | number | boolean> = {};
    for (const field of fieldDefs) {
        initial[field.key] = settings[field.key] ?? (field.type === 'number' ? '' : field.type === 'switch' ? false : '');
    }

    const form = useForm<Record<string, string | number | boolean>>(initial);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        form.transform((data) => {
            const out: Record<string, string | number | boolean | null> = { ...data };
            for (const field of fieldDefs) {
                if (field.type === 'number') {
                    const value = data[field.key];
                    out[field.key] = value === '' || value === null || value === undefined ? null : Number(value);
                }
            }
            return out;
        });
        form.post('/admin/settings', { preserveScroll: true });
    };

    const renderField = (field: FieldDef) => {
        const key = field.key;
        const value = form.data[key];

        if (field.type === 'switch') {
            return (
                <label key={key} className="flex items-center gap-2 text-sm font-medium text-slate-700">
                    <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-300"
                        checked={Boolean(value)}
                        onChange={(e) => form.setData(key, e.target.checked)}
                    />
                    {field.label}
                </label>
            );
        }

        const labelProps = { label: field.label, id: `settings-${key}` };
        const error = (form.errors as Record<string, string>)[key];

        if (field.type === 'textarea') {
            return (
                <div key={key} className={field.span ? 'sm:col-span-2' : undefined}>
                    <Textarea
                        {...labelProps}
                        rows={3}
                        value={String(value ?? '')}
                        onChange={(e) => form.setData(key, e.target.value)}
                        error={error}
                    />
                </div>
            );
        }

        if (field.type === 'color') {
            return (
                <div key={key}>
                    <p className="mb-1.5 block text-sm font-medium text-slate-700">{field.label}</p>
                    <div className="flex items-center gap-2">
                        <input
                            type="color"
                            value={String(value ?? '#2563EB')}
                            onChange={(e) => form.setData(key, e.target.value)}
                            className="h-10 w-14 cursor-pointer rounded border border-slate-300 bg-white p-1"
                        />
                        <Input
                            value={String(value ?? '')}
                            onChange={(e) => form.setData(key, e.target.value)}
                            error={error}
                        />
                    </div>
                </div>
            );
        }

        return (
            <Input
                key={key}
                {...labelProps}
                type={field.type === 'number' ? 'number' : 'text'}
                value={String(value ?? '')}
                onChange={(e) => form.setData(key, e.target.value)}
                error={error}
            />
        );
    };

    return (
        <div className="mx-auto max-w-3xl space-y-6">
            <Head title="Settings" />
            <div>
                <h1 className="text-2xl font-bold text-ink">Settings</h1>
                <p className="text-sm text-muted">Global platform configuration.</p>
            </div>

            {flash?.success && <Alert type="success">{flash.success}</Alert>}
            {flash?.error && <Alert type="error">{flash.error}</Alert>}

            <form onSubmit={handleSubmit} className="space-y-6">
                <Card className="space-y-4 p-6">
                    <h2 className="text-lg font-semibold text-ink">Site configuration</h2>
                    <div className="grid gap-4 sm:grid-cols-2">
                        {fieldDefs.map((field) => renderField(field))}
                    </div>
                </Card>

                <div className="flex justify-end">
                    <Button type="submit" loading={form.processing}>
                        Save settings
                    </Button>
                </div>
            </form>
        </div>
    );
}