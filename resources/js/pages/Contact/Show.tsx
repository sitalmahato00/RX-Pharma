import { Head, useForm, usePage } from '@inertiajs/react';
import { Mail, MapPin, Phone } from 'lucide-react';
import { Alert, Button, Card, Input, Textarea } from '@/components/ui';

interface ContactPageProps {
    settings?: {
        contact_email?: string | null;
        contact_phone?: string | null;
        contact_address?: string | null;
    } | null;
}

export default function Show({ settings }: ContactPageProps) {
    const { app, flash } = usePage<{
        app: { name: string };
        flash: { success: string | null; error: string | null; warning: string | null };
    }>().props;

    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        message: '',
    });

    const submit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        post('/contact', {
            preserveScroll: true,
            onSuccess: () => reset('name', 'email', 'message'),
        });
    };

    const email = settings?.contact_email ?? null;
    const phone = settings?.contact_phone ?? null;
    const address = settings?.contact_address ?? null;

    return (
        <>
            <Head title="Contact" />
            <div className="bg-gradient-to-r from-primary-800 to-primary-600">
                <div className="mx-auto max-w-7xl px-4 py-14 text-center sm:px-6 sm:py-16 lg:px-8">
                    <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">Contact us</h1>
                    <p className="mx-auto mt-3 max-w-2xl text-primary-100 sm:text-lg">
                        Questions, feedback or corrections? We would love to hear from you.
                    </p>
                </div>
            </div>

            <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                    <div className="space-y-4 lg:col-span-1">
                        <h2 className="text-lg font-bold text-ink">Get in touch</h2>
                        <Card className="space-y-4 p-5">
                            <div className="flex items-start gap-3">
                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary-600">
                                    <Mail className="h-4 w-4" aria-hidden="true" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-ink">Email</p>
                                    <p className="text-sm text-muted">
                                        {email ? (
                                            <a href={`mailto:${email}`} className="text-primary-700 hover:text-primary-800">
                                                {email}
                                            </a>
                                        ) : (
                                            `Support for ${app.name}`
                                        )}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary-600">
                                    <Phone className="h-4 w-4" aria-hidden="true" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-ink">Phone</p>
                                    <p className="text-sm text-muted">{phone ?? 'Not available'}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary-600">
                                    <MapPin className="h-4 w-4" aria-hidden="true" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-ink">Location</p>
                                    <p className="text-sm text-muted">{address ?? 'Online platform'}</p>
                                </div>
                            </div>
                        </Card>
                    </div>

                    <div className="lg:col-span-2">
                        <Card className="p-6 sm:p-8">
                            <h2 className="text-lg font-bold text-ink">Send us a message</h2>
                            <p className="mt-1 text-sm text-muted">We usually respond within a day or two.</p>

                            <form onSubmit={submit} className="mt-6 space-y-4">
                                {flash.success && <Alert type="success">{flash.success}</Alert>}
                                {flash.error && (
                                    <Alert type="error" title="Something went wrong">
                                        {flash.error}
                                    </Alert>
                                )}

                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <Input
                                        id="name"
                                        type="text"
                                        label="Your name"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        autoComplete="name"
                                        autoFocus
                                        error={errors.name}
                                    />
                                    <Input
                                        id="email"
                                        type="email"
                                        label="Your email"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        autoComplete="email"
                                        error={errors.email}
                                    />
                                </div>

                                <Textarea
                                    id="message"
                                    label="Message"
                                    rows={6}
                                    value={data.message}
                                    onChange={(e) => setData('message', e.target.value)}
                                    placeholder="How can we help you?"
                                    error={errors.message}
                                />

                                <Button type="submit" loading={processing} disabled={processing}>
                                    Send message
                                </Button>
                            </form>
                        </Card>
                    </div>
                </div>
            </div>
        </>
    );
}