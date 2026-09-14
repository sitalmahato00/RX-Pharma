import { useForm } from '@inertiajs/react';
import { Plus, Trash2 } from 'lucide-react';
import { Button, Card, Input, Select, Textarea } from '@/components/ui';
import { cn } from '@/lib/utils';
import type { Quiz, QuizOption } from '@/types';

type Difficulty = Quiz['difficulty'];
type Status = 'draft' | 'published';

interface OptionDraft {
    label: string;
    option_text: string;
    is_correct: boolean;
}

interface QuestionDraft {
    question: string;
    explanation: string;
    difficulty: Difficulty;
    points: number;
    options: OptionDraft[];
}

interface QuizFormData {
    title: string;
    description: string;
    subject_id: string;
    semester_id: string;
    unit_id: string;
    topic_id: string;
    duration_minutes: string;
    passing_score: string;
    difficulty: Difficulty;
    status: Status;
    featured: boolean;
    questions: QuestionDraft[];
}

interface OptionItem {
    id: number;
    name: string;
}

interface SemesterItem {
    id: number;
    name: string;
    number: number;
}

interface UnitItem {
    id: number;
    name: string;
    subject_id: number;
}

interface TopicItem {
    id: number;
    name: string;
    unit_id: number;
}

interface EditableQuiz extends Quiz {
    unit_id?: number | null;
    topic_id?: number | null;
    questions?: (QuizQuestionDraft & { options: QuizOption[] })[];
}

interface QuizQuestionDraft {
    question: string;
    explanation?: string | null;
    difficulty?: Difficulty;
    points?: number;
}

interface QuizFormProps {
    mode: 'create' | 'edit';
    quiz?: EditableQuiz;
    subjects: OptionItem[];
    semesters: SemesterItem[];
    units: UnitItem[];
    topics: TopicItem[];
}

const newOption = (index: number): OptionDraft => ({
    label: String.fromCharCode(65 + index),
    option_text: '',
    is_correct: index === 0,
});

const newQuestion = (): QuestionDraft => ({
    question: '',
    explanation: '',
    difficulty: 'medium',
    points: 1,
    options: [newOption(0), newOption(1)],
});

function buildInitial(quiz?: EditableQuiz): QuizFormData {
    return {
        title: quiz?.title ?? '',
        description: quiz?.description ?? '',
        subject_id: quiz?.subject_id ? String(quiz.subject_id) : '',
        semester_id: quiz?.semester_id ? String(quiz.semester_id) : '',
        unit_id: quiz?.unit_id ? String(quiz.unit_id) : '',
        topic_id: quiz?.topic_id ? String(quiz.topic_id) : '',
        duration_minutes: quiz?.duration_minutes ? String(quiz.duration_minutes) : '',
        passing_score: quiz?.passing_score ? String(quiz.passing_score) : '',
        difficulty: quiz?.difficulty ?? 'medium',
        status: quiz?.status === 'published' ? 'published' : 'draft',
        featured: quiz?.featured ?? false,
        questions: (quiz?.questions ?? []).map((q) => ({
            question: q.question,
            explanation: q.explanation ?? '',
            difficulty: q.difficulty ?? 'medium',
            points: q.points ?? 1,
            options:
                q.options.length > 0
                    ? q.options.map((o) => ({ label: o.label, option_text: o.option_text, is_correct: !!o.is_correct }))
                    : [newOption(0), newOption(1)],
        })),
    };
}

function alphabetLabel(index: number): string {
    return String.fromCharCode(65 + index);
}

