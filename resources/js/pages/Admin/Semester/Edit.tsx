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
    };
    programs: { id: number; name: string }[];
}

export default function Edit({ semester, programs }: Props) {
    return (
        <>
            <Head title={`Edit ${semester.name}`} />
            <Form semester={semester} programs={programs} />
        </>
    );
}