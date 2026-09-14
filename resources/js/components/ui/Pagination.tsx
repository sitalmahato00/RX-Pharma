import { Link, router } from '@inertiajs/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface PaginationProps {
    links: PaginationLink[];
    onNavigate?: (url: string) => void;
}

export default function Pagination({ links, onNavigate }: PaginationProps) {
    if (!links || links.length < 3) return null;

    const prev = links[0];
    const next = links[links.length - 1];

    const itemClasses = 'inline-flex h-8 min-w-8 items-center justify-center rounded-md border px-2 text-sm transition';

    const handleNavigate = (url: string) => {
        if (onNavigate) {
            onNavigate(url);
        } else {
            router.visit(url);
        }
    };

    return (
        <nav aria-label="Pagination" className="flex items-center gap-1">
            <button
                type="button"
                aria-label="Previous page"
                disabled={!prev.url}
                onClick={() => prev.url && handleNavigate(prev.url)}
                className={cn(itemClasses, 'border-slate-200 bg-white text-ink hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40')}
            >
                <ChevronLeft className="h-4 w-4" />
            </button>

            {links.slice(1, -1).map((link, index) => {
                const key = `${link.label}-${index}`;

                if (link.label === '...' || !link.url) {
                    return (
                        <span key={key} className="inline-flex h-8 min-w-8 items-center justify-center px-1 text-sm text-slate-400">
                            …
                        </span>
                    );
                }

                if (link.active) {
                    return (
                        <span key={key} aria-current="page" className={cn(itemClasses, 'border-primary-700 bg-primary-700 font-medium text-white')}>
                            {link.label}
                        </span>
                    );
                }

                if (onNavigate) {
                    return (
                        <button key={key} type="button" onClick={() => handleNavigate(link.url!)} className={cn(itemClasses, 'border-slate-200 bg-white text-ink hover:bg-slate-50')}>
                            {link.label}
                        </button>
                    );
                }

                return (
                    <Link key={key} href={link.url} className={cn(itemClasses, 'border-slate-200 bg-white text-ink hover:bg-slate-50')}>
                        {link.label}
                    </Link>
                );
            })}

            <button
                type="button"
                aria-label="Next page"
                disabled={!next.url}
                onClick={() => next.url && handleNavigate(next.url)}
                className={cn(itemClasses, 'border-slate-200 bg-white text-ink hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40')}
            >
                <ChevronRight className="h-4 w-4" />
            </button>
        </nav>
    );
}