export default function QuizForm({ mode, quiz, subjects, semesters, units, topics }: QuizFormProps) {
    const form = useForm<QuizFormData>(buildInitial(quiz));

    const setQuestions = (updater: (questions: QuestionDraft[]) => QuestionDraft[]) => {
        form.setData('questions', updater(form.data.questions));
    };

    const updateQuestion = (qi: number, patch: Partial<QuestionDraft>) => {
        setQuestions((qs) => qs.map((q, i) => (i === qi ? { ...q, ...patch } : q)));
    };

    const updateOption = (qi: number, oi: number, patch: Partial<OptionDraft>) => {
        setQuestions((qs) =>
            qs.map((q, i) =>
                i === qi ? { ...q, options: q.options.map((o, j) => (j === oi ? { ...o, ...patch } : o)) } : q
            )
        );
    };

    const setCorrectOption = (qi: number, oi: number) => {
        setQuestions((qs) =>
            qs.map((q, i) => (i === qi ? { ...q, options: q.options.map((o, j) => ({ ...o, is_correct: j === oi })) } : q))
        );
    };

    const addQuestion = () => setQuestions((qs) => [...qs, newQuestion()]);

    const removeQuestion = (qi: number) => setQuestions((qs) => qs.filter((_, i) => i !== qi));

    const addOption = (qi: number) => {
        setQuestions((qs) =>
            qs.map((q, i) => (i === qi ? { ...q, options: [...q.options, newOption(q.options.length)] } : q))
        );
    };

    const removeOption = (qi: number, oi: number) => {
        setQuestions((qs) => qs.map((q, i) => (i === qi ? { ...q, options: q.options.filter((_, j) => j !== oi) } : q)));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        form.transform((data) => ({
            ...data,
            subject_id: data.subject_id ? Number(data.subject_id) : null,
            semester_id: data.semester_id ? Number(data.semester_id) : null,
            unit_id: data.unit_id ? Number(data.unit_id) : null,
            topic_id: data.topic_id ? Number(data.topic_id) : null,
            duration_minutes: data.duration_minutes ? Number(data.duration_minutes) : null,
            passing_score: data.passing_score ? Number(data.passing_score) : null,
            questions: data.questions.map((q) => ({
                question: q.question,
                explanation: q.explanation || null,
                difficulty: q.difficulty,
                points: q.points || 1,
                options: q.options.map((o, i) => ({
                    label: o.label || alphabetLabel(i),
                    option_text: o.option_text,
                    is_correct: o.is_correct,
                })),
            })),
        }));

        if (mode === 'create') {
            form.post('/admin/quizzes', { preserveScroll: false });
        } else if (quiz) {
            form.put(`/admin/quizzes/${quiz.id}`, { preserveScroll: false });
        }
    };

    const filteredUnits = units;
    const filteredTopics = form.data.unit_id ? topics.filter((t) => t.unit_id === Number(form.data.unit_id)) : topics;

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <Card className="space-y-4 p-6">
                <h2 className="text-lg font-semibold text-ink">Details</h2>
                <div className="grid gap-4 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                        <Input
                            label="Title"
                            id="title"
                            value={form.data.title}
                            onChange={(e) => form.setData('title', e.target.value)}
                            error={form.errors.title}
                            placeholder="e.g. Basic Pharmacology — Set 1"
                            required
                        />
                    </div>
                    <div className="sm:col-span-2">
                        <Textarea
                            label="Description"
                            id="description"
                            value={form.data.description}
                            onChange={(e) => form.setData('description', e.target.value)}
                            error={form.errors.description}
                            rows={3}
                        />
                    </div>
                    <div>
                        <Select
                            label="Subject"
                            id="subject_id"
                            value={form.data.subject_id}
                            onChange={(e) => form.setData('subject_id', e.target.value)}
                            error={form.errors.subject_id}
                        >
                            <option value="">No subject</option>
                            {subjects.map((s) => (
                                <option key={s.id} value={s.id}>
                                    {s.name}
                                </option>
                            ))}
                        </Select>
                    </div>
                    <div>
                        <Select
                            label="Semester"
                            id="semester_id"
                            value={form.data.semester_id}
                            onChange={(e) => form.setData('semester_id', e.target.value)}
                            error={form.errors.semester_id}
                        >
                            <option value="">No semester</option>
                            {semesters.map((s) => (
                                <option key={s.id} value={s.id}>
                                    {s.number}. {s.name}
                                </option>
                            ))}
                        </Select>
                    </div>
                    <div>
                        <Select
                            label="Unit"
                            id="unit_id"
                            value={form.data.unit_id}
                            onChange={(e) => form.setData('unit_id', e.target.value)}
                            error={form.errors.unit_id}
                        >
                            <option value="">No unit</option>
                            {filteredUnits.map((u) => (
                                <option key={u.id} value={u.id}>
                                    {u.name}
                                </option>
                            ))}
                        </Select>
                    </div>
                    <div>
                        <Select
                            label="Topic"
                            id="topic_id"
                            value={form.data.topic_id}
                            onChange={(e) => form.setData('topic_id', e.target.value)}
                            error={form.errors.topic_id}
                        >
                            <option value="">No topic</option>
                            {filteredTopics.map((t) => (
                                <option key={t.id} value={t.id}>
                                    {t.name}
                                </option>
                            ))}
                        </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="Duration (minutes)"
                            id="duration_minutes"
                            type="number"
                            min={1}
                            max={600}
                            value={form.data.duration_minutes}
                            onChange={(e) => form.setData('duration_minutes', e.target.value)}
                            error={form.errors.duration_minutes}
                        />
                        <Input
                            label="Passing score (%)"
                            id="passing_score"
                            type="number"
                            min={0}
                            max={100}
                            value={form.data.passing_score}
                            onChange={(e) => form.setData('passing_score', e.target.value)}
                            error={form.errors.passing_score}
                        />
                    </div>
                    <div>
                        <Select
                            label="Difficulty"
                            id="difficulty"
                            value={form.data.difficulty}
                            onChange={(e) => form.setData('difficulty', e.target.value as Difficulty)}
                            error={form.errors.difficulty}
                        >
                            <option value="easy">Easy</option>
                            <option value="medium">Medium</option>
                            <option value="hard">Hard</option>
                        </Select>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-6 pt-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                        <input
                            type="checkbox"
                            className="h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-300"
                            checked={form.data.featured}
                            onChange={(e) => form.setData('featured', e.target.checked)}
                        />
                        Featured
                    </label>
                    <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                        <input
                            type="checkbox"
                            className="h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-300"
                            checked={form.data.status === 'published'}
                            onChange={(e) => form.setData('status', e.target.checked ? 'published' : 'draft')}
                        />
                        Published
                    </label>
                    {form.errors.status && <p className="text-xs text-red-500">{form.errors.status}</p>}
                </div>
            </Card>

            <Card className="space-y-4 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-semibold text-ink">Questions</h2>
                        <p className="text-sm text-muted">
                            {form.data.questions.length} question{form.data.questions.length === 1 ? '' : 's'} — saving replaces
                            all existing questions.
                        </p>
                    </div>
                    <Button type="button" variant="secondary" size="sm" onClick={addQuestion}>
                        <Plus className="h-4 w-4" />
                        Add question
                    </Button>
                </div>

                {form.data.questions.length === 0 && (
                    <p className="rounded-lg border border-dashed border-slate-300 p-6 text-center text-sm text-muted">
                        No questions yet. Add at least one question with two or more options.
                    </p>
                )}

                <div className="space-y-4">
                    {form.data.questions.map((q, qi) => (
                        <div key={qi} className="rounded-xl border border-slate-200 p-4">
                            <div className="flex items-center justify-between">
                                <p className="text-sm font-semibold text-ink">Question {qi + 1}</p>
                                <Button type="button" variant="ghost" size="icon" onClick={() => removeQuestion(qi)}>
                                    <Trash2 className="h-4 w-4 text-red-500" />
                                </Button>
                            </div>
                            <div className="mt-3 space-y-3">
                                <Textarea
                                    label="Question"
                                    rows={2}
                                    value={q.question}
                                    onChange={(e) => updateQuestion(qi, { question: e.target.value })}
                                    placeholder="Enter the question text..."
                                />
                                <div className="grid gap-3 sm:grid-cols-3">
                                    <Select
                                        label="Difficulty"
                                        value={q.difficulty}
                                        onChange={(e) => updateQuestion(qi, { difficulty: e.target.value as Difficulty })}
                                    >
                                        <option value="easy">Easy</option>
                                        <option value="medium">Medium</option>
                                        <option value="hard">Hard</option>
                                    </Select>
                                    <Input
                                        label="Points"
                                        type="number"
                                        min={0}
                                        value={q.points}
                                        onChange={(e) => updateQuestion(qi, { points: Number(e.target.value) })}
                                    />
                                </div>
                                <Textarea
                                    label="Explanation (optional)"
                                    rows={2}
                                    value={q.explanation}
                                    onChange={(e) => updateQuestion(qi, { explanation: e.target.value })}
                                    placeholder="Shown to students after submission..."
                                />

                                <div>
                                    <p className="mb-1.5 text-sm font-medium text-slate-700">Options</p>
                                    <div className="space-y-2">
                                        {q.options.map((o, oi) => (
                                            <div key={oi} className="flex items-center gap-2">
                                                <label className="flex shrink-0 cursor-pointer items-center gap-2 text-sm font-medium text-slate-600">
                                                    <input
                                                        type="radio"
                                                        name={`correct-option-${qi}`}
                                                        checked={o.is_correct}
                                                        onChange={() => setCorrectOption(qi, oi)}
                                                        className="h-4 w-4 border-slate-300 text-primary-600 focus:ring-primary-300"
                                                        title="Mark as correct answer"
                                                    />
                                                    {o.label || alphabetLabel(oi)}.
                                                </label>
                                                <Input
                                                    value={o.option_text}
                                                    onChange={(e) => updateOption(qi, oi, { option_text: e.target.value })}
                                                    placeholder="Option text..."
                                                    className={cn(o.is_correct && 'border-green-300 bg-green-50/40')}
                                                />
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    disabled={q.options.length <= 2}
                                                    onClick={() => removeOption(qi, oi)}
                                                >
                                                    <Trash2 className="h-3.5 w-3.5 text-slate-400" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => addOption(qi)}
                                        className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-primary-700 transition hover:text-primary-800"
                                    >
                                        <Plus className="h-4 w-4" />
                                        Add option
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </Card>

            <div className="flex justify-end gap-2">
                <Button type="button" variant="secondary" href="/admin/quizzes">
                    Cancel
                </Button>
                <Button type="submit" loading={form.processing}>
                    {mode === 'create' ? 'Create quiz' : 'Save changes'}
                </Button>
            </div>
        </form>
    );
}