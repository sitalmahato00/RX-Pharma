import { Link, router, usePage } from '@inertiajs/react';
import { Bell, Menu, Search, X } from 'lucide-react';
import { useState, type FormEvent, type ReactNode } from 'react';
import { Avatar, Button, Dropdown, Logo } from '@/components/ui';
import { cn, timeAgo } from '@/lib/utils';
import type { AppNotification, User } from '@/types';

interface PageProps {
    app: { name: string; tagline: string; logo?: string | null };
    auth: {
        user: User | null;
        notifications: AppNotification[] | null;
        unread_count: number;
    };
    [key: string]: unknown;
}

const navLinks = [
    { label: 'Home', href: '/' },
    { label: 'Universities', href: '/universities' },
    { label: 'Subjects', href: '/subjects' },
    { label: 'Notes', href: '/notes' },
    { label: 'Videos', href: '/videos' },
    { label: 'Literature', href: '/literature' },
    { label: 'MCQs', href: '/quizzes' },
    { label: 'Papers', href: '/previous-papers' },
];

const footerResources = [
    { label: 'Notes', href: '/notes' },
    { label: 'Videos', href: '/videos' },
    { label: 'MCQs', href: '/quizzes' },
    { label: 'Literature', href: '/literature' },
    { label: 'Previous Papers', href: '/previous-papers' },
];

const footerAcademic = [
    { label: 'Universities', href: '/universities' },
    { label: 'Colleges', href: '/colleges' },
    { label: 'Subjects', href: '/subjects' },
];

const footerSupport = [
    { label: 'About', href: '/about' },
    { label: 'Contact', href: '/contact' },
];

function SearchForm({ className }: { className?: string }) {
    const [q, setQ] = useState('');

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const query = q.trim();
        if (query) router.get('/search', { q: query });
    };

    return (
        <form role="search" onSubmit={handleSubmit} className={cn('relative', className)}>
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
            <input
                type="search"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search notes, videos, literature, MCQs..."
                aria-label="Search notes, videos, literature, MCQs..."
                className="w-full rounded-full border-0 bg-slate-100 py-2 pl-9 pr-4 text-sm text-ink outline-none placeholder:text-slate-400 focus:ring-2 focus:ring-primary-300"
            />
        </form>
    );
}

function DropdownLink({ href, children }: { href: string; children: ReactNode }) {
    return (
        <Link href={href} className="block px-4 py-2 text-sm text-slate-700 transition hover:bg-slate-50">
            {children}
        </Link>
    );
}

function DropdownDivider() {
    return <div className="my-1 border-t border-slate-200" />;
}

