import { cn } from '@/lib/utils';

interface ProgressBarProps {
    value: number;
    size?: 'sm' | 'md';
    showLabel?: boolean;
    color?: string;
}

export default function ProgressBar({ value, size = 'md', showLabel = false, color }: ProgressBarProps) {
    const width = Math.min(Math.max(value, 0), 100);

    return (
        <div className="flex items-center gap-3">
            <div
                role="progressbar"
                aria-valuenow={width}
                aria-valuemin={0}
                aria-valuemax={100}
                className={cn('w-full rounded-full bg-slate-100 overflow-hidden', size === 'sm' ? 'h-1.5' : 'h-2')}
            >
                <div
                    className={cn('h-full rounded-full transition-all duration-300', !color && 'bg-primary-600')}
                    style={{ width: `${width}%`, ...(color ? { backgroundColor: color } : {}) }}
                />
            </div>
            {showLabel && <span className="shrink-0 text-xs font-medium text-ink">{Math.round(width)}%</span>}
        </div>
    );
}