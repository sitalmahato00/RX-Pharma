import { Head, Link, useForm } from '@inertiajs/react';
import { Card, Input, Button } from '@/components/ui';

export default function Login() {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        post('/login', {
            preserveScroll: true,
            onSuccess: () => reset('password'),
        });
    };

    return (
        <>
            <Head title="Login" />
            <Card className="w-full max-w-md p-6 sm:p-8">
                <h1 className="text-xl font-bold text-ink">Welcome back</h1>
                <p className="mt-1 text-sm text-muted">Log in to continue your pharmacy studies.</p>

                <form onSubmit={submit} className="mt-6 space-y-4">
                    {errors.email && (
                        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
                            {errors.email}
                        </div>
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

                    <div>
                        <Input
                            id="password"
                            type="password"
                            label="Password"
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            autoComplete="current-password"
                            error={errors.password}
                        />
                        <div className="mt-1 text-right">
                            <Link href="/forgot-password" className="text-xs font-medium text-primary-700 hover:text-primary-800">
                                Forgot password?
                            </Link>
                        </div>
                    </div>

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
                        Log in
                    </Button>

                    <p className="pt-1 text-center text-sm text-muted">
                        Don&apos;t have an account?{' '}
                        <Link href="/register" className="font-medium text-primary-700 hover:text-primary-800">
                            Create one
                        </Link>
                    </p>
                </form>

                <div className="mt-6 border-t border-slate-200 pt-4 text-center">
                    <Link href="/admin/login" className="text-xs font-medium text-slate-500 hover:text-primary-700">
                        Admin login
                    </Link>
                </div>
            </Card>
        </>
    );
}