import { ChevronDown } from 'lucide-react';
import {
    forwardRef,
    type InputHTMLAttributes,
    type LabelHTMLAttributes,
    type ReactNode,
    type SelectHTMLAttributes,
    type TextareaHTMLAttributes,
} from 'react';
import { cn } from '@/lib/utils';

export type InputProps = InputHTMLAttributes<HTMLInputElement>;

interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
    children: ReactNode;
}

export function Label({ children, htmlFor, className }: LabelProps) {
    return (
        <label htmlFor={htmlFor} className={cn('mb-1.5 block text-sm font-medium text-slate-700', className)}>
            {children}
        </label>
    );
}

interface InputFieldProps extends InputProps {
    label?: string;
    error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputFieldProps>(function Input({ label, error, className, id, ...props }, ref) {
    return (
        <div className="w-full">
            {label && <Label htmlFor={id}>{label}</Label>}
            <input
                ref={ref}
                id={id}
                className={cn('input', error && 'border-red-400 focus:border-red-400 focus:ring-red-200', className)}
                {...props}
            />
            {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
        </div>
    );
});

interface SelectFieldProps extends SelectHTMLAttributes<HTMLSelectElement> {
    label?: string;
    error?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectFieldProps>(function Select({ label, error, className, children, id, ...props }, ref) {
    return (
        <div className="w-full">
            {label && <Label htmlFor={id}>{label}</Label>}
            <div className="relative">
                <select
                    ref={ref}
                    id={id}
                    className={cn('input appearance-none pr-8', error && 'border-red-400 focus:border-red-400 focus:ring-red-200', className)}
                    {...props}
                >
                    {children}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            </div>
            {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
        </div>
    );
});

interface TextareaFieldProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string;
    error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaFieldProps>(function Textarea({ label, error, rows = 4, className, id, ...props }, ref) {
    return (
        <div className="w-full">
            {label && <Label htmlFor={id}>{label}</Label>}
            <textarea
                ref={ref}
                id={id}
                rows={rows}
                className={cn('input resize-none', error && 'border-red-400 focus:border-red-400 focus:ring-red-200', className)}
                {...props}
            />
            {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
        </div>
    );
});