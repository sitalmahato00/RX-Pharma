import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { ArrowLeft, Eye, Flag, Heart, MessageSquarePlus, Pin, Reply, ThumbsUp } from 'lucide-react';
import { useState } from 'react';
import { Alert, Avatar, Badge, Button, Card, EmptyState, Modal, Select, Textarea } from '@/components/ui';
import { timeAgo } from '@/lib/utils';

const DISCUSSION_CLASS = 'App\\Models\\Discussion';
const REPLY_CLASS = 'App\\Models\\DiscussionReply';

interface DiscussionAuthor {
    id: number;
    name: string;
    avatar?: string | null;
}

interface ReplyItem {
    id: number;
    content: string;
    likes_count: number;
    created_at: string;
    user?: DiscussionAuthor | null;
}

interface FullDiscussion {
    id: number;
    slug: string;
    title: string;
    content: string;
    tags: string[];
    is_pinned: boolean;
    views_count: number;
    likes_count: number;
    replies_count: number;
    subject?: { id: number; name: string } | null;
    user?: DiscussionAuthor | null;
    replies?: ReplyItem[];
    created_at: string;
}

interface ShowProps {
    discussion: FullDiscussion;
    isLiked: boolean;
}

interface Flash {
    flash?: { success?: string; error?: string; warning?: string };
    [key: string]: unknown;
}

const reportReasons = ['Spam', 'Harassment', 'Inappropriate content', 'False information', 'Other'];

