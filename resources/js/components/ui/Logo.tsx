import { Cross, GraduationCap } from 'lucide-react';
import { Link } from '@inertiajs/react';
import { cn } from '@/lib/utils';

export default function Logo({
    className,
    light = false,
    withLink = true,
}: {
    className?: string;
    light?: boolean;
    withLink?: boolean;
}) {
    const content = (
        <div className={cn('flex items-center gap-2', className)}>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-700 text-white">
                <Cross className="h-5 w-5" />
            </div>
            <div className="leading-tight">
                <div className={cn('text-base font-bold tracking-tight', light ? 'text-white' : 'text-primary-800')}>
                    RX <span className={light ? 'text-primary-300' : 'text-secondary'} style={{ color: light ? '#7ab0ff' : '#0B63CE' }}>Pharma</span>
                </div>
                <div className={cn('text-[10px] font-medium uppercase tracking-widest', light ? 'text-primary-200/70' : 'text-muted')}>
                    Learn • Practice • Succeed
                </div>
            </div>
        </div>
    );

    if (!withLink) {
        return content;
    }

    return (
        <Link href="/" className="inline-flex items-center">
            {content}
        </Link>
    );
}