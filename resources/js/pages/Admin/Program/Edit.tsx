import { Head } from '@inertiajs/react';
import Form from './Form';

interface Props {
    program: {
        id: number;
        name: string;
        slug: string;
        university_id?: number | null;
        code?: string | null;
        level?: string | null;
        duration_years?: number | null;
        description?: string | null;
        is_active: boolean;
    };
    universities: { id: number; name: string }[];
}

export default function Edit({ program, universities }: Props) {
    return (
        <>
            <Head title={`Edit ${program.name}`} />
            <Form program={program} universities={universities} />
        </>
    );
}