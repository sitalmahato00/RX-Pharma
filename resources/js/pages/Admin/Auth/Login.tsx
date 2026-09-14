import { Head, Link, useForm } from '@inertiajs/react';
import { Alert, Button, Card, Input } from '@/components/ui';

export default function Login() {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        post('/admin/login', {
            preserveScroll: true,
        });
    };

    return (
        <>
            <Head title="Admin Login" />
            <Card className="w-full max-w-md p-6 sm:p-8">
                <div>
                    <p className="text-xs font-medium uppercase tracking-widest text-primary-600">Admin Panel</p>
                    <h1 className="mt-1 text-xl font-bold text-ink">Admin login</h1>
                    <p className="mt-1 text-sm text-muted">Restricted access for platform administrators.</p>
                </div>

                <form onSubmit={submit} className="mt-6 space-y-4">
                    {errors.email && (
                        <Alert type="error" title="Unable to log in">
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
                    />

                    <Input
                        id="password"
                        type="password"
                        label="Password"
                        value={data.password}
                        onChange={(e) => setData('password', e.target.value)}
                        autoComplete="current-password"
                        error={errors.password}
                    />

                    <label className="flex cursor-pointer items-center gap-2">
                        <input
                            type="checkbox"
                            id="remember"
                            checked={data.remember}
                            onChange={(e) => setData('remember', e.target.checked)}
                            className="h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-300"
                        />
                        <span className="text-sm text-slate-700">Remember me</span>
                    </label>

                    <Button type="submit" className="w-full" loading={processing} disabled={processing}>
                        Sign in
                    </Button>
                </form>

                <div className="mt-6 border-t border-slate-200 pt-4 text-center">
                    <Link href="/login" className="text-xs font-medium text-slate-500 hover:text-primary-700">
                        Student login
                    </Link>
                </div>
            </Card>
        </>
    );
}