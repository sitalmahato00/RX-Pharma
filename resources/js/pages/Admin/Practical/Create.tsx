import { Head } from '@inertiajs/react';
import Form from './Form';

interface Academy {
    id: number;
    name: string;
}

interface PracticalType {
    value: string;
    label: string;
}

interface Props {
    universities: Academy[];
    colleges: Academy[];
    programs: Academy[];
    semesters: Academy[];
    subjects: Academy[];
    units: Academy[];
    topics: Academy[];
    practicalTypes: PracticalType[];
}

export default function Create({ universities, colleges, programs, semesters, subjects, units, topics, practicalTypes }: Props) {
    return (
        <>
            <Head title="Create Practical" />
            <Form
                universities={universities}
                colleges={colleges}
                programs={programs}
                semesters={semesters}
                subjects={subjects}
                units={units}
                topics={topics}
                practicalTypes={practicalTypes}
            />
        </>
    );
}