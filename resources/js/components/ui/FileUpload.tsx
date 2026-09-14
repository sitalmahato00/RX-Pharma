import { UploadCloud, X } from 'lucide-react';
import { useEffect, useRef, type ChangeEvent } from 'react';
import { cn } from '@/lib/utils';

interface FileUploadProps {
    accept?: string;
    label?: string;
    value?: File | string | null;
    onChange?: (file: File | null) => void;
    hint?: string;
    multiple?: boolean;
    className?: string;
}

export default function FileUpload({ accept, label, value, onChange, hint, multiple, className }: FileUploadProps) {
    const inputRef = useRef<HTMLInputElement>(null);
    const scrollState = useRef<{ element: HTMLElement | null; top: number; windowTop: number } | null>(null);
    const fileName = typeof value === 'string' ? value.split(/[\\/]/).pop() ?? value : value?.name;

    const rememberScrollPosition = (element: HTMLElement | null) => {
        let current = element?.parentElement ?? null;
        while (current) {
            const styles = window.getComputedStyle(current);
            if (current.scrollHeight > current.clientHeight && styles.overflowY !== 'visible') {
                scrollState.current = { element: current, top: current.scrollTop, windowTop: window.scrollY };
                return;
            }
            current = current.parentElement;
        }
        scrollState.current = { element: null, top: 0, windowTop: window.scrollY };
    };

    const restoreScrollPosition = () => {
        const state = scrollState.current;
        if (!state) return;
        if (state.element) state.element.scrollTop = state.top;
        window.scrollTo({ top: state.windowTop, behavior: 'auto' });
    };

    useEffect(() => {
        const restoreAfterPicker = () => {
            window.requestAnimationFrame(() => {
                restoreScrollPosition();
                window.requestAnimationFrame(restoreScrollPosition);
            });
        };
        window.addEventListener('focus', restoreAfterPicker);
        return () => window.removeEventListener('focus', restoreAfterPicker);
    }, []);

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        onChange?.(e.target.files?.[0] ?? null);
        e.target.value = '';
        inputRef.current?.blur();
        window.requestAnimationFrame(restoreScrollPosition);
    };

    return (
        <div>
            {label && <label className="mb-1.5 block text-sm font-medium text-slate-700">{label}</label>}
            <label
                onClick={() => rememberScrollPosition(inputRef.current)}
                className={cn(
                    'flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-300 p-6 text-center transition hover:border-primary-400',
                    className
                )}
            >
                <UploadCloud className="mb-2 h-8 w-8 text-slate-400" aria-hidden="true" />
                <span className="text-sm font-medium text-ink">{fileName || 'Click to upload'}</span>
                {hint && <span className="mt-1 text-xs text-muted">{hint}</span>}
                <input
                    ref={inputRef}
                    type="file"
                    accept={accept}
                    multiple={multiple}
                    onChange={handleChange}
                    className="sr-only"
                />
            </label>
            {value && (
                <button
                    type="button"
                    onClick={() => onChange?.(null)}
                    className="mt-2 inline-flex items-center gap-1 text-xs text-red-600 transition hover:text-red-700"
                >
                    <X className="h-3.5 w-3.5" />
                    Remove file
                </button>
            )}
        </div>
    );
}