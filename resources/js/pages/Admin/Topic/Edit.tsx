import { Head } from '@inertiajs/react';
import Form from './Form';

interface Props {
    topic: {
        id: number;
        name: string;
        slug: string;
        unit_id: number;
        sort_order: number;
        description?: string | null;
        is_active: boolean;
    };
    units: { id: number; name: string; subject_id: number; subject?: { id: number; name: string } }[];
}

export default function Edit({ topic, units }: Props) {
    return (
        <>
            <Head title={`Edit ${topic.name}`} />
            <Form topic={topic} units={units} />
        </>
    );
}