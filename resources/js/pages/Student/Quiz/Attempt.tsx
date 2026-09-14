import { Head, useForm } from '@inertiajs/react';
import { AlertCircle, ChevronLeft, ChevronRight, Clock, Send } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Badge, Button, Card, ConfirmDialog } from '@/components/ui';
import { cn } from '@/lib/utils';
import type { Quiz, QuizOption } from '@/types';

interface AttemptQuestion {
    id: number;
    question: string;
    difficulty?: 'easy' | 'medium' | 'hard';
    points?: number;
    options: QuizOption[];
}

interface AttemptProps {
    flash?: { success?: string; error?: string };
    quiz: Quiz;
    questions: AttemptQuestion[];
    attempt: { id: number };
    durationMinutes?: number | null;
    [key: string]: unknown;
}

function formatTime(seconds: number): string {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    const mm = `${m}`.padStart(2, '0');
    const ss = `${s}`.padStart(2, '0');
    return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
}

export default function Attempt({ quiz, questions, attempt, durationMinutes }: AttemptProps) {
    const totalSeconds = durationMinutes ? durationMinutes * 60 : null;
    const [current, setCurrent] = useState(0);
    const [answers, setAnswers] = useState<Record<number, number>>({});
    const [remaining, setRemaining] = useState<number | null>(totalSeconds);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const submittedRef = useRef(false);

    const form = useForm<{ attempt_id: number; answers: Record<number, number>; time_spent_seconds: number }>({
        attempt_id: attempt.id,
        answers: {},
        time_spent_seconds: 0,
    });

    const elapsed = totalSeconds !== null && remaining !== null ? totalSeconds - remaining : 0;

    const submitNow = useCallback(() => {
        if (submittedRef.current) return;
        submittedRef.current = true;
        const freshState = answersRef.current;
        form.setData('answers', freshState);
        form.setData('time_spent_seconds', elapsedRef.current);
        form.post(`/quizzes/${quiz.id}/submit`, {
            preserveScroll: false,
            onError: () => {
                submittedRef.current = false;
            },
        });
    }, [form, quiz.id]);

    const answersRef = useRef(answers);
    answersRef.current = answers;
    const elapsedRef = useRef(elapsed);
    elapsedRef.current = elapsed;
    const submitRef = useRef(submitNow);
    submitRef.current = submitNow;

    useEffect(() => {
        if (remaining === null) return;
        if (remaining <= 0) {
            submitRef.current();
            return;
        }
        const id = window.setTimeout(() => setRemaining((r) => (r === null ? null : r - 1)), 1000);
        return () => window.clearTimeout(id);
    }, [remaining]);

    const total = questions.length;
    const answeredCount = questions.filter((q) => answers[q.id] != null).length;
    const allAnswered = total > 0 && answeredCount === total;

    const selectOption = (questionId: number, optionId: number) => {
        setAnswers((prev) => ({ ...prev, [questionId]: optionId }));
    };

    const question = questions[current];
    const isLowTime = remaining !== null && remaining <= 60;

    return (
        <div className="mx-auto max-w-3xl space-y-5">
            <Head title={quiz.title} />

            <div className="card flex items-center justify-between gap-4 p-4">
                <div className="min-w-0">
                    <h1 className="truncate text-lg font-bold text-ink">{quiz.title}</h1>
                    <p className="text-xs text-muted">
                        {quiz.subject?.name ?? 'Quiz'} · {total} questions
                    </p>
                </div>
                {remaining !== null && (
                    <div
                        className={cn(
                            'flex shrink-0 items-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold',
                            isLowTime ? 'border-red-200 bg-red-50 text-red-600' : 'border-slate-200 bg-slate-50 text-ink'
                        )}
                    >
                        <Clock className="h-4 w-4" />
                        {formatTime(remaining)}
                    </div>
                )}
            </div>

            <div className="card sticky top-16 z-20 flex items-center justify-between gap-4 p-4">
                <p className="text-sm font-medium text-ink">
                    Question {current + 1} of {total}
                </p>
                <div className="flex items-center gap-1.5">
                    <Badge color={allAnswered ? 'green' : 'amber'}>
                        {answeredCount}/{total} answered
                    </Badge>
                </div>
            </div>

            {total === 0 ? (
                <Card className="p-8 text-center">
                    <p className="text-sm text-muted">This quiz has no questions.</p>
                </Card>
            ) : (
                <>
                    <div className="flex flex-wrap gap-1.5">
                        {questions.map((q, index) => {
                            const isAnswered = answers[q.id] != null;
                            return (
                                <button
                                    key={q.id}
                                    type="button"
                                    onClick={() => setCurrent(index)}
                                    aria-label={`Go to question ${index + 1}`}
                                    className={cn(
                                        'flex h-8 w-8 items-center justify-center rounded-md border text-xs font-medium transition',
                                        index === current
                                            ? 'border-primary-700 bg-primary-700 text-white'
                                            : isAnswered
                                              ? 'border-primary-300 bg-primary-50 text-primary-700'
                                              : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50'
                                    )}
                                >
                                    {index + 1}
                                </button>
                            );
                        })}
                    </div>

                    <Card key={question.id} className="p-6">
                        <div className="flex flex-wrap items-center gap-2">
                            <Badge color="blue">Question {current + 1}</Badge>
                            {question.difficulty && (
                                <Badge
                                    color={
                                        question.difficulty === 'easy'
                                            ? 'green'
                                            : question.difficulty === 'hard'
                                              ? 'red'
                                              : 'amber'
                                    }
                                >
                                    {question.difficulty}
                                </Badge>
                            )}
                            {typeof question.points === 'number' && (
                                <Badge color="neutral">{question.points} pt</Badge>
                            )}
                        </div>
                        <p className="mt-3 text-lg font-semibold leading-snug text-ink">{question.question}</p>

                        <div className="mt-5 space-y-2.5">
                            {question.options.map((option) => {
                                const selected = answers[question.id] === option.id;
                                return (
                                    <label
                                        key={option.id}
                                        className={cn(
                                            'flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition',
                                            selected
                                                ? 'border-primary-600 bg-primary-50'
                                                : 'border-slate-200 hover:bg-slate-50'
                                        )}
                                    >
                                        <input
                                            type="radio"
                                            name={`question-${question.id}`}
                                            className="mt-0.5 h-4 w-4 border-slate-300 text-primary-600 focus:ring-primary-300"
                                            checked={selected}
                                            onChange={() => selectOption(question.id, option.id)}
                                        />
                                        <span className="text-sm text-ink">
                                            <span className="font-semibold text-slate-600">{option.label}.</span>{' '}
                                            {option.option_text}
                                        </span>
                                    </label>
                                );
                            })}
                        </div>
                    </Card>

                    <div className="card flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex gap-2">
                            <Button
                                variant="secondary"
                                onClick={() => setCurrent((c) => Math.max(0, c - 1))}
                                disabled={current === 0}
                            >
                                <ChevronLeft className="h-4 w-4" />
                                Previous
                            </Button>
                            <Button
                                variant="secondary"
                                onClick={() => setCurrent((c) => Math.min(total - 1, c + 1))}
                                disabled={current === total - 1}
                            >
                                Next
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                        <Button
                            variant="success"
                            loading={form.processing}
                            onClick={() => {
                                if (allAnswered) {
                                    submitNow();
                                } else {
                                    setConfirmOpen(true);
                                }
                            }}
                        >
                            <Send className="h-4 w-4" />
                            Submit quiz
                        </Button>
                    </div>
                </>
            )}

            <p className="flex items-center gap-1.5 text-xs text-slate-400">
                <AlertCircle className="h-3.5 w-3.5" />
                Explanations are revealed after you submit.
            </p>

            <ConfirmDialog
                open={confirmOpen}
                onClose={() => setConfirmOpen(false)}
                onConfirm={() => {
                    setConfirmOpen(false);
                    submitNow();
                }}
                title="Submit incomplete quiz?"
                description={`You have ${total - answeredCount} unanswered question${total - answeredCount === 1 ? '' : 's'}. Unanswered questions will be marked wrong.`}
                confirmText="Submit anyway"
                danger={false}
                loading={form.processing}
            />
        </div>
    );
}