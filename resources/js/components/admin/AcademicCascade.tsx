import { useEffect, useState } from 'react';
import { Select } from '@/components/ui';

interface HierarchyItem {
    id: number;
    name: string;
}

interface AcademicCascadeProps {
    universities: { id: number; name: string }[];
    values: {
        university_id: number | string;
        college_id: number | string;
        program_id: number | string;
        semester_id: number | string;
        subject_id: number | string;
        unit_id: number | string;
        topic_id: number | string;
    };
    onChange: (field: string, value: number | string) => void;
    errors?: Record<string, string>;
    hideUniversity?: boolean;
}

function useDependentList(url: string, parentId: number | string, enabled: boolean) {
    const [items, setItems] = useState<HierarchyItem[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!parentId || !enabled) {
            setItems([]);
            return;
        }

        let cancelled = false;
        setLoading(true);

        fetch(`${url}/${parentId}`)
            .then((r) => r.json())
            .then((data: HierarchyItem[]) => {
                if (!cancelled) setItems(data);
            })
            .catch(() => {
                if (!cancelled) setItems([]);
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });

        return () => {
            cancelled = true;
        };
    }, [url, parentId, enabled]);

    return { items, loading };
}

export default function AcademicCascade({
    universities,
    values,
    onChange,
    errors = {},
    hideUniversity = false,
}: AcademicCascadeProps) {
    const universityId = values.university_id ?? '';
    const collegeId = values.college_id ?? '';
    const programId = values.program_id ?? '';
    const semesterId = values.semester_id ?? '';
    const subjectId = values.subject_id ?? '';
    const unitId = values.unit_id ?? '';
    const topicId = values.topic_id ?? '';

    const colleges = useDependentList('/admin/colleges/by-university', universityId, !hideUniversity);
    const programs = useDependentList('/admin/programs/by-university', universityId, !hideUniversity);
    const semesters = useDependentList('/admin/semesters/by-program', programId, !!programId);
    const subjects = useDependentList('/admin/subjects/by-semester', semesterId, !!semesterId);
    const units = useDependentList('/admin/units/by-subject', subjectId, !!subjectId);
    const topics = useDependentList('/admin/topics/by-unit', unitId, !!unitId);

    const resetBelow = (field: string) => {
        const order = ['university_id', 'college_id', 'program_id', 'semester_id', 'subject_id', 'unit_id', 'topic_id'];
        const idx = order.indexOf(field);
        if (idx === -1) return;
        for (let i = idx + 1; i < order.length; i++) {
            onChange(order[i], '');
        }
    };

    const handleChange = (field: string, value: number | string) => {
        onChange(field, value);
        resetBelow(field);
    };

    return (
        <div className="space-y-5">
            {!hideUniversity && (
                <Select
                    id="university_id"
                    label="University"
                    value={universityId}
                    onChange={(e) => handleChange('university_id', e.target.value)}
                    error={errors.university_id}
                >
                    <option value="">Select University</option>
                    {universities.map((u) => (
                        <option key={u.id} value={u.id}>{u.name}</option>
                    ))}
                </Select>
            )}

            <div className="grid grid-cols-2 gap-4">
                <Select
                    id="college_id"
                    label="College"
                    value={collegeId}
                    onChange={(e) => handleChange('college_id', e.target.value)}
                    error={errors.college_id}
                    disabled={!colleges.items.length && colleges.loading ? false : !colleges.items.length}
                >
                    <option value="">Select College</option>
                    {colleges.items.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                </Select>

                <Select
                    id="program_id"
                    label="Program"
                    value={programId}
                    onChange={(e) => handleChange('program_id', e.target.value)}
                    error={errors.program_id}
                    disabled={!programs.items.length}
                >
                    <option value="">Select Program</option>
                    {programs.items.map((p) => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                </Select>
            </div>

            <Select
                id="semester_id"
                label="Semester"
                value={semesterId}
                onChange={(e) => handleChange('semester_id', e.target.value)}
                error={errors.semester_id}
                disabled={!semesters.items.length}
            >
                <option value="">Select Semester</option>
                {semesters.items.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                ))}
            </Select>

            <Select
                id="subject_id"
                label="Subject"
                value={subjectId}
                onChange={(e) => handleChange('subject_id', e.target.value)}
                error={errors.subject_id}
                disabled={!subjects.items.length}
            >
                <option value="">Select Subject</option>
                {subjects.items.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                ))}
            </Select>

            <div className="grid grid-cols-2 gap-4">
                <Select
                    id="unit_id"
                    label="Unit"
                    value={unitId}
                    onChange={(e) => handleChange('unit_id', e.target.value)}
                    error={errors.unit_id}
                    disabled={!units.items.length}
                >
                    <option value="">Select Unit</option>
                    {units.items.map((u) => (
                        <option key={u.id} value={u.id}>{u.name}</option>
                    ))}
                </Select>

                <Select
                    id="topic_id"
                    label="Topic"
                    value={topicId}
                    onChange={(e) => handleChange('topic_id', e.target.value)}
                    error={errors.topic_id}
                    disabled={!topics.items.length}
                >
                    <option value="">Select Topic</option>
                    {topics.items.map((t) => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                </Select>
            </div>
        </div>
    );
}