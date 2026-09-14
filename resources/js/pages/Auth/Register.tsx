import { Head, Link, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { Button, Card, Input, Select } from '@/components/ui';

interface Option {
    id: number;
    name: string;
}

interface RegisterPageProps {
    universities: { id: number; name: string }[];
}

export default function Register({ universities }: RegisterPageProps) {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        email: '',
        phone: '',
        university_id: '',
        college_id: '',
        program_id: '',
        semester_id: '',
        password: '',
        password_confirmation: '',
    });

    const [colleges, setColleges] = useState<Option[]>([]);
    const [programs, setPrograms] = useState<Option[]>([]);
    const [semesters, setSemesters] = useState<Option[]>([]);

    const [collegesLoading, setCollegesLoading] = useState(false);
    const [programsLoading, setProgramsLoading] = useState(false);
    const [semestersLoading, setSemestersLoading] = useState(false);

    const [collegesError, setCollegesError] = useState<string | null>(null);
    const [programsError, setProgramsError] = useState<string | null>(null);
    const [semestersError, setSemestersError] = useState<string | null>(null);

    const fetchOptions = async (url: string): Promise<Option[]> => {
        const res = await fetch(url);
        if (!res.ok) throw new Error('Request failed');
        const json = await res.json();
        return Array.isArray(json) ? json : [];
    };

    const handleUniversityChange = async (id: string) => {
        setData((prev) => ({ ...prev, university_id: id, college_id: '', program_id: '', semester_id: '' }));
        setColleges([]);
        setPrograms([]);
        setSemesters([]);
        setCollegesError(null);
        setProgramsError(null);
        setSemestersError(null);

        if (!id) return;
        setCollegesLoading(true);
        setProgramsLoading(true);
        try {
            const [collegeData, programData] = await Promise.all([
                fetchOptions(`/admin/colleges/by-university/${id}`),
                fetchOptions(`/admin/programs/by-university/${id}`),
            ]);
            setColleges(collegeData);
            setPrograms(programData);
        } catch {
            setCollegesError('Could not load colleges. Please try again.');
            setProgramsError('Could not load programs. Please try again.');
        } finally {
            setCollegesLoading(false);
            setProgramsLoading(false);
        }
    };

    const handleProgramChange = async (id: string) => {
        setData((prev) => ({ ...prev, program_id: id, semester_id: '' }));
        setSemesters([]);
        setSemestersError(null);

        if (!id) return;
        setSemestersLoading(true);
        try {
            setSemesters(await fetchOptions(`/admin/semesters/by-program/${id}`));
        } catch {
            setSemestersError('Could not load semesters. Please try again.');
        } finally {
            setSemestersLoading(false);
        }
    };

    const submit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        post('/register', {
            preserveScroll: true,
        });
    };

    return (
        <>
            <Head title="Register" />
            <Card className="w-full max-w-xl p-6 sm:p-8">
                <h1 className="text-xl font-bold text-ink">Create your account</h1>
                <p className="mt-1 text-sm text-muted">Join RX Pharma and start learning today.</p>

                <form onSubmit={submit} className="mt-6 space-y-4">
                    <Input
                        id="name"
                        type="text"
                        label="Full name"
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        autoComplete="name"
                        autoFocus
                        error={errors.name}
                    />

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <Input
                            id="email"
                            type="email"
                            label="Email address"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            autoComplete="email"
                            error={errors.email}
                        />
                        <Input
                            id="phone"
                            type="tel"
                            label="Phone (optional)"
                            value={data.phone}
                            onChange={(e) => setData('phone', e.target.value)}
                            autoComplete="tel"
                            error={errors.phone}
                        />
                    </div>

                    <Select
                        id="university_id"
                        label="University"
                        value={data.university_id}
                        onChange={(e) => handleUniversityChange(e.target.value)}
                        error={errors.university_id}
                    >
                        <option value="">Select university...</option>
                        {universities.map((u) => (
                            <option key={u.id} value={u.id}>
                                {u.name}
                            </option>
                        ))}
                    </Select>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <Select
                            id="college_id"
                            label="College"
                            value={data.college_id}
                            onChange={(e) => setData('college_id', e.target.value)}
                            disabled={!data.university_id || collegesLoading}
                            error={errors.college_id}
                        >
                            <option value="">{collegesLoading ? 'Loading...' : 'Select college...'}</option>
                            {colleges.map((c) => (
                                <option key={c.id} value={c.id}>
                                    {c.name}
                                </option>
                            ))}
                        </Select>
                        <Select
                            id="program_id"
                            label="Program"
                            value={data.program_id}
                            onChange={(e) => handleProgramChange(e.target.value)}
                            disabled={!data.university_id || programsLoading}
                            error={errors.program_id || programsError || undefined}
                        >
                            <option value="">{programsLoading ? 'Loading...' : 'Select program...'}</option>
                            {programs.map((p) => (
                                <option key={p.id} value={p.id}>
                                    {p.name}
                                </option>
                            ))}
                        </Select>
                    </div>

                    {collegesError && (
                        <p className="text-xs text-red-500">
                            {collegesError} Note: this may happen because the source API requires admin access.
                        </p>
                    )}

                    <Select
                        id="semester_id"
                        label="Semester"
                        value={data.semester_id}
                        onChange={(e) => setData('semester_id', e.target.value)}
                        disabled={!data.program_id || semestersLoading}
                        error={errors.semester_id || semestersError || undefined}
                    >
                        <option value="">{semestersLoading ? 'Loading...' : 'Select semester...'}</option>
                        {semesters.map((s) => (
                            <option key={s.id} value={s.id}>
                                {s.name}
                            </option>
                        ))}
                    </Select>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <Input
                            id="password"
                            type="password"
                            label="Password"
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            autoComplete="new-password"
                            error={errors.password}
                        />
                        <Input
                            id="password_confirmation"
                            type="password"
                            label="Confirm password"
                            value={data.password_confirmation}
                            onChange={(e) => setData('password_confirmation', e.target.value)}
                            autoComplete="new-password"
                            error={errors.password_confirmation}
                        />
                    </div>

                    <Button type="submit" className="w-full" loading={processing} disabled={processing}>
                        Create account
                    </Button>

                    <p className="pt-1 text-center text-sm text-muted">
                        Already have an account?{' '}
                        <Link href="/login" className="font-medium text-primary-700 hover:text-primary-800">
                            Log in
                        </Link>
                    </p>
                </form>
            </Card>
        </>
    );
}