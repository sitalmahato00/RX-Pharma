import { cn, initials } from '@/lib/utils';

export type AvatarSize = 'sm' | 'md' | 'lg';

const sizeClasses: Record<AvatarSize, string> = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-14 w-14 text-lg',
};

interface AvatarProps {
    name: string;
    src?: string;
    size?: AvatarSize;
    className?: string;
}

export default function Avatar({ name, src, size = 'md', className }: AvatarProps) {
    if (src) {
        return (
            <img
                src={src}
                alt={name}
                className={cn('inline-flex items-center justify-center rounded-full bg-slate-100 object-cover', sizeClasses[size], className)}
            />
        );
    }

    return (
        <span
            aria-label={name}
            className={cn(
                'inline-flex items-center justify-center rounded-full bg-primary-100 font-medium text-primary-800',
                sizeClasses[size],
                className
            )}
        >
            {initials(name)}
        </span>
    );
}