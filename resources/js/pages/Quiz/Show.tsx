import { Head, Link, usePage } from '@inertiajs/react';
import { Clock, HelpCircle, ListChecks, Play, Target, Users } from 'lucide-react';
import { Badge, Breadcrumb } from '@/components/ui';
import { formatNumber } from '@/lib/utils';
import type { Semester, Topic, Unit } from '@/types';
import type { Quiz as QuizBase } from '@/types';

interface Quiz extends QuizBase {
    semester?: Semester;
    unit?: Unit;
    topic?: Topic;
}

type ShowPageProps = {
    quiz: Quiz;
}

export default function Show() {
    const { quiz } = usePage<ShowPageProps>().props;
    const { auth } = usePage().props as unknown as { auth: { user: { id: number } | null } };
    const user = auth.user;

    const startHref = user ? `/quizzes/${quiz.slug}/attempt` : '/login';

    const rules = [
        `Answer all ${quiz.total_questions} questions.`,
        `You have ${quiz.duration_minutes} minutes to complete the quiz.`,
        `A score of ${quiz.passing_score}% or higher is required to pass.`,
        'Once submitted, your result will be shown immediately.',
    ];

    return (
        <>
            <Head title={quiz.title} />
            <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
                <Breadcrumb
                    items={[
                        { label: 'Home', href: '/' },
                        { label: 'Quizzes', href: '/quizzes' },
                        { label: quiz.title },
                    ]}
                />

                <section className="card mt-6 p-6 sm:p-8">
                    <div className="flex flex-wrap items-center gap-2">
                        {quiz.subject && (
                            <Link href={`/subjects/${quiz.subject.slug}`}>
                                <Badge color="blue">{quiz.subject.name}</Badge>
                            </Link>
                        )}
                        {quiz.semester && <Badge color="neutral">{quiz.semester.name}</Badge>}
                        <Badge color={quiz.difficulty === 'easy' ? 'green' : quiz.difficulty === 'hard' ? 'red' : 'amber'}>
                            {quiz.difficulty}
                        </Badge>
                    </div>
                    <h1 className="mt-3 text-2xl font-bold text-ink sm:text-3xl">{quiz.title}</h1>
                    {quiz.description && (
                        <p className="mt-4 text-sm leading-relaxed text-muted">{quiz.description}</p>
                    )}
                </section>

                <section className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
                    <div className="card p-4 text-center">
                        <HelpCircle className="mx-auto h-5 w-5 text-primary-700" />
                        <p className="mt-2 text-lg font-semibold text-ink">{quiz.total_questions}</p>
                        <p className="text-xs text-muted">Questions</p>
                    </div>
                    <div className="card p-4 text-center">
                        <Clock className="mx-auto h-5 w-5 text-primary-700" />
                        <p className="mt-2 text-lg font-semibold text-ink">{quiz.duration_minutes}m</p>
                        <p className="text-xs text-muted">Duration</p>
                    </div>
                    <div className="card p-4 text-center">
                        <Target className="mx-auto h-5 w-5 text-primary-700" />
                        <p className="mt-2 text-lg font-semibold text-ink">{quiz.passing_score}%</p>
                        <p className="text-xs text-muted">Pass score</p>
                    </div>
                    <div className="card p-4 text-center">
                        <Users className="mx-auto h-5 w-5 text-primary-700" />
                        <p className="mt-2 text-lg font-semibold text-ink">{formatNumber(quiz.attempts_count ?? 0)}</p>
                        <p className="text-xs text-muted">Attempts</p>
                    </div>
                </section>

                <section className="card mt-8 p-6">
                    <h2 className="flex items-center gap-2 text-lg font-bold text-ink">
                        <ListChecks className="h-5 w-5 text-primary-700" />
                        Rules
                    </h2>
                    <ol className="mt-4 space-y-2">
                        {rules.map((rule, index) => (
                            <li key={index} className="flex gap-3 text-sm text-ink">
                                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary-100 text-xs font-semibold text-primary-700">
                                    {index + 1}
                                </span>
                                {rule}
                            </li>
                        ))}
                    </ol>
                </section>

                <div className="mt-8">
                    <Link
                        href={startHref}
                        className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary-700 px-6 py-3 text-base font-medium text-white transition hover:bg-primary-800 sm:w-auto"
                    >
                        <Play className="h-5 w-5" />
                        Start Quiz
                    </Link>
                    {!user && (
                        <p className="mt-3 text-xs text-muted">You need to log in to attempt quizzes.</p>
                    )}
                </div>
            </div>
        </>
    );
}
