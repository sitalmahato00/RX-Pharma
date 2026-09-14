import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { Button, Card, Input } from '@/components/ui';

interface ResetPageProps {
    token: string;
    email?: string | null;
}

export default function ResetPassword({ token, email }: ResetPageProps) {
    const { flash } = usePage().props as unknown as { flash: { success: string | null; error: string | null; warning: string | null } };
    const { data, setData, post, processing, errors } = useForm({
        token,
        email: email ?? '',
        password: '',
        password_confirmation: '',
    });

    const submit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        post('/reset-password', {
            preserveScroll: true,
        });
    };

    return (
        <>
            <Head title="Reset Password" />
            <Card className="w-full max-w-md p-6 sm:p-8">
                <h1 className="text-xl font-bold text-ink">Set a new password</h1>
                <p className="mt-1 text-sm text-muted">Choose a strong new password for your account.</p>

                <form onSubmit={submit} className="mt-6 space-y-4">
                    {flash.success && (
                        <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-800">{flash.success}</div>
                    )}
                    {errors.email && (
                        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">{errors.email}</div>
                    )}

                    <Input
                        id="email"
                        type="email"
                        label="Email address"
                        value={data.email}
                        onChange={(e) => setData('email', e.target.value)}
                        autoComplete="email"
                        error={errors.email}
                    />

                    <Input
                        id="password"
                        type="password"
                        label="New password"
                        value={data.password}
                        onChange={(e) => setData('password', e.target.value)}
                        autoComplete="new-password"
                        error={errors.password}
                    />

                    <Input
                        id="password_confirmation"
                        type="password"
                        label="Confirm new password"
                        value={data.password_confirmation}
                        onChange={(e) => setData('password_confirmation', e.target.value)}
                        autoComplete="new-password"
                        error={errors.password_confirmation}
                    />

                    <Button type="submit" className="w-full" loading={processing} disabled={processing}>
                        Reset password
                    </Button>

                    <p className="pt-1 text-center text-sm text-muted">
                        <Link href="/login" className="font-medium text-primary-700 hover:text-primary-800">
                            Back to login
                        </Link>
                    </p>
                </form>
            </Card>
        </>
    );
}