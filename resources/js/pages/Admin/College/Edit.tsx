import { Head } from '@inertiajs/react';
import Form from './Form';

interface Props {
    college: {
        id: number;
        name: string;
        slug: string;
        university_id: number;
        location?: string | null;
        address?: string | null;
        description?: string | null;
        website?: string | null;
        is_active: boolean;
    };
    universities: { id: number; name: string }[];
}

export default function Edit({ college, universities }: Props) {
    return (
        <>
            <Head title={`Edit ${college.name}`} />
            <Form college={college} universities={universities} />
        </>
    );
}