import { X } from 'lucide-react';
import { useEffect, useState, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

export type ModalSize = 'sm' | 'md' | 'lg';

const sizeClasses: Record<ModalSize, string> = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
};

interface ModalProps {
    open: boolean;
    onClose: () => void;
    title?: string;
    description?: string;
    children: ReactNode;
    size?: ModalSize;
    footer?: ReactNode;
}

export default function Modal({ open, onClose, title, description, children, size = 'md', footer }: ModalProps) {
    const [shown, setShown] = useState(false);

    useEffect(() => {
        if (!open) return;
        const id = requestAnimationFrame(() => setShown(true));
        return () => {
            cancelAnimationFrame(id);
            setShown(false);
        };
    }, [open]);

    useEffect(() => {
        if (!open) return;
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [open, onClose]);

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50" onClick={onClose} aria-hidden="true" />
            <div
                role="dialog"
                aria-modal="true"
                aria-label={title}
                className={cn(
                    'relative w-full rounded-xl bg-white shadow-pop max-h-[90vh] overflow-y-auto',
                    'pointer-events-auto transition-all duration-200',
                    shown ? 'scale-100 opacity-100' : 'scale-95 opacity-0',
                    sizeClasses[size]
                )}
            >
                <button
                    type="button"
                    onClick={onClose}
                    aria-label="Close"
                    className="absolute right-4 top-4 rounded-full p-1 text-slate-400 transition hover:bg-slate-100 hover:text-ink"
                >
                    <X className="h-5 w-5" />
                </button>
                {(title || description) && (
                    <div className="border-b border-slate-200 p-6 pb-4">
                        {title && <h3 className="pr-8 font-semibold text-lg text-ink">{title}</h3>}
                        {description && <p className="mt-1 pr-8 text-sm text-muted">{description}</p>}
                    </div>
                )}
                <div className="p-6">{children}</div>
                {footer && (
                    <div className="flex justify-end gap-2 border-t border-slate-200 p-6 pt-4">{footer}</div>
                )}
            </div>
        </div>
    );
}