import { Head } from '@inertiajs/react';
import { Home, Lock } from 'lucide-react';
import { Button, EmptyState } from '@/components/ui';

export default function Forbidden() {
    return (
        <>
            <Head title="403 – Access Denied" />
            <div className="flex min-h-[70vh] flex-col items-center justify-center px-4">
                <p className="text-7xl font-black tracking-tight text-red-600">403</p>
                <EmptyState
                    icon={Lock}
                    title="Access denied"
                    description="You do not have permission to view this page."
                    action={
                        <Button variant="primary" href="/">
                            <Home className="h-4 w-4" aria-hidden="true" />
                            Back to home
                        </Button>
                    }
                />
            </div>
        </>
    );
}