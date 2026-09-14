import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
    icon?: LucideIcon;
    title: string;
    description?: string;
    action?: ReactNode;
    className?: string;
}

export default function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
    return (
        <div className={cn('flex flex-col items-center justify-center py-12 text-center', className)}>
            {Icon && (
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                    <Icon className="h-6 w-6" />
                </div>
            )}
            <h3 className="font-semibold text-ink">{title}</h3>
            {description && <p className="mt-1 text-sm text-muted">{description}</p>}
            {action && <div className="mt-4">{action}</div>}
        </div>
    );
}