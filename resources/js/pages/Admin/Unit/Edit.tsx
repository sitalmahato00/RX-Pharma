import { Head } from '@inertiajs/react';
import Form from './Form';

interface Props {
    unit: {
        id: number;
        name: string;
        slug: string;
        subject_id: number;
        subject?: { id: number; name: string; semester_id?: number | null; program_id?: number | null; semester?: { id?: number; program?: { university_id?: number | null } }; program?: { id?: number; university_id?: number | null } };
        sort_order: number;
        description?: string | null;
        is_active: boolean;
    };
    subjects: { id: number; name: string }[];
    universities?: { id: number; name: string }[];
}

export default function Edit({ unit, subjects, universities = [] }: Props) {
    return (
        <>
            <Head title={`Edit ${unit.name}`} />
            <Form unit={unit} subjects={subjects} universities={universities} />
        </>
    );
}