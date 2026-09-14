<?php

namespace App\Http\Controllers;

use App\Enums\ReportStatus;
use App\Models\Discussion;
use App\Models\DiscussionReply;
use App\Models\Reaction;
use App\Models\Report;
use App\Models\Subject;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class DiscussionController extends Controller
{
    public function index(Request $request)
    {
        $discussions = Discussion::visible()
            ->with(['user:id,name,avatar', 'subject:id,name'])
            ->withCount('replies')
            ->when($request->filled('subject_id'), fn ($query) => $query->where('subject_id', $request->integer('subject_id')))
            ->when($request->filled('search'), fn ($query) => $query->where('title', 'like', "%{$request->string('search')->trim()}%"))
            ->orderByDesc('is_pinned')
            ->latest()
            ->paginate($request->integer('per_page', 15))
            ->withQueryString();

        $popularDiscussions = Discussion::visible()
            ->with('user:id,name,avatar')
            ->withCount('replies')
            ->orderByDesc('replies_count')
            ->latest()
            ->limit(5)
            ->get();

        $subjects = Subject::active()->orderBy('name')->get(['id', 'name']);

        return inertia('Student/Discussions/Index', [
            'discussions' => $discussions,
            'popularDiscussions' => $popularDiscussions,
            'subjects' => $subjects,
            'filters' => $request->only(['subject_id', 'search']),
        ]);
    }

    public function create()
    {
        return inertia('Student/Discussions/Create', [
            'subjects' => Subject::active()->orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'content' => ['required', 'string', 'max:10000'],
            'subject_id' => ['nullable', Rule::exists('subjects', 'id')],
            'tags' => ['nullable', 'array'],
            'tags.*' => ['nullable', 'string', 'max:50'],
        ]);

        $discussion = $request->user()->discussions()->create([
            'subject_id' => $data['subject_id'] ?? null,
            'semester_id' => $request->user()->semester_id,
            'title' => $data['title'],
            'content' => $data['content'],
            'tags' => $data['tags'] ?? [],
            'status' => 'visible',
        ]);

        return redirect()->route('discussions.show', $discussion)->with('success', 'Discussion posted.');
    }

    public function show(Discussion $discussion)
    {
        abort_unless($discussion->status === 'visible', 404);

        $discussion->load(['user:id,name,avatar', 'subject:id,name', 'replies.user:id,name,avatar']);

        $discussion->increment('views_count');

        $isLiked = Reaction::where('user_id', auth()->id())
            ->where('reactable_type', Discussion::class)
            ->where('reactable_id', $discussion->id)
            ->exists();

        return inertia('Student/Discussions/Show', [
            'discussion' => $discussion,
            'isLiked' => $isLiked,
        ]);
    }

    public function reply(Request $request, Discussion $discussion)
    {
        $data = $request->validate([
            'content' => ['required', 'string', 'max:5000'],
        ]);

        DiscussionReply::create([
            'discussion_id' => $discussion->id,
            'user_id' => auth()->id(),
            'content' => $data['content'],
            'status' => 'visible',
        ]);

        $discussion->increment('replies_count');

        return back()->with('success', 'Reply posted.');
    }

    public function like(Discussion $discussion)
    {
        $reaction = Reaction::where('user_id', auth()->id())
            ->where('reactable_type', Discussion::class)
            ->where('reactable_id', $discussion->id)
            ->first();

        if ($reaction) {
            $reaction->delete();
            $discussion->decrement('likes_count');
        } else {
            Reaction::create([
                'user_id' => auth()->id(),
                'reactable_type' => Discussion::class,
                'reactable_id' => $discussion->id,
            ]);
            $discussion->increment('likes_count');
        }

        return back();
    }

    public function likeReply(DiscussionReply $reply)
    {
        $reaction = Reaction::where('user_id', auth()->id())
            ->where('reactable_type', DiscussionReply::class)
            ->where('reactable_id', $reply->id)
            ->first();

        if ($reaction) {
            $reaction->delete();
            $reply->decrement('likes_count');
        } else {
            Reaction::create([
                'user_id' => auth()->id(),
                'reactable_type' => DiscussionReply::class,
                'reactable_id' => $reply->id,
            ]);
            $reply->increment('likes_count');
        }

        return back();
    }

    public function report(Request $request)
    {
        $data = $request->validate([
            'reportable_type' => ['required', 'string'],
            'reportable_id' => ['required', 'integer'],
            'reason' => ['required', 'string', 'max:500'],
            'description' => ['nullable', 'string', 'max:2000'],
        ]);

        Report::create([
            'user_id' => auth()->id(),
            'reportable_type' => $data['reportable_type'],
            'reportable_id' => $data['reportable_id'],
            'reason' => $data['reason'],
            'description' => $data['description'] ?? null,
            'status' => ReportStatus::Pending,
        ]);

        return back()->with('success', 'Report submitted. Thank you for keeping the community safe.');
    }
}