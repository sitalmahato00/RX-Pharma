import { Link, router, usePage } from '@inertiajs/react';
import {
    Bell,
    BookOpen,
    FileArchive,
    FileText,
    FlaskConical,
    HelpCircle,
    Home,
    LayoutDashboard,
    Library,
    LogOut,
    Menu,
    MessagesSquare,
    PanelLeftClose,
    PanelLeftOpen,
    PlayCircle,
    Settings,
    TrendingUp,
    User as UserIcon,
    Bookmark,
    type LucideIcon,
} from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { Avatar, Dropdown, Logo, SearchBar } from '@/components/ui';
import { cn, timeAgo } from '@/lib/utils';
import type { AppNotification, User } from '@/types';

interface PageProps {
    app?: { name: string; tagline: string; logo?: string | null };
    auth: {
        user: User | null;
        notifications: AppNotification[] | null;
        unread_count: number;
    };
    [key: string]: unknown;
}

interface NavItem {
    label: string;
    href: string;
    icon: LucideIcon;
}

const mainNav: NavItem[] = [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'My Learning', href: '/my-learning', icon: BookOpen },
    { label: 'Notes', href: '/notes', icon: FileText },
    { label: 'Videos', href: '/videos', icon: PlayCircle },
    { label: 'Literature', href: '/literature', icon: Library },
    { label: 'MCQs & Quiz', href: '/quizzes', icon: HelpCircle },
    { label: 'Previous Papers', href: '/previous-papers', icon: FileArchive },
    { label: 'Practical & Viva', href: '/practical-viva', icon: FlaskConical },
    { label: 'Discussion Forum', href: '/discussions', icon: MessagesSquare },
    { label: 'My Progress', href: '/my-progress', icon: TrendingUp },
];

const accountNav: NavItem[] = [
    { label: 'Profile', href: '/profile', icon: UserIcon },
    { label: 'Settings', href: '/settings', icon: Settings },
    { label: 'Notifications', href: '/notifications', icon: Bell },
];

const bottomNav: NavItem[] = [
    { label: 'Home', href: '/', icon: Home },
    { label: 'Learn', href: '/my-learning', icon: BookOpen },
    { label: 'Quiz', href: '/quizzes', icon: HelpCircle },
    { label: 'Bookmarks', href: '/my-bookmarks', icon: Bookmark },
    { label: 'Profile', href: '/profile', icon: UserIcon },
];

function isActive(url: string, href: string): boolean {
    if (href === '/' || href === '/dashboard') return url === href;
    return url === href || url.startsWith(href + '/');
}

function handleLogout() {
    router.post('/logout', undefined, { preserveScroll: true });
}

function SidebarInner({ collapsed = false, onNavigate }: { collapsed?: boolean; onNavigate?: () => void }) {
    const { url } = usePage();
    const { auth } = usePage<PageProps>().props;
    const user = auth.user;

    return (
        <div className="flex h-full flex-col bg-primary-900 text-white">
            <div className={cn('flex items-center py-5', collapsed ? 'flex-col gap-4 px-2' : 'justify-between gap-2 px-4')}>
                {collapsed ? (
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-700 text-white">
                        <span className="text-sm font-bold">R</span>
                    </div>
                ) : (
                    <Logo light withLink={false} />
                )}
                <button
                    type="button"
                    onClick={() => onNavigate?.()}
                    aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                    className="hidden rounded-lg p-2 text-primary-200 transition hover:bg-primary-800 hover:text-white lg:inline-flex"
                >
                    {collapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
                </button>
            </div>

            <nav className="flex-1 space-y-1 overflow-y-auto px-2">
                {mainNav.map((item) => (
                    <SidebarLink key={item.href} item={item} collapsed={collapsed} onNavigate={onNavigate} />
                ))}
                <div className="my-3 border-t border-primary-800" />
                {accountNav.map((item) => (
                    <SidebarLink key={item.href} item={item} collapsed={collapsed} onNavigate={onNavigate} />
                ))}
            </nav>

            <div className={cn('border-t border-primary-800 p-2', collapsed && 'py-3')}>
                {user && !collapsed && (
                    <div className="flex items-center gap-2.5 px-2 py-2">
                        <Avatar name={user.name} src={user.avatar ?? undefined} size="sm" />
                        <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-white">{user.name}</p>
                            <p className="truncate text-xs text-primary-200/70">{user.program ?? user.email}</p>
                        </div>
                    </div>
                )}
                <button
                    type="button"
                    onClick={handleLogout}
                    className={cn(
                        'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-primary-200 transition hover:bg-primary-800 hover:text-white',
                        collapsed && 'justify-center px-2'
                    )}
                >
                    <LogOut className="h-5 w-5 shrink-0" />
                    {!collapsed && <span>Logout</span>}
                </button>
            </div>
        </div>
    );
}

function SidebarLink({ item, collapsed, onNavigate }: { item: NavItem; collapsed: boolean; onNavigate?: () => void }) {
    const { url } = usePage();
    const active = isActive(url, item.href);
    const Icon = item.icon;

    return (
        <Link
            href={item.href}
            onClick={onNavigate}
            title={collapsed ? item.label : undefined}
            className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition',
                collapsed && 'justify-center px-2',
                active
                    ? 'bg-primary-700/80 font-medium text-white'
                    : 'text-primary-200 hover:bg-primary-800 hover:text-white'
            )}
        >
            <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
            {!collapsed && <span className="truncate">{item.label}</span>}
        </Link>
    );
}

