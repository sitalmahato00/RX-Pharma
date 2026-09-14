import { Head } from '@inertiajs/react';
import Form from './Form';

interface Props {
    universities: { id: number; name: string }[];
}

export default function Create({ universities }: Props) {
    return (
        <>
            <Head title="Create College" />
            <Form universities={universities} />
        </>
    );
}