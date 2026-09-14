import { Head } from '@inertiajs/react';
import Form from './Form';

interface Academy {
    id: number;
    name: string;
}

interface VideoResource {
    id: number;
    title: string;
    description?: string | null;
    status: 'draft' | 'published' | 'archived';
    featured: boolean;
    university_id?: number | null;
    college_id?: number | null;
    program_id?: number | null;
    semester_id?: number | null;
    subject_id?: number | null;
    unit_id?: number | null;
    topic_id?: number | null;
    tags?: { name: string }[];
}

interface Video {
    id: number;
    resource?: VideoResource;
    video_url?: string | null;
    video_path?: string | null;
    video_type: 'url' | 'upload';
    provider?: string | null;
    duration_seconds?: number | null;
    thumbnail?: string | null;
}

interface Props {
    video: Video;
    universities: Academy[];
    colleges: Academy[];
    programs: Academy[];
    semesters: Academy[];
    subjects: Academy[];
    units: Academy[];
    topics: Academy[];
}

export default function Edit({ video, universities, colleges, programs, semesters, subjects, units, topics }: Props) {
    return (
        <>
            <Head title={`Edit ${video.resource?.title ?? 'Video'}`} />
            <Form
                video={video}
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