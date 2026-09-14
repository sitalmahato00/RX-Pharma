<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\Discussion;
use Illuminate\Http\Request;

class AdminDiscussionController extends Controller
{
    public function index(Request $request)
    {
        $discussions = Discussion::query()
            ->with(['user:id,name,email', 'subject:id,name'])
            ->when($request->filled('search'), fn ($q) => $q->where('title', 'like', "%{$request->search}%"))
            ->when($request->filled('status'), fn ($q) => $q->where('status', $request->status))
            ->latest()
            ->paginate(15)
            ->withQueryString();

        return inertia('Admin/Discussion/Index', [
            'discussions' => $discussions,
            'filters' => $request->only(['search', 'status']),
        ]);
    }

    public function toggle(Request $request, Discussion $discussion)
    {
        $discussion->update(['status' => $discussion->status === 'visible' ? 'hidden' : 'visible']);

        ActivityLog::record($request->user(), 'toggle', "Updated discussion visibility: {$discussion->title}", 'discussion', $discussion->id);

        return back();
    }

    public function destroy(Request $request, Discussion $discussion)
    {
        $title = $discussion->title;
        $discussion->delete();

        ActivityLog::record($request->user(), 'delete', "Deleted discussion: {$title}", 'discussion', $discussion->id);

        return back();
    }
}