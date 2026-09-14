import { Head } from '@inertiajs/react';
import Form from './Form';

interface Props {
    subject: {
        id: number;
        name: string;
        slug: string;
        semester_id?: number | null;
        program_id?: number | null;
        code?: string | null;
        description?: string | null;
        color?: string | null;
        is_active: boolean;
    };
    semesters: { id: number; name: string; number: number }[];
}

export default function Edit({ subject, semesters }: Props) {
    return (
        <>
            <Head title={`Edit ${subject.name}`} />
            <Form subject={subject} semesters={semesters} />
        </>
    );
}