export default function PublicLayout({ children }: { children: ReactNode }) {
    const { url } = usePage();
    const { app, auth } = usePage<PageProps>().props;
    const [menuOpen, setMenuOpen] = useState(false);

    const user = auth.user;
    const notifications = auth.notifications ?? [];
    const unread = auth.unread_count ?? 0;

    const isActive = (href: string): boolean => {
        if (href === '/') return url === '/';
        return url === href || url.startsWith(href + '/');
    };

    const handleLogout = () => {
        router.post('/logout', undefined, { preserveScroll: true });
    };

    return (
        <div className="flex min-h-screen flex-col">
            <header className="sticky top-0 z-40 border-b border-slate-200 bg-white">
                <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:gap-4 sm:px-6 lg:px-8">
                    <button
                        type="button"
                        aria-label="Toggle menu"
                        onClick={() => setMenuOpen((o) => !o)}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-ink transition hover:bg-slate-100 lg:hidden"
                    >
                        {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                    </button>

                    <Link href="/" className="shrink-0" aria-label={app.name}>
                        <Logo />
                    </Link>

                    <SearchForm className="hidden flex-1 md:block md:max-w-md" />

                    <nav className="hidden items-center gap-0.5 lg:flex" aria-label="Main navigation">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={cn(
                                    'rounded-lg px-3 py-2 text-sm transition',
                                    isActive(link.href)
                                        ? 'font-medium text-primary-700'
                                        : 'text-slate-600 hover:bg-slate-50 hover:text-primary-700'
                                )}
                            >
                                {link.label}
                            </Link>
                        ))}
                    </nav>

                    <div className="ml-auto flex items-center gap-2 sm:gap-3">
                        {user ? (
                            <>
                                <Dropdown
                                    trigger={
                                        <button
                                            type="button"
                                            aria-label="Notifications"
                                            className="relative inline-flex h-9 w-9 items-center justify-center rounded-full text-slate-600 transition hover:bg-slate-100"
                                        >
                                            <Bell className="h-5 w-5" />
                                            {unread > 0 && (
                                                <span className="absolute -right-0.5 -top-0.5 inline-flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold text-white">
                                                    {unread > 9 ? '9+' : unread}
                                                </span>
                                            )}
                                        </button>
                                    }
                                >
                                    <div className="w-80 overflow-y-auto" style={{ maxHeight: '24rem' }}>
                                        <p className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                                            Notifications
                                        </p>
                                        {notifications.length === 0 && (
                                            <p className="px-4 py-6 text-center text-sm text-muted">No notifications yet</p>
                                        )}
                                        {notifications.slice(0, 8).map((n) => (
                                            <Link
                                                key={n.id}
                                                href={n.link ?? '/notifications'}
                                                className="block border-t border-slate-100 px-4 py-3 transition hover:bg-slate-50"
                                            >
                                                <p className="text-sm font-medium text-ink">{n.title}</p>
                                                {n.body && <p className="mt-0.5 line-clamp-2 text-xs text-muted">{n.body}</p>}
                                                <p className="mt-1 text-[11px] text-slate-400">{timeAgo(n.created_at)}</p>
                                            </Link>
                                        ))}
                                        {notifications.length > 0 && (
                                            <Link
                                                href="/notifications"
                                                className="block border-t border-slate-200 px-4 py-2.5 text-center text-sm font-medium text-primary-700 transition hover:bg-primary-50"
                                            >
                                                View all
                                            </Link>
                                        )}
                                    </div>
                                </Dropdown>

                                <Dropdown
                                    trigger={
                                        <div className="flex items-center gap-2 rounded-full p-1 pr-2 transition hover:bg-slate-100">
                                            <Avatar name={user.name} src={user.avatar ?? undefined} size="sm" />
                                            <div className="hidden text-left md:block">
                                                <p className="text-sm font-medium leading-tight text-ink">{user.name}</p>
                                                {user.program && <p className="text-xs leading-tight text-muted">{user.program}</p>}
                                            </div>
                                        </div>
                                    }
                                >
                                    <div className="px-4 py-2 text-left">
                                        <p className="text-sm font-medium text-ink">{user.name}</p>
                                        <p className="text-xs text-muted">{user.email}</p>
                                    </div>
                                    <DropdownDivider />
                                    <DropdownLink href="/dashboard">Dashboard</DropdownLink>
                                    <DropdownLink href="/my-learning">My Learning</DropdownLink>
                                    <DropdownLink href="/settings">Settings</DropdownLink>
                                    <DropdownDivider />
                                    <button
                                        type="button"
                                        onClick={handleLogout}
                                        className="block w-full px-4 py-2 text-left text-sm text-slate-700 transition hover:bg-slate-50"
                                    >
                                        Logout
                                    </button>
                                </Dropdown>
                            </>
                        ) : (
                            <div className="hidden items-center gap-2 sm:flex">
                                <Button variant="primary" size="sm" href="/login">
                                    Login
                                </Button>
                                <Button variant="secondary" size="sm" href="/register">
                                    Register
                                </Button>
                            </div>
                        )}
                    </div>
                </div>

                {menuOpen && (
                    <div className="border-t border-slate-200 bg-white shadow-sm lg:hidden">
                        <div className="mx-auto max-w-7xl space-y-4 px-4 py-4">
                            <SearchForm />
                            <nav className="flex flex-col gap-1" aria-label="Mobile navigation">
                                {navLinks.map((link) => (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        onClick={() => setMenuOpen(false)}
                                        className={cn(
                                            'rounded-lg px-3 py-2.5 text-sm transition',
                                            isActive(link.href)
                                                ? 'bg-primary-50 font-medium text-primary-700'
                                                : 'text-slate-600 hover:bg-slate-50 hover:text-primary-700'
                                        )}
                                    >
                                        {link.label}
                                    </Link>
                                ))}
                            </nav>
                            {!user && (
                                <div className="flex gap-2 border-t border-slate-100 pt-4">
                                    <Button variant="primary" size="md" href="/login" className="flex-1">
                                        Login
                                    </Button>
                                    <Button variant="secondary" size="md" href="/register" className="flex-1">
                                        Register
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </header>

            <main className="flex-1 bg-surface">{children}</main>

            <footer className="mt-16 bg-primary-900 text-primary-100">
                <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-4 py-12 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8">
                    <div>
                        <Logo light withLink={false} />
                        <p className="mt-3 text-sm text-primary-200/80">{app.tagline}</p>
                        <p className="mt-2 text-sm leading-relaxed text-primary-200/60">
                            A complete learning platform for pharmacy students — notes, videos, literature, MCQs and previous
                            papers to help you learn and succeed.
                        </p>
                    </div>
                    <div>
                        <h3 className="mb-4 text-sm font-semibold text-white">Resources</h3>
                        <ul className="space-y-2.5">
                            {footerResources.map((link) => (
                                <li key={link.href}>
                                    <Link href={link.href} className="text-sm text-primary-200/80 transition hover:text-white">
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div>
                        <h3 className="mb-4 text-sm font-semibold text-white">Academic</h3>
                        <ul className="space-y-2.5">
                            {footerAcademic.map((link) => (
                                <li key={link.href}>
                                    <Link href={link.href} className="text-sm text-primary-200/80 transition hover:text-white">
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div>
                        <h3 className="mb-4 text-sm font-semibold text-white">Support</h3>
                        <ul className="space-y-2.5">
                            {footerSupport.map((link) => (
                                <li key={link.href}>
                                    <Link href={link.href} className="text-sm text-primary-200/80 transition hover:text-white">
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
                <div className="border-t border-primary-800">
                    <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-6 text-sm text-primary-200/70 sm:flex-row sm:px-6 lg:px-8">
                        <p>
                            © {new Date().getFullYear()} {app.name}. All rights reserved.
                        </p>
                        <p className="font-medium text-primary-200">{app.name}</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}