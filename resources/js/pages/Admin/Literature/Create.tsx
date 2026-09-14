import { Head } from '@inertiajs/react';
import Form from './Form';

interface Academy {
    id: number;
    name: string;
}

interface Category {
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
    categories: Category[];
}

export default function Create({ universities, colleges, programs, semesters, subjects, units, topics, categories }: Props) {
    return (
        <>
            <Head title="Create Literature" />
            <Form
                universities={universities}
                colleges={colleges}
                programs={programs}
                semesters={semesters}
                subjects={subjects}
                units={units}
                topics={topics}
                categories={categories}
            />
        </>
    );
}