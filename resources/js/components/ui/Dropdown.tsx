import { useEffect, useRef, useState, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface DropdownProps {
    trigger: ReactNode;
    children: ReactNode;
    align?: 'left' | 'right';
    className?: string;
}

export default function Dropdown({ trigger, children, align = 'right', className }: DropdownProps) {
    const ref = useRef<HTMLDivElement>(null);
    const [open, setOpen] = useState(false);

    useEffect(() => {
        if (!open) return;
        const handleMouseDown = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handleMouseDown);
        return () => document.removeEventListener('mousedown', handleMouseDown);
    }, [open]);

    return (
        <div ref={ref} className={cn('relative inline-block', className)}>
            <span className="inline-flex cursor-pointer" onClick={() => setOpen((o) => !o)}>
                {trigger}
            </span>
            {open && (
                <div
                    className={cn(
                        'absolute z-50 mt-2 min-w-[12rem] rounded-lg border border-slate-200 bg-white py-1 shadow-pop',
                        align === 'left' ? 'left-0' : 'right-0'
                    )}
                >
                    {children}
                </div>
            )}
        </div>
    );
}