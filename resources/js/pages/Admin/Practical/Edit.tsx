import { Head } from '@inertiajs/react';
import Form from './Form';

interface Academy {
    id: number;
    name: string;
}

interface PracticalType {
    value: string;
    label: string;
}

interface PracticalResourceModel {
    id: number;
    title: string;
    description?: string | null;
    status: 'draft' | 'published' | 'archived';
    featured: boolean;
    university_id?: number | null;
    college_id?: number | null;
    program_id?: number | null;
    semester_id?: number | null;
    subject_id?: number | null;
    unit_id?: number | null;
    topic_id?: number | null;
    tags?: { name: string }[];
}

interface Practical {
    id: number;
    resource?: PracticalResourceModel;
    practical_type?: string | null;
    resource_path?: string | null;
    thumbnail?: string | null;
    steps?: string[] | null;
}

interface Props {
    practical: Practical;
    universities: Academy[];
    colleges: Academy[];
    programs: Academy[];
    semesters: Academy[];
    subjects: Academy[];
    units: Academy[];
    topics: Academy[];
    practicalTypes: PracticalType[];
}

export default function Edit({ practical, universities, colleges, programs, semesters, subjects, units, topics, practicalTypes }: Props) {
    return (
        <>
            <Head title={`Edit ${practical.resource?.title ?? 'Practical'}`} />
            <Form
                practical={practical}
                universities={universities}
                colleges={colleges}
                programs={programs}
                semesters={semesters}
                subjects={subjects}
                units={units}
                topics={topics}
                practicalTypes={practicalTypes}
            />
        </>
    );
}