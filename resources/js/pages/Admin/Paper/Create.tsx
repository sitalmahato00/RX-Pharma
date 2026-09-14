import { Head } from '@inertiajs/react';
import Form from './Form';

interface Academy {
    id: number;
    name: string;
}

interface Props {
    universities: Academy[];
    colleges: Academy[];
    programs: Academy[];
    semesters: Academy[];
    subjects: Academy[];
    units: Academy[];
    topics: Academy[];
}

export default function Create({ universities, colleges, programs, semesters, subjects, units, topics }: Props) {
    return (
        <>
            <Head title="Create Paper" />
            <Form
                universities={universities}
                colleges={colleges}
                programs={programs}
                semesters={semesters}
                subjects={subjects}
                units={units}
                topics={topics}
            />
        </>
    );
}