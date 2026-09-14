export interface User {
    id: number;
    name: string;
    email: string;
    phone?: string | null;
    role: 'student' | 'admin';
    avatar?: string | null;
    university?: string | null;
    college?: string | null;
    program?: string | null;
    semester?: string | null;
}

export interface AppNotification {
    id: number;
    title: string;
    body?: string | null;
    link?: string | null;
    read_at?: string | null;
    created_at: string;
}

export interface University {
    id: number;
    name: string;
    slug: string;
    code?: string | null;
    location?: string | null;
    description?: string | null;
    logo_url?: string | null;
    acronym?: string | null;
    is_active: boolean;
    colleges_count?: number;
    resources_count?: number;
}

export interface College {
    id: number;
    university_id: number;
    name: string;
    slug: string;
    location?: string | null;
    description?: string | null;
    logo_url?: string | null;
    is_active: boolean;
    university?: University;
    resources_count?: number;
}

export interface Program {
    id: number;
    university_id?: number | null;
    name: string;
    slug: string;
    code?: string | null;
    level?: string | null;
    duration_years?: number | null;
    description?: string | null;
    university?: University;
}

export interface Semester {
    id: number;
    program_id: number;
    name: string;
    slug: string;
    number: number;
    program?: Program;
}

export interface Subject {
    id: number;
    semester_id?: number | null;
    program_id?: number | null;
    name: string;
    slug: string;
    code?: string | null;
    description?: string | null;
    color?: string | null;
    is_active: boolean;
    semester?: Semester;
    program?: Program;
    resources_count?: number;
    units_count?: number;
}

export interface Unit {
    id: number;
    subject_id: number;
    name: string;
    slug: string;
    description?: string | null;
    sort_order: number;
}

export interface Topic {
    id: number;
    unit_id: number;
    name: string;
    slug: string;
    description?: string | null;
    sort_order: number;
}

export type ResourceType = 'note' | 'video' | 'literature' | 'previous_paper' | 'practical';

export interface Tag {
    id: number;
    name: string;
    slug: string;
}

export interface Resource {
    id: number;
    title: string;
    slug: string;
    description?: string | null;
    resource_type: ResourceType;
    university_id?: number | null;
    college_id?: number | null;
    program_id?: number | null;
    semester_id?: number | null;
    subject_id?: number | null;
    unit_id?: number | null;
    topic_id?: number | null;
    status: 'draft' | 'published' | 'archived';
    featured: boolean;
    views_count: number;
    bookmarks_count: number;
    downloads_count: number;
    published_at?: string | null;
    subject?: Subject;
    semester?: Semester;
    unit?: Unit;
    topic?: Topic;
    university?: University;
    tags?: Tag[];

    // type-specific relations
    note?: NoteDetail;
    video?: VideoDetail;
    literature?: LiteratureDetail;
    previous_paper?: PreviousPaperDetail;
    practical_resource?: PracticalDetail;
}

export interface NoteDetail {
    id: number;
    resource_id: number;
    cover_image?: string | null;
    cover_url?: string | null;
    file_path?: string | null;
    file_url?: string | null;
    file_size?: number | null;
    pages?: number | null;
    author?: string | null;
    toc?: TableOfContentsItem[] | null;
}

export interface TableOfContentsItem {
    title: string;
    page?: number;
}

export interface VideoDetail {
    id: number;
    resource_id: number;
    thumbnail?: string | null;
    thumbnail_url?: string | null;
    video_url?: string | null;
    playback_url?: string | null;
    embed_url?: string | null;
    video_type: 'url' | 'upload';
    provider?: string | null;
    duration_seconds?: number | null;
    duration_label?: string;
    views: number;
}

export interface LiteratureDetail {
    id: number;
    resource_id: number;
    category: string;
    author?: string | null;
    organization?: string | null;
    year?: number | null;
    file_url?: string | null;
    external_url?: string | null;
}

export interface PreviousPaperDetail {
    id: number;
    resource_id: number;
    year: number;
    exam_type?: string | null;
    file_url?: string | null;
    has_answer_key: boolean;
}

export interface PracticalDetail {
    id: number;
    resource_id: number;
    practical_type: string;
    resource_url?: string | null;
    steps?: string[] | null;
}

export interface Quiz {
    id: number;
    title: string;
    slug: string;
    description?: string | null;
    subject_id?: number | null;
    semester_id?: number | null;
    duration_minutes: number;
    total_questions: number;
    passing_score: number;
    difficulty: 'easy' | 'medium' | 'hard';
    status: 'draft' | 'published' | 'archived';
    featured: boolean;
    attempts_count: number;
    subject?: Subject;
}

export interface QuizOption {
    id: number;
    label: string;
    option_text: string;
    is_correct?: boolean;
}

export interface QuizQuestion {
    id: number;
    question: string;
    explanation?: string | null;
    difficulty?: 'easy' | 'medium' | 'hard';
    options: QuizOption[];
}

export interface QuizAttemptSummary {
    id: number;
    quiz_id: number;
    total_questions: number;
    correct_answers: number;
    wrong_answers: number;
    unanswered: number;
    score_percentage: number;
    passed: boolean;
    time_spent_seconds: number;
    completed_at?: string | null;
    status: string;
    quiz?: Quiz;
}

export interface Bookmark {
    id: number;
    bookmarkable_type: string;
    bookmarkable_id: number;
    created_at: string;
    bookmarkable: Resource | Quiz | null;
}

export interface UserProgress {
    id: number;
    progressable_type: string;
    progressable_id: number;
    status: 'in_progress' | 'completed';
    progress_percent: number;
    completed_at?: string | null;
    progressable: Resource | null;
}