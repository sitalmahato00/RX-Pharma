import { Link, useForm, usePage } from '@inertiajs/react';
import { Alert, Button, Card, Input, Label, Select, Textarea } from '@/components/ui';
import { ArrowLeft } from 'lucide-react';
import { useEffect, useState } from 'react';

interface HierarchyItem { id: number; name: string; }

interface Semester {
    id: number;
    name: string;
    number: number;
}

interface Subject {
    id: number;
    name: string;
    slug: string;
    semester_id?: number | null;
    program_id?: number | null;
    program?: { id?: number; university_id?: number | null; university?: { id: number; name: string } };
    semester?: { id?: number; program?: { university_id?: number | null } };
    code?: string | null;
    description?: string | null;
    color?: string | null;
    is_active: boolean;
}

interface Props {
    subject?: Subject;
    semesters: Semester[];
    universities?: { id: number; name: string }[];
}

const semesterLabel = (s: Semester) => `Semester ${s.number} · ${s.name}`;

export default function Form({ subject, semesters, universities = [] }: Props) {
    const { flash } = usePage<{ flash: { success?: string } }>().props;
    const isEdit = !!subject;
    const initialUniversityId = subject?.semester?.program?.university_id ?? subject?.program?.university_id ?? '';

    const { data, setData, post, put, processing, errors } = useForm({
        university_id: initialUniversityId,
        college_id: '',
        program_id: subject?.program_id ?? '',
        semester_id: subject?.semester_id ?? '',
        name: subject?.name ?? '',
        code: subject?.code ?? '',
        description: subject?.description ?? '',
        color: subject?.color ?? '',
        is_active: subject?.is_active ?? true,
    });

    const [colleges, setColleges] = useState<HierarchyItem[]>([]);
    const [programs, setPrograms] = useState<HierarchyItem[]>([]);
    const [availableSemesters, setAvailableSemesters] = useState<Semester[]>([]);
    const [loadingColleges, setLoadingColleges] = useState(false);
    const [loadingPrograms, setLoadingPrograms] = useState(false);
    const [loadingSemesters, setLoadingSemesters] = useState(false);

    useEffect(() => {
        if (!data.university_id) {
            setColleges([]);
            setPrograms([]);
            return;
        }

        let cancelled = false;
        setLoadingColleges(true);
        setLoadingPrograms(true);

        Promise.all([
            fetch(`/admin/colleges/by-university/${data.university_id}`).then((response) => response.json()),
            fetch(`/admin/programs/by-university/${data.university_id}`).then((response) => response.json()),
        ])
            .then(([collegeItems, programItems]) => {
                if (cancelled) return;
                setColleges(collegeItems);
                setPrograms(programItems);
            })
            .catch(() => {
                if (cancelled) return;
                setColleges([]);
                setPrograms([]);
            })
            .finally(() => {
                if (cancelled) return;
                setLoadingColleges(false);
                setLoadingPrograms(false);
            });

        return () => {
            cancelled = true;
        };
    }, [data.university_id]);

    useEffect(() => {
        if (!data.program_id) {
            setAvailableSemesters([]);
            return;
        }

        let cancelled = false;
        setLoadingSemesters(true);

        fetch(`/admin/semesters/by-program/${data.program_id}`)
            .then((response) => response.json())
            .then((entries: Semester[]) => {
                if (!cancelled) setAvailableSemesters(entries);
            })
            .catch(() => {
                if (!cancelled) setAvailableSemesters([]);
            })
            .finally(() => {
                if (!cancelled) setLoadingSemesters(false);
            });

        return () => {
            cancelled = true;
        };
    }, [data.program_id]);

    const handleUniversityChange = (value: string) => {
        setData((current) => ({ ...current, university_id: value, college_id: '', program_id: '', semester_id: '' }));
    };

    const handleProgramChange = (value: string) => {
        setData((current) => ({ ...current, program_id: value, semester_id: '' }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isEdit) {
            put(`/admin/subjects/${subject!.id}`);
        } else {
            post('/admin/subjects');
        }
    };

    return (
        <>
            <Link href="/admin/subjects" className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-ink">
                <ArrowLeft className="h-4 w-4" /> Back to Subjects
            </Link>

            {flash.success && <Alert type="success" dismissible>{flash.success}</Alert>}

            <Card className="mx-auto max-w-2xl p-6">
                <h1 className="mb-6 text-xl font-bold text-ink">{isEdit ? 'Edit Subject' : 'Create Subject'}</h1>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <Select
                        id="university_id"
                        label="University"
                        value={data.university_id}
                        onChange={(e) => handleUniversityChange(e.target.value)}
                        error={errors.university_id}
                        required
                    >
                        <option value="">Select University</option>
                        {universities.map((university) => (
                            <option key={university.id} value={university.id}>{university.name}</option>
                        ))}
                    </Select>

                    <Select
                        id="college_id"
                        label="College"
                        value={data.college_id}
                        onChange={(e) => setData('college_id', e.target.value)}
                        disabled={!data.university_id || loadingColleges || !colleges.length}
                    >
                        <option value="">{loadingColleges ? 'Loading colleges...' : 'Select College'}</option>
                        {colleges.map((college) => (
                            <option key={college.id} value={college.id}>{college.name}</option>
                        ))}
                    </Select>

                    <Select
                        id="program_id"
                        label="Program"
                        value={data.program_id}
                        onChange={(e) => handleProgramChange(e.target.value)}
                        error={errors.program_id}
                        disabled={!data.university_id || loadingPrograms || !programs.length}
                        required
                    >
                        <option value="">{loadingPrograms ? 'Loading programs...' : 'Select Program'}</option>
                        {programs.map((program) => (
                            <option key={program.id} value={program.id}>{program.name}</option>
                        ))}
                    </Select>

                    <Select
                        id="semester_id"
                        label="Semester"
                        value={data.semester_id}
                        onChange={(e) => setData('semester_id', e.target.value)}
                        error={errors.semester_id}
                        disabled={!data.program_id || loadingSemesters || !availableSemesters.length}
                        required
                    >
                        <option value="">{loadingSemesters ? 'Loading semesters...' : 'Select Semester'}</option>
                        {availableSemesters.map((s) => (
                            <option key={s.id} value={s.id}>{semesterLabel(s)}</option>
                        ))}
                    </Select>

                    <Input
                        id="name"
                        label="Name"
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        error={errors.name}
                        required
                    />

                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            id="code"
                            label="Code"
                            value={data.code}
                            onChange={(e) => setData('code', e.target.value)}
                            error={errors.code}
                        />
                        <Input
                            id="color"
                            label="Color"
                            type="color"
                            value={data.color || '#0b63ce'}
                            onChange={(e) => setData('color', e.target.value)}
                            error={errors.color}
                            className="h-12 p-1.5"
                        />
                    </div>

                    <Textarea
                        id="description"
                        label="Description"
                        value={data.description}
                        onChange={(e) => setData('description', e.target.value)}
                        error={errors.description}
                        rows={4}
                    />

                    <label className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            checked={data.is_active}
                            onChange={(e) => setData('is_active', e.target.checked)}
                            className="h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                        />
                        <Label>Active</Label>
                    </label>

                    <div className="flex items-center gap-3 border-t border-slate-200 pt-5">
                        <Button type="submit" loading={processing}>{isEdit ? 'Update Subject' : 'Create Subject'}</Button>
                        <Link href="/admin/subjects" className="text-sm font-medium text-muted hover:text-ink">Cancel</Link>
                    </div>
                </form>
            </Card>
        </>
    );
}