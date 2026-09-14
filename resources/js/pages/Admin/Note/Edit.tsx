import { Head } from '@inertiajs/react';
import Form from './Form';

interface Academy {
    id: number;
    name: string;
}

interface NoteResource {
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
    tags?: { id: number; name: string }[];
}

interface Note {
    id: number;
    resource?: NoteResource;
    cover_image?: string | null;
    file_name?: string | null;
    file_path?: string | null;
    author?: string | null;
}

interface Props {
    note: Note;
    universities: Academy[];
    colleges: Academy[];
    programs: Academy[];
    semesters: Academy[];
    subjects: Academy[];
    units: Academy[];
    topics: Academy[];
}

export default function Edit({ note, universities, colleges, programs, semesters, subjects, units, topics }: Props) {
    return (
        <>
            <Head title={`Edit ${note.resource?.title ?? 'Note'}`} />
            <Form
                note={note}
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