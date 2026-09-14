import { Head, router } from '@inertiajs/react';
import { Home, RefreshCw, Timer } from 'lucide-react';
import { Button, EmptyState } from '@/components/ui';

export default function InvalidToken() {
    return (
        <>
            <Head title="419 – Session Expired" />
            <div className="flex min-h-[70vh] flex-col items-center justify-center px-4">
                <p className="text-7xl font-black tracking-tight text-amber-500">419</p>
                <EmptyState
                    icon={Timer}
                    title="Session expired"
                    description="Your session has expired. Please refresh the page and try again."
                    action={
                        <div className="flex flex-wrap justify-center gap-2">
                            <Button variant="primary" onClick={() => router.reload()}>
                                <RefreshCw className="h-4 w-4" aria-hidden="true" />
                                Try again
                            </Button>
                            <Button variant="secondary" href="/">
                                <Home className="h-4 w-4" aria-hidden="true" />
                                Back to home
                            </Button>
                        </div>
                    }
                />
            </div>
        </>
    );
}