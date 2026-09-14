import { Head } from '@inertiajs/react';
import Form from './Form';

interface Props {
    unit: {
        id: number;
        name: string;
        slug: string;
        subject_id: number;
        sort_order: number;
        description?: string | null;
        is_active: boolean;
    };
    subjects: { id: number; name: string }[];
}

export default function Edit({ unit, subjects }: Props) {
    return (
        <>
            <Head title={`Edit ${unit.name}`} />
            <Form unit={unit} subjects={subjects} />
        </>
    );
}