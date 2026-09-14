import { Head } from '@inertiajs/react';
import Form from './Form';

interface Props {
    units: { id: number; name: string; subject_id: number; subject?: { id: number; name: string } }[];
}

export default function Create({ units }: Props) {
    return (
        <>
            <Head title="Create Topic" />
            <Form units={units} />
        </>
    );
}