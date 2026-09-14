import { Head } from '@inertiajs/react';
import Form from './Form';

interface Props {
    semester: {
        id: number;
        name: string;
        slug: string;
        program_id: number;
        number: number;
        is_active: boolean;
        program?: { id: number; university_id?: number | null; university?: { id: number; name: string } };
    };
    universities: { id: number; name: string }[];
}

export default function Edit({ semester, universities }: Props) {
    return (
        <>
            <Head title={`Edit ${semester.name}`} />
            <Form semester={semester} universities={universities} />
        </>
    );
}