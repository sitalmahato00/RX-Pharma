import { Head, useForm, usePage } from '@inertiajs/react';
import { KeyRound, User as UserIcon } from 'lucide-react';
import { Alert, Button, Card, Input, Label, Select } from '@/components/ui';
import type { College, Program, Semester, University, User } from '@/types';

interface ProfileUser extends Omit<User, 'university' | 'college' | 'program' | 'semester'> {
    bio?: string | null;
    university_id?: number | null;
    college_id?: number | null;
    program_id?: number | null;
    semester_id?: number | null;
    university?: University | null;
    college?: College | null;
    program?: Program | null;
    semester?: Semester | null;
}

interface Option {
    id: number;
    name: string;
    university_id?: number;
    program_id?: number;
    number?: number;
}

interface SettingsProps {
    user: ProfileUser;
    universities: Option[];
    colleges: Option[];
    programs: Option[];
    semesters: Option[];
}

interface Flash {
    flash?: { success?: string; error?: string; warning?: string };
    [key: string]: unknown;
}

export default function Settings(props: SettingsProps) {
    const { flash } = usePage<Flash>().props;
    const { user, universities, colleges, programs, semesters } = props;

    const profileForm = useForm({
        name: user.name,
        phone: user.phone ?? '',
        bio: user.bio ?? '',
        university_id: user.university_id?.toString() ?? '',
        college_id: user.college_id?.toString() ?? '',
        program_id: user.program_id?.toString() ?? '',
        semester_id: user.semester_id?.toString() ?? '',
    });

    const passwordForm = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
        logout_other_sessions: false,
    });

    function updateProfile() {
        profileForm.post('/profile', { preserveScroll: true });
    }

    function updatePassword() {
        passwordForm.post('/profile/password', { preserveScroll: true });
    }

    function onUniversityChange(value: string) {
        profileForm.setData({
            university_id: value,
            college_id: '',
            program_id: '',
            semester_id: '',
        });
    }

    function onProgramChange(value: string) {
        profileForm.setData({ program_id: value, semester_id: '' });
    }

    const selectedUniversity = Number(profileForm.data.university_id);
    const selectedProgram = Number(profileForm.data.program_id);

    const universityColleges = selectedUniversity ? colleges.filter((c) => c.university_id === selectedUniversity) : colleges;
    const universityPrograms = selectedUniversity ? programs.filter((p) => p.university_id === selectedUniversity) : programs;
    const programSemesters = selectedProgram ? semesters.filter((s) => s.program_id === selectedProgram) : semesters;

    return (
        <div className="space-y-6">
            <Head title="Settings" />

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
                <h1 className="text-2xl font-bold text-ink">Settings</h1>
                <p className="mt-1 text-sm text-muted">Manage your profile, academic details and security.</p>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                <Card className="p-6">
                    <h2 className="mb-1 flex items-center gap-2 font-semibold text-ink">
                        <UserIcon className="h-5 w-5 text-primary-600" />
                        Profile details
                    </h2>
                    <p className="mb-5 text-sm text-muted">Update your personal and academic information.</p>

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
                                id="settings-name"
                                value={profileForm.data.name}
                                onChange={(e) => profileForm.setData('name', e.target.value)}
                                error={profileForm.errors.name}
                            />
                            <Input
                                label="Phone"
                                id="settings-phone"
                                value={profileForm.data.phone}
                                onChange={(e) => profileForm.setData('phone', e.target.value)}
                                error={profileForm.errors.phone}
                            />
                        </div>

                        <div>
                            <Label htmlFor="settings-bio">Bio</Label>
                            <Input
                                id="settings-bio"
                                value={profileForm.data.bio}
                                onChange={(e) => profileForm.setData('bio', e.target.value)}
                                error={profileForm.errors.bio}
                            />
                        </div>

                        <Select
                            label="University"
                            id="settings-university"
                            value={profileForm.data.university_id}
                            onChange={(e) => onUniversityChange(e.target.value)}
                            error={profileForm.errors.university_id}
                        >
                            <option value="">Select university</option>
                            {universities.map((u) => (
                                <option key={u.id} value={u.id}>
                                    {u.name}
                                </option>
                            ))}
                        </Select>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <Select
                                label="College"
                                id="settings-college"
                                value={profileForm.data.college_id}
                                onChange={(e) => profileForm.setData('college_id', e.target.value)}
                                error={profileForm.errors.college_id}
                            >
                                <option value="">Select college</option>
                                {universityColleges.map((c) => (
                                    <option key={c.id} value={c.id}>
                                        {c.name}
                                    </option>
                                ))}
                            </Select>

                            <Select
                                label="Program"
                                id="settings-program"
                                value={profileForm.data.program_id}
                                onChange={(e) => onProgramChange(e.target.value)}
                                error={profileForm.errors.program_id}
                            >
                                <option value="">Select program</option>
                                {universityPrograms.map((p) => (
                                    <option key={p.id} value={p.id}>
                                        {p.name}
                                    </option>
                                ))}
                            </Select>
                        </div>

                        <Select
                            label="Semester"
                            id="settings-semester"
                            value={profileForm.data.semester_id}
                            onChange={(e) => profileForm.setData('semester_id', e.target.value)}
                            error={profileForm.errors.semester_id}
                        >
                            <option value="">Select semester</option>
                            {programSemesters.map((s) => (
                                <option key={s.id} value={s.id}>
                                    {s.name}
                                </option>
                            ))}
                        </Select>

                        <Button type="submit" loading={profileForm.processing}>
                            Save profile
                        </Button>
                    </form>
                </Card>

                <Card className="p-6">
                    <h2 className="mb-1 flex items-center gap-2 font-semibold text-ink">
                        <KeyRound className="h-5 w-5 text-primary-600" />
                        Change password
                    </h2>
                    <p className="mb-5 text-sm text-muted">Use at least 8 characters for a strong password.</p>

                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            updatePassword();
                        }}
                        className="space-y-4"
                    >
                        <Input
                            type="password"
                            label="Current password"
                            id="settings-current-password"
                            value={passwordForm.data.current_password}
                            onChange={(e) => passwordForm.setData('current_password', e.target.value)}
                            error={passwordForm.errors.current_password}
                        />
                        <Input
                            type="password"
                            label="New password"
                            id="settings-new-password"
                            value={passwordForm.data.password}
                            onChange={(e) => passwordForm.setData('password', e.target.value)}
                            error={passwordForm.errors.password}
                        />
                        <Input
                            type="password"
                            label="Confirm new password"
                            id="settings-confirm-password"
                            value={passwordForm.data.password_confirmation}
                            onChange={(e) => passwordForm.setData('password_confirmation', e.target.value)}
                            error={passwordForm.errors.password_confirmation}
                        />
                        <label className="flex items-center gap-2 text-sm text-slate-700">
                            <input
                                type="checkbox"
                                checked={passwordForm.data.logout_other_sessions}
                                onChange={(e) => passwordForm.setData('logout_other_sessions', e.target.checked)}
                                className="h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-300"
                            />
                            Log me out of other devices
                        </label>
                        <Button type="submit" loading={passwordForm.processing}>
                            Update password
                        </Button>
                    </form>
                </Card>
            </div>
        </div>
    );
}