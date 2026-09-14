import { Head } from '@inertiajs/react';
import Form from './Form';

interface Academy {
    id: number;
    name: string;
}

interface Category {
    value: string;
    label: string;
}

interface LiteratureResource {
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

interface Literature {
    id: number;
    resource?: LiteratureResource;
    category?: string | null;
    author?: string | null;
    organization?: string | null;
    year?: number | null;
    file_path?: string | null;
    external_url?: string | null;
    cover_image?: string | null;
}

interface Props {
    literature: Literature;
    universities: Academy[];
    colleges: Academy[];
    programs: Academy[];
    semesters: Academy[];
    subjects: Academy[];
    units: Academy[];
    topics: Academy[];
    categories: Category[];
}

export default function Edit({ literature, universities, colleges, programs, semesters, subjects, units, topics, categories }: Props) {
    return (
        <>
            <Head title={`Edit ${literature.resource?.title ?? 'Literature'}`} />
            <Form
                literature={literature}
                universities={universities}
                colleges={colleges}
                programs={programs}
                semesters={semesters}
                subjects={subjects}
                units={units}
                topics={topics}
                categories={categories}
            />
        </>
    );
}