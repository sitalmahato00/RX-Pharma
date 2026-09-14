import { Head, Link, useForm, usePage } from '@inertiajs/react';
import {
    GraduationCap,
    Bookmark,
    Building2,
    CheckCircle2,
    Layers,
    Mail,
    MessagesSquare,
    Phone,
    School,
    Settings,
    ShieldCheck,
    TrendingUp,
    type LucideIcon,
} from 'lucide-react';
import { Alert, Avatar, Badge, Button, Card, Input, Label, StatCard, Textarea, type StatAccent } from '@/components/ui';
import type { College, Program, Semester, University, User } from '@/types';

interface ProfileUser extends Omit<User, 'university' | 'college' | 'program' | 'semester'> {
    bio?: string | null;
    avatar?: string | null;
    avatar_url?: string | null;
    university?: University | null;
    college?: College | null;
    program?: Program | null;
    semester?: Semester | null;
}

interface ProfileProps {
    user: ProfileUser;
    stats: {
        bookmarks: number;
        completed_resources: number;
        quiz_attempts: number;
        average_score: number;
        discussions: number;
    };
}

interface Flash {
    flash?: { success?: string; error?: string; warning?: string };
    [key: string]: unknown;
}

export default function Profile(props: ProfileProps) {
    const { flash } = usePage<Flash>().props;
    const { user, stats } = props;

    const profileForm = useForm({
        name: user.name,
        phone: user.phone ?? '',
        bio: user.bio ?? '',
    });

    function updateProfile() {
        profileForm.post('/profile', { preserveScroll: true });
    }

    const academic = [
        { icon: School, label: 'University', value: user.university?.name },
        { icon: Building2, label: 'College', value: user.college?.name },
        { icon: GraduationCap, label: 'Program', value: user.program?.name },
        { icon: Layers, label: 'Semester', value: user.semester?.name },
    ];

    const statCards: { icon: LucideIcon; label: string; value: string | number; accent: StatAccent }[] = [
        { icon: Bookmark, label: 'Bookmarks', value: stats.bookmarks, accent: 'primary' },
        { icon: CheckCircle2, label: 'Completed', value: stats.completed_resources, accent: 'green' },
        { icon: GraduationCap, label: 'Quiz attempts', value: stats.quiz_attempts, accent: 'orange' },
        { icon: TrendingUp, label: 'Avg score', value: `${stats.average_score}%`, accent: 'purple' },
        { icon: MessagesSquare, label: 'Discussions', value: stats.discussions, accent: 'amber' },
    ];

    return (
        <div className="space-y-6">
            <Head title="Profile" />

            {flash?.success && (
                <Alert type="success" dismissible>
                    {flash.success}
                </Alert>
            )}
            {flash?.error && (
                <Alert type="error" dismissible>
                    {flash.error}
                </Alert>
            )}
            {flash?.warning && (
                <Alert type="warning" dismissible>
                    {flash.warning}
                </Alert>
            )}

            <div>
                <h1 className="text-2xl font-bold text-ink">Profile</h1>
                <p className="mt-1 text-sm text-muted">Your account details and academic information.</p>
            </div>

            <Card className="flex flex-col gap-5 p-6 sm:flex-row sm:items-start">
                <Avatar name={user.name} src={user.avatar_url ?? user.avatar ?? undefined} size="lg" />
                <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-lg font-semibold text-ink">{user.name}</h2>
                        <Badge size="sm" color="blue">
                            <ShieldCheck className="mr-1 h-3 w-3" />
                            Student
                        </Badge>
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted">
                        <span className="inline-flex items-center gap-1.5">
                            <Mail className="h-4 w-4" />
                            {user.email}
                        </span>
                        {user.phone && (
                            <span className="inline-flex items-center gap-1.5">
                                <Phone className="h-4 w-4" />
                                {user.phone}
                            </span>
                        )}
                    </div>
                    {user.bio && <p className="mt-3 text-sm text-muted">{user.bio}</p>}
                    <div className="mt-4 flex flex-wrap gap-2">
                        {academic.map((item) => (
                            <div key={item.label} className="flex items-center gap-1.5 rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs text-ink">
                                <item.icon className="h-3.5 w-3.5 text-primary-600" />
                                <span className="text-muted">{item.label}:</span>
                                <span className="font-medium">{item.value ?? 'Not set'}</span>
                            </div>
                        ))}
                    </div>
                </div>
                <Button variant="secondary" href="/settings" className="shrink-0">
                    <Settings className="h-4 w-4" />
                    Edit in settings
                </Button>
            </Card>

            <section className="grid grid-cols-2 gap-4 md:grid-cols-5">
                {statCards.map((card) => (
                    <StatCard key={card.label} icon={card.icon} label={card.label} value={card.value} accent={card.accent} />
                ))}
            </section>

            <Card className="p-6">
                <h2 className="mb-1 font-semibold text-ink">Edit profile</h2>
                <p className="mb-5 text-sm text-muted">Update your name, phone and bio. Academic details can be changed in Settings.</p>
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        updateProfile();
                    }}
                    className="space-y-4"
                >
                    <div className="grid gap-4 sm:grid-cols-2">
                        <Input
                            label="Full name"
                            id="profile-name"
                            value={profileForm.data.name}
                            onChange={(e) => profileForm.setData('name', e.target.value)}
                            error={profileForm.errors.name}
                        />
                        <Input
                            label="Phone"
                            id="profile-phone"
                            value={profileForm.data.phone}
                            onChange={(e) => profileForm.setData('phone', e.target.value)}
                            error={profileForm.errors.phone}
                        />
                    </div>
                    <div>
                        <Label htmlFor="profile-bio">Bio</Label>
                        <Textarea
                            id="profile-bio"
                            rows={3}
                            value={profileForm.data.bio}
                            onChange={(e) => profileForm.setData('bio', e.target.value)}
                            placeholder="A short description about yourself"
                            error={profileForm.errors.bio}
                        />
                    </div>
                    <Button type="submit" loading={profileForm.processing}>
                        Save profile
                    </Button>
                </form>
            </Card>
        </div>
    );
}