function NotificationsMenu({ className }: { className?: string }) {
    const { auth } = usePage<PageProps>().props;
    const notifications = auth.notifications ?? [];
    const unread = auth.unread_count ?? 0;

    return (
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
            <div className={cn('w-80 overflow-y-auto', className)} style={{ maxHeight: '24rem' }}>
                <p className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-slate-400">Notifications</p>
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
    );
}

function ProfileMenu() {
    const { auth } = usePage<PageProps>().props;
    const user = auth.user;

    if (!user) return null;

    return (
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
            <div className="my-1 border-t border-slate-200" />
            <Link href="/profile" className="block px-4 py-2 text-sm text-slate-700 transition hover:bg-slate-50">
                Profile
            </Link>
            <Link href="/settings" className="block px-4 py-2 text-sm text-slate-700 transition hover:bg-slate-50">
                Settings
            </Link>
            <Link href="/notifications" className="block px-4 py-2 text-sm text-slate-700 transition hover:bg-slate-50">
                Notifications
            </Link>
            <div className="my-1 border-t border-slate-200" />
            <button
                type="button"
                onClick={handleLogout}
                className="block w-full px-4 py-2 text-left text-sm text-slate-700 transition hover:bg-slate-50"
            >
                Logout
            </button>
        </Dropdown>
    );
}

export default function StudentLayout({ children }: { children: ReactNode }) {
    const { url } = usePage();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [collapsed, setCollapsed] = useState(false);

    return (
        <div className="flex h-screen overflow-hidden">
            <aside
                className={cn('hidden shrink-0 flex-col bg-primary-900 lg:flex', collapsed ? 'w-20' : 'w-64')}
            >
                <SidebarInner collapsed={collapsed} />
            </aside>

            <div className="flex min-w-0 flex-1 flex-col">
                <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-slate-200 bg-white px-4 py-3">
                    <button
                        type="button"
                        aria-label="Open menu"
                        onClick={() => setSidebarOpen(true)}
                        className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-ink transition hover:bg-slate-100 lg:hidden"
                    >
                        <Menu className="h-5 w-5" />
                    </button>

                    <div className="min-w-0 flex-1">
                        <SearchBar
                            placeholder="Search resources..."
                            size="sm"
                            onSearch={(q) => {
                                if (q) router.get('/search', { q });
                            }}
                            className="max-w-md"
                        />
                    </div>

                    <NotificationsMenu />
                    <ProfileMenu />
                </header>

                <main className="flex-1 overflow-y-auto bg-surface p-4 pb-16 sm:p-6 lg:pb-6">{children}</main>
            </div>

            {sidebarOpen && (
                <div className="fixed inset-0 z-50 lg:hidden">
                    <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} aria-hidden="true" />
                    <aside className="absolute left-0 top-0 flex h-full w-64 flex-col shadow-xl">
                        <SidebarInner onNavigate={() => setSidebarOpen(false)} />
                    </aside>
                </div>
            )}

            <nav className="fixed bottom-0 left-0 right-0 z-40 grid grid-cols-5 border-t border-slate-200 bg-white lg:hidden" aria-label="Mobile navigation">
                {bottomNav.map((item) => {
                    const active = isActive(url, item.href);
                    const Icon = item.icon;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                'flex flex-col items-center gap-0.5 py-2 transition',
                                active ? 'text-primary-700' : 'text-slate-500 hover:text-primary-700'
                            )}
                        >
                            <Icon className="h-5 w-5" aria-hidden="true" />
                            <span className="text-[10px] font-medium">{item.label}</span>
                        </Link>
                    );
                })}
            </nav>
        </div>
    );
}