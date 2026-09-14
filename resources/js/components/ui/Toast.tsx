import { CheckCircle2, XCircle, AlertTriangle, Info, X } from 'lucide-react';
import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastItem {
    id: number;
    type: ToastType;
    title: string;
    description?: string;
}

interface ToastContextValue {
    toast: (type: ToastType, title: string, description?: string) => void;
    success: (title: string, description?: string) => void;
    error: (title: string, description?: string) => void;
    warning: (title: string, description?: string) => void;
    info: (title: string, description?: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const icons = {
    success: CheckCircle2,
    error: XCircle,
    warning: AlertTriangle,
    info: Info,
};

const colors = {
    success: { icon: 'text-green-500', border: 'border-green-200', bg: 'bg-green-50' },
    error: { icon: 'text-red-500', border: 'border-red-200', bg: 'bg-red-50' },
    warning: { icon: 'text-amber-500', border: 'border-amber-200', bg: 'bg-amber-50' },
    info: { icon: 'text-primary-500', border: 'border-primary-200', bg: 'bg-primary-50' },
};

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<ToastItem[]>([]);

    const removeToast = useCallback((id: number) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    const toast = useCallback((type: ToastType, title: string, description?: string) => {
        const id = Date.now() + Math.random();
        setToasts((prev) => [...prev, { id, type, title, description }]);
        setTimeout(() => removeToast(id), 4000);
    }, [removeToast]);

    const value: ToastContextValue = {
        toast,
        success: (t, d) => toast('success', t, d),
        error: (t, d) => toast('error', t, d),
        warning: (t, d) => toast('warning', t, d),
        info: (t, d) => toast('info', t, d),
    };

    return (
        <ToastContext.Provider value={value}>
            {children}
            <div className="pointer-events-none fixed bottom-4 right-4 z-[100] flex w-full max-w-sm flex-col gap-2">
                {toasts.map((t) => {
                    const Icon = icons[t.type];
                    const c = colors[t.type];
                    return (
                        <div
                            key={t.id}
                            role="alert"
                            className={cn(
                                'pointer-events-auto flex items-start gap-3 rounded-lg border p-3 shadow-pop animate-[fadeIn_0.2s_ease]',
                                c.border,
                                c.bg
                            )}
                        >
                            <Icon className={cn('mt-0.5 h-5 w-5 shrink-0', c.icon)} />
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-ink">{t.title}</p>
                                {t.description && (
                                    <p className="mt-0.5 text-xs text-muted line-clamp-2">{t.description}</p>
                                )}
                            </div>
                            <button
                                onClick={() => removeToast(t.id)}
                                className="shrink-0 rounded p-0.5 text-slate-400 hover:text-ink"
                                aria-label="Dismiss"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                    );
                })}
            </div>
        </ToastContext.Provider>
    );
}

export function useToast(): ToastContextValue {
    const ctx = useContext(ToastContext);
    if (!ctx) {
        throw new Error('useToast must be used within ToastProvider');
    }
    return ctx;
}