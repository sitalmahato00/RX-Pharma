import { Head } from '@inertiajs/react';
import Form from './Form';

interface Props {
    semesters: { id: number; name: string; number: number }[];
    universities?: { id: number; name: string }[];
}

export default function Create({ semesters, universities = [] }: Props) {
    return (
        <>
            <Head title="Create Subject" />
            <Form semesters={semesters} universities={universities} />
        </>
    );
}