import { Head } from '@inertiajs/react';
import { ArrowLeft, CheckCircle2, ListChecks, Trophy, XCircle } from 'lucide-react';
import { Badge, Button, Card } from '@/components/ui';
import { cn, formatDuration } from '@/lib/utils';
import type { Quiz, QuizAttemptSummary } from '@/types';

interface ReviewOption {
    id: number;
    label: string;
    option_text: string;
    is_correct: boolean;
    is_selected: boolean;
}

interface ReviewItem {
    id: number;
    question: string;
    explanation?: string | null;
    is_correct: boolean;
    user_option_id?: number | null;
    options: ReviewOption[];
}

interface ResultsProps {
    flash?: { success?: string; error?: string };
    quiz: Quiz;
    attempt: QuizAttemptSummary;
    review: ReviewItem[];
    [key: string]: unknown;
}

export default function Results({ quiz, attempt, review }: ResultsProps) {
    const total = attempt.total_questions;
    const correct = attempt.correct_answers;
    const wrong = attempt.wrong_answers;
    const unanswered = attempt.unanswered;
    const score = attempt.score_percentage;
    const passed = attempt.passed;
    const deg = Math.round((score / 100) * 360);
    const accentColor = passed ? '#16a34a' : '#dc2626';

    return (
        <div className="mx-auto max-w-3xl space-y-6">
            <Head title={`Results — ${quiz.title}`} />
            <Button variant="secondary" href="/my-quiz-results">
                <ArrowLeft className="h-4 w-4" />
                Back to results
            </Button>

            <Card className="flex flex-col items-center gap-4 p-8 text-center">
                <div
                    className="relative flex h-40 w-40 items-center justify-center rounded-full"
                    style={{ background: `conic-gradient(${accentColor} ${deg}deg, #e2e8f0 0deg)` }}
                >
                    <div className="flex h-28 w-28 flex-col items-center justify-center rounded-full bg-white">
                        <span className="text-3xl font-bold text-ink">{score}%</span>
                        <span className="text-xs text-muted">
                            {correct}/{total}
                        </span>
                    </div>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-2">
                    <Badge color={passed ? 'green' : 'red'}>
                        <Trophy className="mr-1 h-3 w-3" />
                        {passed ? 'Passed' : 'Failed'}
                    </Badge>
                    <span className="text-sm text-muted">Passing: {quiz.passing_score}%</span>
                </div>
            </Card>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <Card className="flex flex-col items-center gap-1 p-4">
                    <CheckCircle2 className="h-6 w-6 text-green-600" />
                    <span className="text-xl font-bold text-ink">{correct}</span>
                    <span className="text-xs text-muted">Correct</span>
                </Card>
                <Card className="flex flex-col items-center gap-1 p-4">
                    <XCircle className="h-6 w-6 text-red-500" />
                    <span className="text-xl font-bold text-ink">{wrong}</span>
                    <span className="text-xs text-muted">Wrong</span>
                </Card>
                <Card className="flex flex-col items-center gap-1 p-4">
                    <ListChecks className="h-6 w-6 text-slate-400" />
                    <span className="text-xl font-bold text-ink">{unanswered}</span>
                    <span className="text-xs text-muted">Unanswered</span>
                </Card>
                <Card className="flex flex-col items-center gap-1 p-4">
                    <span className="text-xl font-bold text-ink">{formatDuration(attempt.time_spent_seconds)}</span>
                    <span className="text-xs text-muted">Time spent</span>
                </Card>
            </div>

            <h2 className="text-lg font-semibold text-ink">Question review</h2>

            <div className="space-y-4">
                {review.map((item, index) => (
                    <Card
                        key={item.id}
                        className={cn(
                            'p-5',
                            item.user_option_id != null
                                ? item.is_correct
                                    ? 'border-l-4 border-green-500'
                                    : 'border-l-4 border-red-500'
                                : 'border-l-4 border-slate-300'
                        )}
                    >
                        <div className="flex flex-wrap items-center gap-2">
                            <Badge color={item.user_option_id == null ? 'neutral' : item.is_correct ? 'green' : 'red'}>
                                {item.user_option_id == null
                                    ? 'Unanswered'
                                    : item.is_correct
                                      ? 'Correct'
                                      : 'Wrong'}
                            </Badge>
                            <span className="text-sm font-medium text-muted">Question {index + 1}</span>
                        </div>
                        <p className="mt-2 font-medium text-ink">{item.question}</p>

                        <div className="mt-3 space-y-2">
                            {item.options.map((option) => {
                                const isCorrect = option.is_correct;
                                const isSelected = option.is_selected;
                                return (
                                    <div
                                        key={option.id}
                                        className={cn(
                                            'flex items-center gap-2 rounded-lg border px-3 py-2 text-sm',
                                            isCorrect
                                                ? 'border-green-300 bg-green-50'
                                                : isSelected
                                                  ? 'border-red-300 bg-red-50'
                                                  : 'border-slate-200 bg-white'
                                        )}
                                    >
                                        {isCorrect ? (
                                            <CheckCircle2 className="h-4 w-4 shrink-0 text-green-600" />
                                        ) : isSelected ? (
                                            <XCircle className="h-4 w-4 shrink-0 text-red-500" />
                                        ) : (
                                            <span className="h-4 w-4 shrink-0 rounded-full border border-slate-300" />
                                        )}
                                        <span className={cn('font-semibold text-slate-600', isCorrect && 'text-green-700', isSelected && !isCorrect && 'text-red-700')}>
                                            {option.label}.
                                        </span>
                                        <span className={cn('text-ink', isCorrect && 'text-green-800', isSelected && !isCorrect && 'text-red-800')}>
                                            {option.option_text}
                                        </span>
                                        {isSelected && !isCorrect && (
                                            <span className="ml-auto text-xs text-red-500">Your answer</span>
                                        )}
                                        {isCorrect && (
                                            <span className="ml-auto text-xs text-green-600">Correct answer</span>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        {item.explanation && (
                            <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
                                <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-amber-600">Explanation</p>
                                <p className="whitespace-pre-wrap text-sm text-amber-800">{item.explanation}</p>
                            </div>
                        )}
                    </Card>
                ))}
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2 pb-8">
                <Button href={`/quizzes/${quiz.slug}/attempt`}>
                    Retake quiz
                </Button>
                <Button variant="secondary" href="/my-quiz-results">
                    View all results
                </Button>
            </div>
        </div>
    );
}