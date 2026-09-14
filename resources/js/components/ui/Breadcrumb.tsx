import { Link } from '@inertiajs/react';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BreadcrumbItem {
    label: string;
    href?: string;
}

interface BreadcrumbProps {
    items: BreadcrumbItem[];
}

export default function Breadcrumb({ items }: BreadcrumbProps) {
    return (
        <nav aria-label="Breadcrumb">
            <ol className="flex items-center gap-1.5 text-sm">
                {items.map((item, index) => {
                    const isLast = index === items.length - 1;
                    const contentClass = cn(isLast ? 'text-ink font-medium' : 'text-muted transition hover:text-primary-600');

                    return (
                        <li key={index} className="flex items-center gap-1.5">
                            {index > 0 && <ChevronRight className="h-4 w-4 text-slate-400" aria-hidden="true" />}
                            {item.href && !isLast ? (
                                <Link href={item.href} className={contentClass}>
                                    {item.label}
                                </Link>
                            ) : (
                                <span className={contentClass} aria-current={isLast ? 'page' : undefined}>
                                    {item.label}
                                </span>
                            )}
                        </li>
                    );
                })}
            </ol>
        </nav>
    );
}