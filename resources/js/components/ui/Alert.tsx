import { AlertTriangle, CheckCircle2, Info, X, XCircle, type LucideIcon } from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

type AlertType = 'success' | 'error' | 'warning' | 'info';

const variants: Record<AlertType, { container: string; icon: LucideIcon; iconClass: string }> = {
    success: { container: 'border-green-200 bg-green-50 text-green-800', icon: CheckCircle2, iconClass: 'text-green-600' },
    error: { container: 'border-red-200 bg-red-50 text-red-800', icon: XCircle, iconClass: 'text-red-600' },
    warning: { container: 'border-amber-200 bg-amber-50 text-amber-800', icon: AlertTriangle, iconClass: 'text-amber-600' },
    info: { container: 'border-blue-200 bg-blue-50 text-blue-800', icon: Info, iconClass: 'text-blue-600' },
};

interface AlertProps {
    type: AlertType;
    title?: string;
    children: ReactNode;
    className?: string;
    dismissible?: boolean;
    onDismiss?: () => void;
}

export default function Alert({ type, title, children, className, dismissible, onDismiss }: AlertProps) {
    const [dismissed, setDismissed] = useState(false);
    const variant = variants[type];
    const Icon = variant.icon;

    if (dismissed) return null;

    return (
        <div role="alert" className={cn('flex gap-3 rounded-lg border p-4', variant.container, className)}>
            <Icon className={cn('mt-0.5 h-5 w-5 shrink-0', variant.iconClass)} aria-hidden="true" />
            <div className="flex-1">
                {title && <p className="mb-0.5 font-medium">{title}</p>}
                <div className="text-sm">{children}</div>
            </div>
            {dismissible && (
                <button
                    type="button"
                    aria-label="Dismiss"
                    onClick={() => {
                        setDismissed(true);
                        onDismiss?.();
                    }}
                    className={cn('shrink-0 rounded p-0.5 opacity-60 transition hover:opacity-100', variant.iconClass)}
                >
                    <X className="h-4 w-4" />
                </button>
            )}
        </div>
    );
}