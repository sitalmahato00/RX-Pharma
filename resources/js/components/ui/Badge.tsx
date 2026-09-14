import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export type BadgeColor = 'blue' | 'green' | 'orange' | 'red' | 'purple' | 'neutral' | 'amber';
export type BadgeSize = 'sm' | 'md';

const colorClasses: Record<BadgeColor, string> = {
    blue: 'bg-primary-50 text-primary-700 border-primary-200',
    green: 'bg-green-50 text-green-700 border-green-200',
    orange: 'bg-orange-50 text-orange-700 border-orange-200',
    purple: 'bg-purple-50 text-purple-700 border-purple-200',
    red: 'bg-red-50 text-red-700 border-red-200',
    amber: 'bg-amber-50 text-amber-700 border-amber-200',
    neutral: 'bg-slate-100 text-slate-600 border-slate-200',
};

const sizeClasses: Record<BadgeSize, string> = {
    sm: 'px-2 py-0.5 text-[11px]',
    md: 'px-2.5 py-0.5 text-xs',
};

interface BadgeProps {
    children: ReactNode;
    color?: BadgeColor;
    size?: BadgeSize;
    className?: string;
}

export default function Badge({ children, color = 'neutral', size = 'md', className }: BadgeProps) {
    return (
        <span
            className={cn(
                'inline-flex items-center rounded-full border font-medium',
                colorClasses[color],
                sizeClasses[size],
                className
            )}
        >
            {children}
        </span>
    );
}