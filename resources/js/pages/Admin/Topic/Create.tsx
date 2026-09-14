import { Head } from '@inertiajs/react';
import Form from './Form';

interface Props {
    units: { id: number; name: string; subject_id: number; subject?: { id: number; name: string } }[];
    universities?: { id: number; name: string }[];
}

export default function Create({ units, universities = [] }: Props) {
    return (
        <>
            <Head title="Create Topic" />
            <Form units={units} universities={universities} />
        </>
    );
}