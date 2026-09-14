import { cn } from '@/lib/utils';

type SkeletonVariant = 'text' | 'card' | 'circle';

interface SkeletonProps {
    className?: string;
    variant?: SkeletonVariant;
    rows?: number;
}

export default function Skeleton({ className, variant = 'text', rows = 1 }: SkeletonProps) {
    const base = 'animate-pulse bg-slate-100 rounded';

    if (variant === 'circle') {
        return <div className={cn(base, 'rounded-full', className)} />;
    }

    if (variant === 'card') {
        return <div className={cn(base, 'h-32 rounded-lg', className)} />;
    }

    return (
        <div className="space-y-2">
            {Array.from({ length: rows }).map((_, i) => (
                <div key={i} className={cn(base, 'h-3 w-full', className)} />
            ))}
        </div>
    );
}