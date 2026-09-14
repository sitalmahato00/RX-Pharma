import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export type StatAccent = 'primary' | 'green' | 'orange' | 'purple' | 'amber' | 'red';

const accentBg: Record<StatAccent, string> = {
    primary: 'bg-primary-50',
    green: 'bg-green-50',
    orange: 'bg-orange-50',
    purple: 'bg-purple-50',
    amber: 'bg-amber-50',
    red: 'bg-red-50',
};

const accentText: Record<StatAccent, string> = {
    primary: 'text-primary-600',
    green: 'text-green-600',
    orange: 'text-orange-600',
    purple: 'text-purple-600',
    amber: 'text-amber-600',
    red: 'text-red-600',
};

interface StatCardProps {
    icon: LucideIcon;
    label: string;
    value: string | number;
    sub?: string;
    accent?: StatAccent;
    className?: string;
}

export default function StatCard({ icon: Icon, label, value, sub, accent = 'primary', className }: StatCardProps) {
    return (
        <div className={cn('card flex items-start gap-3 rounded-xl p-5', className)}>
            <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-lg', accentBg[accent], accentText[accent])}>
                <Icon className="h-5 w-5" />
            </div>
            <div className="min-w-0">
                <p className="text-xs font-medium uppercase tracking-wide text-muted">{label}</p>
                <p className="mt-1 text-2xl font-bold text-ink">{value}</p>
                {sub && <p className="mt-1 text-xs text-muted">{sub}</p>}
            </div>
        </div>
    );
}