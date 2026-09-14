import { Head } from '@inertiajs/react';
import Form from './Form';

interface Props {
    semesters: { id: number; name: string; number: number }[];
}

export default function Create({ semesters }: Props) {
    return (
        <>
            <Head title="Create Subject" />
            <Form semesters={semesters} />
        </>
    );
}