import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { ArrowLeft, MessageSquarePlus } from 'lucide-react';
import { Alert, Button, Card, Input, Label, Select, Textarea } from '@/components/ui';

interface SubjectOption {
    id: number;
    name: string;
}

interface CreateProps {
    subjects: SubjectOption[];
}

interface Flash {
    flash?: { success?: string; error?: string; warning?: string };
    [key: string]: unknown;
}

export default function DiscussionsCreate(props: CreateProps) {
    const { flash } = usePage<Flash>().props;
    const { subjects } = props;

    const form = useForm({
        title: '',
        content: '',
        subject_id: '',
        tags: [] as string[],
    });

    function submit() {
        form.post('/discussions', { preserveScroll: true });
    }

    return (
        <div className="mx-auto max-w-3xl space-y-6">
            <Head title="New Discussion" />

            {flash?.success && (
                <Alert type="success" dismissible>
                    {flash.success}
                </Alert>
            )}
            {flash?.error && (
                <Alert type="error" dismissible>
                    {flash.error}
                </Alert>
            )}
            {flash?.warning && (
                <Alert type="warning" dismissible>
                    {flash.warning}
                </Alert>
            )}

            <div>
                <Link href="/discussions" className="inline-flex items-center gap-1.5 text-sm font-medium text-primary-700 transition hover:text-primary-900">
                    <ArrowLeft className="h-4 w-4" />
                    Back to discussions
                </Link>
                <h1 className="mt-2 text-2xl font-bold text-ink">Start a new discussion</h1>
                <p className="mt-1 text-sm text-muted">Share a question, resource or study tip with your community.</p>
            </div>

            <Card className="p-6">
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        submit();
                    }}
                    className="space-y-4"
                >
                    <Input
                        label="Title"
                        id="discussion-title"
                        value={form.data.title}
                        onChange={(e) => form.setData('title', e.target.value)}
                        placeholder="A clear, specific title"
                        error={form.errors.title}
                    />

                    <Select
                        label="Subject (optional)"
                        id="discussion-subject"
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

                    <div>
                        <Label htmlFor="discussion-content">Content</Label>
                        <Textarea
                            id="discussion-content"
                            rows={8}
                            value={form.data.content}
                            onChange={(e) => form.setData('content', e.target.value)}
                            placeholder="Write the full details of your discussion..."
                            error={form.errors.content}
                        />
                    </div>

                    <Input
                        label="Tags (optional, comma separated)"
                        id="discussion-tags"
                        value={form.data.tags.join(', ')}
                        onChange={(e) =>
                            form.setData(
                                'tags',
                                e.target.value
                                    .split(',')
                                    .map((t) => t.trim())
                                    .filter(Boolean)
                            )
                        }
                        placeholder="pharmacology, exams, study tips"
                        error={form.errors.tags}
                    />

                    <div className="flex items-center gap-2">
                        <Button type="submit" loading={form.processing}>
                            <MessageSquarePlus className="h-4 w-4" />
                            Post discussion
                        </Button>
                        <Button type="button" variant="secondary" href="/discussions">
                            Cancel
                        </Button>
                    </div>
                </form>
            </Card>
        </div>
    );
}