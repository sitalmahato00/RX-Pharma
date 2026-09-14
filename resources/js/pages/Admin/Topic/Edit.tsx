import { Head } from '@inertiajs/react';
import Form from './Form';

interface Props {
    topic: {
        id: number;
        name: string;
        slug: string;
        unit_id: number;
        unit?: { id: number; name: string; subject?: { id: number; name: string; semester_id?: number | null; program_id?: number | null; semester?: { id?: number; program?: { university_id?: number | null } }; program?: { id?: number; university_id?: number | null } } };
        sort_order: number;
        description?: string | null;
        is_active: boolean;
    };
    units: { id: number; name: string; subject_id: number; subject?: { id: number; name: string } }[];
    universities?: { id: number; name: string }[];
}

export default function Edit({ topic, units, universities = [] }: Props) {
    return (
        <>
            <Head title={`Edit ${topic.name}`} />
            <Form topic={topic} units={units} universities={universities} />
        </>
    );
}