export default function DiscussionsShow(props: ShowProps) {
    const { flash } = usePage<Flash>().props;
    const { appUrl } = usePage<{ appUrl?: string }>().props;
    const { discussion, isLiked } = props;

    const [liked, setLiked] = useState(isLiked);
    const [likeCount, setLikeCount] = useState(discussion.likes_count);
    const [reportTarget, setReportTarget] = useState<{ type: string; id: number; label: string } | null>(null);

    const replyForm = useForm({ content: '' });
    const reportForm = useForm({ reportable_type: '', reportable_id: '', reason: '', description: '' });

    function authorAvatar(avatar?: string | null): string | undefined {
        if (!avatar) return undefined;
        if (/^https?:\/\//.test(avatar)) return avatar;
        return `${appUrl ?? ''}/storage/${avatar}`;
    }

    function submitReply() {
        replyForm.post(`/discussions/${discussion.id}/replies`, {
            preserveScroll: true,
            onSuccess: () => replyForm.reset('content'),
        });
    }

    function toggleLike() {
        setLiked((prev) => {
            const next = !prev;
            setLikeCount((c) => (next ? c + 1 : Math.max(0, c - 1)));
            return next;
        });
        router.post(`/discussions/${discussion.id}/like`, {}, { preserveScroll: true });
    }

    function likeReply(reply: ReplyItem) {
        router.post(`/replies/${reply.id}/like`, {}, { preserveScroll: true });
    }

    function openReport(type: string, id: number, label: string) {
        reportForm.reset();
        reportForm.setData({ reportable_type: type, reportable_id: id.toString(), reason: '', description: '' });
        setReportTarget({ type, id, label });
    }

    function submitReport() {
        if (!reportTarget) return;
        reportForm.post('/reports', {
            preserveScroll: true,
            onSuccess: () => setReportTarget(null),
        });
    }

    return (
        <div className="mx-auto max-w-4xl space-y-6">
            <Head title={discussion.title} />

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
            </div>

            <Card className="p-6 sm:p-8">
                <div className="flex flex-wrap items-center gap-2">
                    {discussion.is_pinned && (
                        <Badge size="sm" color="amber">
                            <Pin className="mr-1 h-3 w-3" />
                            Pinned
                        </Badge>
                    )}
                    {discussion.subject && (
                        <Badge size="sm" color="blue">
                            {discussion.subject.name}
                        </Badge>
                    )}
                    {discussion.tags?.map((tag) => (
                        <Badge key={tag} size="sm" color="neutral">
                            #{tag}
                        </Badge>
                    ))}
                </div>

                <h1 className="mt-3 text-2xl font-bold text-ink sm:text-3xl">{discussion.title}</h1>

                <div className="mt-4 flex flex-wrap items-center gap-3">
                    <Avatar name={discussion.user?.name ?? 'User'} src={authorAvatar(discussion.user?.avatar)} size="sm" />
                    <div>
                        <p className="text-sm font-medium text-ink">{discussion.user?.name ?? 'Student'}</p>
                        <p className="text-xs text-muted">{timeAgo(discussion.created_at)}</p>
                    </div>
                    <span className="ml-auto inline-flex items-center gap-1.5 text-xs text-muted">
                        <Eye className="h-4 w-4" />
                        {discussion.views_count} views
                    </span>
                </div>

                <div className="mt-6 whitespace-pre-wrap text-sm leading-relaxed text-slate-800">{discussion.content}</div>

                <div className="mt-6 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-5">
                    <Button variant={liked ? 'ghost' : 'secondary'} size="sm" onClick={toggleLike}>
                        <Heart className={`h-4 w-4 ${liked ? 'fill-red-500 text-red-500' : ''}`} />
                        {likeCount} likes
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => openReport(DISCUSSION_CLASS, discussion.id, 'this discussion')}>
                        <Flag className="h-4 w-4 text-red-500" />
                        Report
                    </Button>
                </div>
            </Card>

            <Card className="p-6 sm:p-8">
                <h2 className="mb-4 flex items-center gap-2 font-semibold text-ink">
                    <MessageSquarePlus className="h-5 w-5 text-primary-600" />
                    Replies ({discussion.replies?.length ?? discussion.replies_count})
                </h2>

                {!discussion.replies || discussion.replies.length === 0 ? (
                    <EmptyState icon={Reply} title="No replies yet" description="Be the first to reply to this discussion." />
                ) : (
                    <div className="space-y-5">
                        {discussion.replies.map((reply) => (
                            <div key={reply.id} className="rounded-lg border border-slate-200 p-4">
                                <div className="flex items-center gap-2.5">
                                    <Avatar name={reply.user?.name ?? 'User'} src={authorAvatar(reply.user?.avatar)} size="sm" />
                                    <div>
                                        <p className="text-sm font-medium text-ink">{reply.user?.name ?? 'Student'}</p>
                                        <p className="text-xs text-muted">{timeAgo(reply.created_at)}</p>
                                    </div>
                                </div>
                                <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-slate-800">{reply.content}</p>
                                <div className="mt-3 flex items-center gap-2">
                                    <Button size="sm" variant="ghost" onClick={() => likeReply(reply)}>
                                        <ThumbsUp className="h-4 w-4 text-primary-600" />
                                        {reply.likes_count}
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => openReport(REPLY_CLASS, reply.id, 'this reply')}
                                    >
                                        <Flag className="h-4 w-4 text-red-500" />
                                        Report
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </Card>

            <Card className="p-6 sm:p-8">
                <h2 className="mb-4 font-semibold text-ink">Add a reply</h2>
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        submitReply();
                    }}
                    className="space-y-4"
                >
                    <Textarea
                        id="reply-content"
                        rows={4}
                        value={replyForm.data.content}
                        onChange={(e) => replyForm.setData('content', e.target.value)}
                        placeholder="Write your reply..."
                        error={replyForm.errors.content}
                    />
                    <div className="flex items-center gap-2">
                        <Button type="submit" loading={replyForm.processing}>
                            <Reply className="h-4 w-4" />
                            Reply
                        </Button>
                    </div>
                </form>
            </Card>

            <Modal
                open={reportTarget !== null}
                onClose={() => setReportTarget(null)}
                title="Report content"
                description={`Please tell us why you are reporting ${reportTarget?.label ?? 'this content'}.`}
                footer={
                    <>
                        <Button variant="secondary" onClick={() => setReportTarget(null)} disabled={reportForm.processing}>
                            Cancel
                        </Button>
                        <Button variant="danger" onClick={submitReport} loading={reportForm.processing}>
                            Submit report
                        </Button>
                    </>
                }
            >
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        submitReport();
                    }}
                    className="space-y-4"
                >
                    <Select
                        label="Reason"
                        id="report-reason"
                        value={reportForm.data.reason}
                        onChange={(e) => reportForm.setData('reason', e.target.value)}
                        error={reportForm.errors.reason}
                    >
                        <option value="">Select a reason</option>
                        {reportReasons.map((reason) => (
                            <option key={reason} value={reason}>
                                {reason}
                            </option>
                        ))}
                    </Select>
                    <Textarea
                        id="report-description"
                        rows={3}
                        value={reportForm.data.description}
                        onChange={(e) => reportForm.setData('description', e.target.value)}
                        placeholder="Additional details (optional)"
                        error={reportForm.errors.description}
                    />
                </form>
            </Modal>
        </div>
    );
}