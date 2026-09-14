import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { Alert, Button, Card, Input } from '@/components/ui';

export default function ForgotPassword() {
    const { flash } = usePage().props as unknown as { flash: { success: string | null; error: string | null; warning: string | null } };
    const { data, setData, post, processing, errors } = useForm({ email: '' });

    const submit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        post('/forgot-password', {
            preserveScroll: true,
        });
    };

    return (
        <>
            <Head title="Forgot Password" />
            <Card className="w-full max-w-md p-6 sm:p-8">
                <h1 className="text-xl font-bold text-ink">Reset your password</h1>
                <p className="mt-1 text-sm text-muted">
                    Enter your email address and we will send you a link to set a new password.
                </p>

                <form onSubmit={submit} className="mt-6 space-y-4">
                    {flash.success && <Alert type="success">{flash.success}</Alert>}
                    {errors.email && (
                        <Alert type="error" title="Something went wrong">
                            {errors.email}
                        </Alert>
                    )}

                    <Input
                        id="email"
                        type="email"
                        label="Email address"
                        value={data.email}
                        onChange={(e) => setData('email', e.target.value)}
                        autoComplete="email"
                        autoFocus
                        error={errors.email}
                    />

                    <Button type="submit" className="w-full" loading={processing} disabled={processing}>
                        Send reset link
                    </Button>

                    <p className="pt-1 text-center text-sm text-muted">
                        Remembered your password?{' '}
                        <Link href="/login" className="font-medium text-primary-700 hover:text-primary-800">
                            Back to login
                        </Link>
                    </p>
                </form>
            </Card>
        </>
    );
}