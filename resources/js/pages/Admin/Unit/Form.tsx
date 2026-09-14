import { Link, useForm, usePage } from '@inertiajs/react';
import { Alert, Button, Card, Input, Label, Select, Textarea } from '@/components/ui';
import { ArrowLeft } from 'lucide-react';
import { useEffect, useState } from 'react';

interface HierarchyItem { id: number; name: string; }

interface Subject {
    id: number;
    name: string;
    semester_id?: number | null;
    program_id?: number | null;
    semester?: { id?: number; program?: { university_id?: number | null } };
    program?: { id?: number; university_id?: number | null };
}

interface Unit {
    id: number;
    name: string;
    slug: string;
    subject_id?: number;
    subject?: Subject;
    sort_order: number;
    description?: string | null;
    is_active: boolean;
}

interface UnitFormData {
    university_id: number | string;
    college_id: number | string;
    program_id: number | string;
    semester_id: number | string;
    subject_id: number | string;
    name: string;
    sort_order: number | string;
    description: string;
    is_active: boolean;
}

interface Props {
    unit?: Unit;
    subjects: Subject[];
    universities?: { id: number; name: string }[];
}

export default function Form({ unit, subjects, universities = [] }: Props) {
    const { flash } = usePage<{ flash: { success?: string } }>().props;
    const isEdit = !!unit;
    const initialUniversityId = unit?.subject?.semester?.program?.university_id ?? unit?.subject?.program?.university_id ?? '';

    const { data, setData, post, put, processing, errors } = useForm<UnitFormData>({
        university_id: initialUniversityId,
        college_id: '',
        program_id: unit?.subject?.program_id ?? '',
        semester_id: unit?.subject?.semester_id ?? '',
        subject_id: unit?.subject_id ?? '',
        name: unit?.name ?? '',
        sort_order: unit?.sort_order ?? '',
        description: unit?.description ?? '',
        is_active: unit?.is_active ?? true,
    });

    const [colleges, setColleges] = useState<HierarchyItem[]>([]);
    const [programs, setPrograms] = useState<HierarchyItem[]>([]);
    const [semesters, setSemesters] = useState<{ id: number; name: string; number: number }[]>([]);
    const [filteredSubjects, setFilteredSubjects] = useState<Subject[]>([]);
    const [loadingColleges, setLoadingColleges] = useState(false);
    const [loadingPrograms, setLoadingPrograms] = useState(false);
    const [loadingSemesters, setLoadingSemesters] = useState(false);
    const [loadingSubjects, setLoadingSubjects] = useState(false);

    useEffect(() => {
        if (!data.university_id) {
            setColleges([]);
            setPrograms([]);
            setSemesters([]);
            setFilteredSubjects([]);
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
            setSemesters([]);
            return;
        }

        let cancelled = false;
        setLoadingSemesters(true);

        fetch(`/admin/semesters/by-program/${data.program_id}`)
            .then((response) => response.json())
            .then((entries) => {
                if (cancelled) return;
                setSemesters(entries);
            })
            .catch(() => {
                if (cancelled) return;
                setSemesters([]);
            })
            .finally(() => {
                if (cancelled) return;
                setLoadingSemesters(false);
            });

        return () => {
            cancelled = true;
        };
    }, [data.program_id]);

    useEffect(() => {
        if (!data.semester_id) {
            setFilteredSubjects([]);
            return;
        }

        let cancelled = false;
        setLoadingSubjects(true);

        fetch(`/admin/subjects/by-semester/${data.semester_id}`)
            .then((response) => response.json())
            .then((entries: Subject[]) => {
                if (!cancelled) setFilteredSubjects(entries);
            })
            .catch(() => {
                if (!cancelled) setFilteredSubjects([]);
            })
            .finally(() => {
                if (!cancelled) setLoadingSubjects(false);
            });

        return () => {
            cancelled = true;
        };
    }, [data.semester_id]);

    const handleUniversityChange = (value: string) => {
        setData((current) => ({ ...current, university_id: value, college_id: '', program_id: '', semester_id: '', subject_id: '' }));
    };

    const handleProgramChange = (value: string) => {
        setData((current) => ({ ...current, program_id: value, semester_id: '', subject_id: '' }));
    };

    const handleSemesterChange = (value: string) => {
        setData((current) => ({ ...current, semester_id: value, subject_id: '' }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isEdit) {
            put(`/admin/units/${unit!.id}`);
        } else {
            post('/admin/units');
        }
    };

    return (
        <>
            <Link href="/admin/units" className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-ink">
                <ArrowLeft className="h-4 w-4" /> Back to Units
            </Link>

            {flash.success && <Alert type="success" dismissible>{flash.success}</Alert>}

            <Card className="mx-auto max-w-2xl p-6">
                <h1 className="mb-6 text-xl font-bold text-ink">{isEdit ? 'Edit Unit' : 'Create Unit'}</h1>

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
                        onChange={(e) => handleSemesterChange(e.target.value)}
                        error={errors.semester_id}
                        disabled={!data.program_id || loadingSemesters || !semesters.length}
                        required
                    >
                        <option value="">{loadingSemesters ? 'Loading semesters...' : 'Select Semester'}</option>
                        {semesters.map((semester) => (
                            <option key={semester.id} value={semester.id}>{semester.name}</option>
                        ))}
                    </Select>

                    <Select
                        id="subject_id"
                        label="Subject"
                        value={data.subject_id}
                        onChange={(e) => setData('subject_id', e.target.value)}
                        error={errors.subject_id}
                        disabled={!data.semester_id || loadingSubjects || !filteredSubjects.length}
                        required
                    >
                        <option value="">{loadingSubjects ? 'Loading subjects...' : 'Select Subject'}</option>
                        {filteredSubjects.map((s) => (
                            <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                    </Select>

                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            id="name"
                            label="Name"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            error={errors.name}
                            required
                        />
                        <Input
                            id="sort_order"
                            label="Sort Order"
                            type="number"
                            min={0}
                            value={data.sort_order}
                            onChange={(e) => setData('sort_order', e.target.value)}
                            error={errors.sort_order}
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
                        <Button type="submit" loading={processing}>{isEdit ? 'Update Unit' : 'Create Unit'}</Button>
                        <Link href="/admin/units" className="text-sm font-medium text-muted hover:text-ink">Cancel</Link>
                    </div>
                </form>
            </Card>
        </>
    );
}