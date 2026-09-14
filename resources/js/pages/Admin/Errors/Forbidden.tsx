import { Head } from '@inertiajs/react';
import { LayoutDashboard, Lock } from 'lucide-react';
import { Button, EmptyState } from '@/components/ui';

export default function Forbidden() {
    return (
        <>
            <Head title="403 – Access Denied" />
            <EmptyState
                icon={Lock}
                title="403 – Access denied"
                description="You do not have permission to access this part of the admin panel."
                className="min-h-[60vh] py-20"
                action={
                    <Button variant="primary" href="/admin">
                        <LayoutDashboard className="h-4 w-4" aria-hidden="true" />
                        Go to dashboard
                    </Button>
                }
            />
        </>
    );
}