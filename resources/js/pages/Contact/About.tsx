import { Head, usePage } from '@inertiajs/react';
import { BookOpen, Users, Target, Lightbulb } from 'lucide-react';
import { Card } from '@/components/ui';

interface AboutPageProps {
    about?: string | null;
}

const missions = [
    {
        icon: BookOpen,
        title: 'Free learning materials',
        description: 'Notes, videos and previous papers gathered for pharmacy students, all in one place.',
    },
    {
        icon: Users,
        title: 'Built by the community',
        description: 'Content curated from students and educators who know what it takes to succeed.',
    },
    {
        icon: Target,
        title: 'Exam focused',
        description: 'Everything mapped to your semester and program so you can prepare with confidence.',
    },
    {
        icon: Lightbulb,
        title: 'Learn anytime',
        description: 'Study at your own pace across devices — mobile, tablet or desktop.',
    },
];

export default function About({ about }: AboutPageProps) {
    const { app } = usePage<{ app: { name: string; tagline: string } }>().props;
    const prose = about ?? [
        `${app.name} is a learning platform built specifically for pharmacy students.`,
        'We bring together study notes, instructional videos, literature, MCQs and previous examination papers so students can find everything they need in one place.',
        'Our goal is simple: to make quality study material accessible, organised and easy to explore, whether you are revising a single subject or preparing for your final exams.',
    ].join('\n\n');

    return (
        <>
            <Head title="About" />
            <div className="bg-gradient-to-r from-primary-800 to-primary-600">
                <div className="mx-auto max-w-7xl px-4 py-14 text-center sm:px-6 sm:py-16 lg:px-8">
                    <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">About {app.name}</h1>
                    <p className="mx-auto mt-3 max-w-2xl text-primary-100 sm:text-lg">{app.tagline}</p>
                </div>
            </div>

            <div className="mx-auto max-w-7xl space-y-12 px-4 py-12 sm:px-6 lg:px-8">
                <section className="mx-auto max-w-3xl">
                    {prose.split('\n\n').map((paragraph, i) => (
                        <p key={i} className="mb-4 text-base leading-relaxed text-slate-600">
                            {paragraph}
                        </p>
                    ))}
                </section>

                <section>
                    <h2 className="mb-6 text-center text-xl font-bold text-ink">What we stand for</h2>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        {missions.map((mission) => {
                            const Icon = mission.icon;
                            return (
                                <Card key={mission.title} className="h-full p-5">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-50 text-primary-600">
                                        <Icon className="h-5 w-5" aria-hidden="true" />
                                    </div>
                                    <h3 className="mt-3 font-semibold text-ink">{mission.title}</h3>
                                    <p className="mt-1 text-sm text-muted">{mission.description}</p>
                                </Card>
                            );
                        })}
                    </div>
                </section>
            </div>
        </>
    );
}