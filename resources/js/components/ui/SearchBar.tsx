import { Search, X } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { cn } from '@/lib/utils';

interface SearchBarProps {
    placeholder?: string;
    onSearch?: (q: string) => void;
    defaultValue?: string;
    size?: 'sm' | 'md';
    className?: string;
}

export default function SearchBar({ placeholder = 'Search...', onSearch, defaultValue = '', size = 'md', className }: SearchBarProps) {
    const [query, setQuery] = useState(defaultValue);

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        onSearch?.(query.trim());
    };

    return (
        <form onSubmit={handleSubmit} role="search" className={cn('relative', className)}>
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
            <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={placeholder}
                aria-label={placeholder}
                className={cn('input pl-9 pr-9', size === 'sm' ? 'rounded-lg py-1.5 text-sm' : 'rounded-full py-2 text-sm')}
            />
            {query && (
                <button
                    type="button"
                    aria-label="Clear search"
                    onClick={() => setQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-ink"
                >
                    <X className="h-4 w-4" />
                </button>
            )}
        </form>
    );
}