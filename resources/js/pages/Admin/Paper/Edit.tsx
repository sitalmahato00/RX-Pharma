import { Head } from '@inertiajs/react';
import Form from './Form';

interface Academy {
    id: number;
    name: string;
}

interface PaperResource {
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

interface PreviousPaper {
    id: number;
    resource?: PaperResource;
    year?: number | null;
    exam_type?: string | null;
    file_path?: string | null;
    file_name?: string | null;
    answer_key_path?: string | null;
    has_answer_key: boolean;
}

interface Props {
    paper: PreviousPaper;
    universities: Academy[];
    colleges: Academy[];
    programs: Academy[];
    semesters: Academy[];
    subjects: Academy[];
    units: Academy[];
    topics: Academy[];
}

export default function Edit({ paper, universities, colleges, programs, semesters, subjects, units, topics }: Props) {
    return (
        <>
            <Head title={`Edit ${paper.resource?.title ?? 'Paper'}`} />
            <Form
                paper={paper}
                universities={universities}
                colleges={colleges}
                programs={programs}
                semesters={semesters}
                subjects={subjects}
                units={units}
                topics={topics}
            />
        </>
    );
}