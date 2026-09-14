import { Head } from '@inertiajs/react';
import Form from './Form';

interface Props {
    programs: { id: number; name: string }[];
}

export default function Create({ programs }: Props) {
    return (
        <>
            <Head title="Create Semester" />
            <Form programs={programs} />
        </>
    );
}