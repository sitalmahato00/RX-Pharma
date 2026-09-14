import { Link, useForm, usePage } from '@inertiajs/react';
import { Alert, Button, Card, Input, Label, Select } from '@/components/ui';
import { ArrowLeft } from 'lucide-react';
import { useEffect, useState } from 'react';

interface HierarchyItem {
    id: number;
    name: string;
}

interface Semester {
    id: number;
    name: string;
    slug: string;
    program_id: number;
    number: number;
    is_active: boolean;
    program?: { university_id?: number | null; university?: { id: number; name: string } };
}

interface Props {
    semester?: Semester;
    universities: HierarchyItem[];
}

export default function Form({ semester, universities }: Props) {
    const { flash } = usePage<{ flash: { success?: string } }>().props;
    const isEdit = !!semester;
    const initialUniversityId = semester?.program?.university_id ?? '';

    const { data, setData, post, put, processing, errors } = useForm({
        university_id: initialUniversityId,
        college_id: '',
        program_id: semester?.program_id ?? '',
        name: semester?.name ?? '',
        number: semester?.number ?? '',
        is_active: semester?.is_active ?? true,
    });

    const [colleges, setColleges] = useState<HierarchyItem[]>([]);
    const [programs, setPrograms] = useState<HierarchyItem[]>([]);
    const [loadingColleges, setLoadingColleges] = useState(false);
    const [loadingPrograms, setLoadingPrograms] = useState(false);

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

    const handleUniversityChange = (value: string) => {
        setData((current) => ({ ...current, university_id: value, college_id: '', program_id: '' }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isEdit) {
            put(`/admin/semesters/${semester!.id}`);
        } else {
            post('/admin/semesters');
        }
    };

    return (
        <>
            <Link href="/admin/semesters" className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-ink">
                <ArrowLeft className="h-4 w-4" /> Back to Semesters
            </Link>

            {flash.success && <Alert type="success" dismissible>{flash.success}</Alert>}

            <Card className="mx-auto max-w-2xl p-6">
                <h1 className="mb-6 text-xl font-bold text-ink">{isEdit ? 'Edit Semester' : 'Create Semester'}</h1>

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
                        onChange={(e) => setData('program_id', e.target.value)}
                        error={errors.program_id}
                        disabled={!data.university_id || loadingPrograms || !programs.length}
                        required
                    >
                        <option value="">{loadingPrograms ? 'Loading programs...' : 'Select Program'}</option>
                        {programs.map((p) => (
                            <option key={p.id} value={p.id}>{p.name}</option>
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
                            id="number"
                            label="Number"
                            type="number"
                            min={1}
                            max={12}
                            value={data.number}
                            onChange={(e) => setData('number', e.target.value)}
                            error={errors.number}
                            required
                        />
                    </div>

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
                        <Button type="submit" loading={processing}>{isEdit ? 'Update Semester' : 'Create Semester'}</Button>
                        <Link href="/admin/semesters" className="text-sm font-medium text-muted hover:text-ink">Cancel</Link>
                    </div>
                </form>
            </Card>
        </>
    );
}