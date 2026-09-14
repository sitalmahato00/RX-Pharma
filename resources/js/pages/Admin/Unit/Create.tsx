import { Head } from '@inertiajs/react';
import Form from './Form';

interface Props {
    subjects: { id: number; name: string }[];
    universities?: { id: number; name: string }[];
}

export default function Create({ subjects, universities = [] }: Props) {
    return (
        <>
            <Head title="Create Unit" />
            <Form subjects={subjects} universities={universities} />
        </>
    );
}