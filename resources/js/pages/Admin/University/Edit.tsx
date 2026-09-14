import { Head } from '@inertiajs/react';
import Form from './Form';

interface Props {
    university: {
        id: number;
        name: string;
        slug: string;
        code?: string | null;
        acronym?: string | null;
        location?: string | null;
        description?: string | null;
        website?: string | null;
        is_active: boolean;
    };
}

export default function Edit({ university }: Props) {
    return (
        <>
            <Head title={`Edit ${university.name}`} />
            <Form university={university} />
        </>
    );
}