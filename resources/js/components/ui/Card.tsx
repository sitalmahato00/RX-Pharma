import type { MouseEventHandler, ReactNode } from 'react';
import { cn } from '@/lib/utils';

type CardElement = 'div' | 'article' | 'section' | 'aside' | 'li' | 'button';

interface CardProps {
    children: ReactNode;
    className?: string;
    hoverable?: boolean;
    onClick?: MouseEventHandler<HTMLElement>;
    as?: CardElement;
}

export default function Card({ children, className, hoverable, onClick, as: Tag = 'div' }: CardProps) {
    return (
        <Tag
            className={cn(
                'card rounded-xl',
                hoverable && 'transition hover:shadow-card-hover hover:-translate-y-0.5 cursor-pointer',
                className
            )}
            onClick={onClick}
        >
            {children}
        </Tag>
    );
}