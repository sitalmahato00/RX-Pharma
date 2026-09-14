import { Link } from '@inertiajs/react';
import { cn } from '@/lib/utils';
import { Star } from 'lucide-react';
import type { ButtonHTMLAttributes, ReactNode } from 'react';

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'success' | 'warning';
type Size = 'sm' | 'md' | 'lg' | 'icon';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: Variant;
    size?: Size;
    loading?: boolean;
    href?: string;
    children: ReactNode;
}

const variantClasses: Record<Variant, string> = {
    primary: 'bg-primary-700 text-white hover:bg-primary-800 focus-visible:ring-primary-300',
    secondary: 'bg-white text-ink border border-slate-300 hover:bg-slate-50 focus-visible:ring-slate-300',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-300',
    success: 'bg-green-600 text-white hover:bg-green-700 focus-visible:ring-green-300',
    warning: 'bg-amber-500 text-white hover:bg-amber-600 focus-visible:ring-amber-300',
    ghost: 'bg-transparent text-ink hover:bg-slate-100 focus-visible:ring-slate-300',
};

const sizeClasses: Record<Size, string> = {
    sm: 'px-2.5 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-5 py-2.5 text-base',
    icon: 'p-2',
};

export default function Button({
    variant = 'primary',
    size = 'md',
    loading = false,
    href,
    className,
    children,
    disabled,
    ...props
}: ButtonProps) {
    const classes = cn(
        'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-150',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 disabled:opacity-60 disabled:cursor-not-allowed active:scale-[0.98]',
        variantClasses[variant],
        sizeClasses[size],
        className
    );

    if (href) {
        return (
            <Link href={href} className={classes}>
                {children}
            </Link>
        );
    }

    return (
        <button className={classes} disabled={disabled || loading} {...props}>
            {loading && (
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                </svg>
            )}
            {children}
        </button>
    );
}

export function BookmarkButton({
    bookmarked,
    onClick,
    count,
    size = 'md',
}: {
    bookmarked: boolean;
    onClick: (e: React.MouseEvent) => void;
    count?: number;
    size?: Size;
}) {
    const classes = cn(
        'inline-flex items-center gap-1.5 rounded-lg border font-medium transition-all duration-150',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 active:scale-[0.98]',
        sizeClasses[size],
        bookmarked
            ? 'border-amber-300 bg-amber-50 text-amber-600 hover:bg-amber-100'
            : 'border-slate-300 bg-white text-slate-600 hover:bg-slate-50'
    );

    return (
        <button type="button" className={classes} onClick={onClick}>
            <Star className={cn('h-4 w-4', bookmarked && 'fill-amber-500 text-amber-500')} />
            {typeof count === 'number' && count > 0 && <span>{count}</span>}
        </button>
    );
}