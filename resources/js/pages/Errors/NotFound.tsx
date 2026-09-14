import { Head } from '@inertiajs/react';
import { Compass, Home } from 'lucide-react';
import { Button, EmptyState } from '@/components/ui';

export default function NotFound() {
    return (
        <>
            <Head title="404 – Page Not Found" />
            <div className="flex min-h-[70vh] flex-col items-center justify-center px-4">
                <p className="text-7xl font-black tracking-tight text-primary-700">404</p>
                <EmptyState
                    icon={Compass}
                    title="Page not found"
                    description="The page you are looking for does not exist or has been moved."
                    action={
                        <div className="flex flex-wrap justify-center gap-2">
                            <Button variant="primary" href="/">
                                <Home className="h-4 w-4" aria-hidden="true" />
                                Back to home
                            </Button>
                            <Button variant="secondary" href="/search">
                                Browse resources
                            </Button>
                        </div>
                    }
                />
            </div>
        </>
    );
}