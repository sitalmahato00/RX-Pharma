import { Link, router, usePage } from '@inertiajs/react';
import {
    Activity,
    BarChart3,
    Bell,
    BookMarked,
    BookOpen,
    ClipboardList,
    ExternalLink,
    FileArchive,
    FileText,
    Flag,
    FlaskConical,
    FolderOpen,
    Hash,
    HelpCircle,
    History,
    Image,
    Landmark,
    Layers,
    LayoutDashboard,
    Library,
    LogOut,
    Menu,
    MessagesSquare,
    School,
    Settings,
    Users,
    Video,
    type LucideIcon,
} from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { Avatar, Dropdown, SearchBar } from '@/components/ui';
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

interface NavGroup {
    label: string;
    items: NavItem[];
}

const navGroups: NavGroup[] = [
    {
        label: 'Overview',
        items: [{ label: 'Dashboard', href: '/admin', icon: LayoutDashboard }],
    },
    {
        label: 'Academic Structure',
        items: [
            { label: 'Universities', href: '/admin/universities', icon: Landmark },
            { label: 'Colleges', href: '/admin/colleges', icon: School },
            { label: 'Programs', href: '/admin/programs', icon: BookMarked },
            { label: 'Semesters', href: '/admin/semesters', icon: Layers },
            { label: 'Subjects', href: '/admin/subjects', icon: BookOpen },
            { label: 'Units', href: '/admin/units', icon: FolderOpen },
            { label: 'Topics', href: '/admin/topics', icon: Hash },
        ],
    },
    {
        label: 'Resources',
        items: [
            { label: 'Notes', href: '/admin/notes', icon: FileText },
            { label: 'Videos', href: '/admin/videos', icon: Video },
            { label: 'Literature', href: '/admin/literature', icon: Library },
            { label: 'Previous Papers', href: '/admin/papers', icon: FileArchive },
            { label: 'Practical & Viva', href: '/admin/practical', icon: FlaskConical },
        ],
    },
    {
        label: 'Quiz',
        items: [
            { label: 'Quiz Sets', href: '/admin/quizzes', icon: ClipboardList },
            { label: 'Questions', href: '/admin/questions', icon: HelpCircle },
            { label: 'Attempts', href: '/admin/attempts', icon: History },
        ],
    },
    {
        label: 'Users & Community',
        items: [
            { label: 'Students', href: '/admin/users', icon: Users },
            { label: 'Discussions', href: '/admin/discussions', icon: MessagesSquare },
            { label: 'Reports', href: '/admin/reports', icon: Flag },
        ],
    },
    {
        label: 'System',
        items: [
            { label: 'Media', href: '/admin/media', icon: Image },
            { label: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
            { label: 'Activities', href: '/admin/activities', icon: Activity },
            { label: 'Settings', href: '/admin/settings', icon: Settings },
        ],
    },
];

function isActive(url: string, href: string): boolean {
    if (href === '/admin') return url === '/admin';
    return url === href || url.startsWith(href + '/');
}

function handleLogout() {
    router.post('/logout', undefined, { preserveScroll: true });
}

function SidebarInner({ onNavigate }: { onNavigate?: () => void }) {
    const { url } = usePage();
    const { auth } = usePage<PageProps>().props;
    const user = auth.user;

    return (
        <div className="flex h-full flex-col bg-primary-900 text-white">
            <div className="flex items-center justify-between px-5 py-5">
                <div>
                    <p className="text-base font-bold tracking-tight text-white">
                        RX <span className="text-primary-300">Pharma</span>
                    </p>
                    <p className="text-[10px] font-medium uppercase tracking-widest text-primary-200/70">Admin Panel</p>
                </div>
            </div>

            <nav className="flex-1 space-y-4 overflow-y-auto px-3 pb-4">
                {navGroups.map((group) => (
                    <div key={group.label}>
                        <p className="mb-1.5 px-3 text-[10px] font-semibold uppercase tracking-wider text-primary-300">
                            {group.label}
                        </p>
                        <div className="space-y-0.5">
                            {group.items.map((item) => (
                                <NavLink key={item.href} item={item} onNavigate={onNavigate} />
                            ))}
                        </div>
                    </div>
                ))}
            </nav>

            <div className="border-t border-primary-800 p-3">
                {user && (
                    <div className="flex items-center gap-2.5 px-2 py-2">
                        <Avatar name={user.name} src={user.avatar ?? undefined} size="sm" />
                        <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-white">{user.name}</p>
                            <p className="text-xs text-primary-200/70">Administrator</p>
                        </div>
                    </div>
                )}
                <div className="mt-2 space-y-1">
                    <Link
                        href="/"
                        target="_blank"
                        className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-primary-200 transition hover:bg-primary-800 hover:text-white"
                    >
                        <ExternalLink className="h-4 w-4 shrink-0" />
                        View Site
                    </Link>
                    <button
                        type="button"
                        onClick={handleLogout}
                        className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-primary-200 transition hover:bg-primary-800 hover:text-white"
                    >
                        <LogOut className="h-4 w-4 shrink-0" />
                        Logout
                    </button>
                </div>
            </div>
        </div>
    );
}

function NavLink({ item, onNavigate }: { item: NavItem; onNavigate?: () => void }) {
    const { url } = usePage();
    const active = isActive(url, item.href);
    const Icon = item.icon;

    return (
        <Link
            href={item.href}
            onClick={onNavigate}
            className={cn(
                'flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition',
                active
                    ? 'bg-primary-700 font-medium text-white'
                    : 'text-primary-200 hover:bg-primary-800 hover:text-white'
            )}
        >
            <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span className="truncate">{item.label}</span>
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
                <div className="flex items-center gap-2.5 rounded-full p-1 pr-2 transition hover:bg-slate-100">
                    <Avatar name={user.name} src={user.avatar ?? undefined} size="sm" />
                    <div className="hidden text-left md:block">
                        <p className="text-sm font-medium leading-tight text-ink">{user.name}</p>
                        <p className="text-xs leading-tight text-muted">{user.email}</p>
                    </div>
                </div>
            }
        >
            <div className="px-4 py-2 text-left">
                <p className="text-sm font-medium text-ink">{user.name}</p>
                <p className="text-xs text-muted">{user.email}</p>
            </div>
            <div className="my-1 border-t border-slate-200" />
            <Link href="/" className="block px-4 py-2 text-sm text-slate-700 transition hover:bg-slate-50">
                View Site
            </Link>
            <Link href="/admin/settings" className="block px-4 py-2 text-sm text-slate-700 transition hover:bg-slate-50">
                Settings
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

export default function AdminLayout({ children }: { children: ReactNode }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="flex h-screen overflow-hidden">
            <aside className="hidden w-60 flex-shrink-0 flex-col bg-primary-900 text-white lg:flex">
                <SidebarInner />
            </aside>

            {sidebarOpen && (
                <div className="fixed inset-0 z-50 lg:hidden">
                    <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} aria-hidden="true" />
                    <aside className="absolute left-0 top-0 flex h-full w-60 flex-col shadow-xl">
                        <SidebarInner onNavigate={() => setSidebarOpen(false)} />
                    </aside>
                </div>
            )}

            <div className="flex min-w-0 flex-1 flex-col">
                <header className="flex items-center justify-between gap-4 border-b border-slate-200 bg-white px-4 py-3.5 sm:px-6">
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            aria-label="Open menu"
                            onClick={() => setSidebarOpen(true)}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-ink transition hover:bg-slate-100 lg:hidden"
                        >
                            <Menu className="h-5 w-5" />
                        </button>
                        <span className="text-sm font-semibold text-ink lg:hidden">Admin Panel</span>
                    </div>

                    <div className="ml-auto flex items-center gap-2 sm:gap-3">
                        <div className="hidden sm:block">
                            <SearchBar
                                placeholder="Search..."
                                size="sm"
                                onSearch={(q) => {
                                    if (q) router.get('/search', { q });
                                }}
                                className="w-56"
                            />
                        </div>
                        <NotificationsMenu />
                        <ProfileMenu />
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto bg-surface p-4 sm:p-6 lg:p-8">{children}</main>
            </div>
        </div>
    );
}