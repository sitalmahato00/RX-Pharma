import { Head } from '@inertiajs/react';
import { Compass, LayoutDashboard } from 'lucide-react';
import { Button, EmptyState } from '@/components/ui';

export default function NotFound() {
    return (
        <>
            <Head title="404 – Page Not Found" />
            <EmptyState
                icon={Compass}
                title="404 – Page not found"
                description="The admin page you are looking for does not exist or has been moved."
                className="min-h-[60vh] py-20"
                action={
                    <div className="flex flex-wrap justify-center gap-2">
                        <Button variant="primary" href="/admin">
                            <LayoutDashboard className="h-4 w-4" aria-hidden="true" />
                            Go to dashboard
                        </Button>
                        <Button variant="secondary" href="/">
                            View site
                        </Button>
                    </div>
                }
            />
        </>
    );
}