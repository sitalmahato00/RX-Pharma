<?php

namespace App\Http\Controllers;

use App\Models\Bookmark;
use App\Models\Progress;
use App\Models\Quiz;
use App\Models\RecentView;
use App\Models\Resource;

class LearningController extends Controller
{
    public function index()
    {
        $user = auth()->user();

        $continueLearning = Progress::where('user_id', $user->id)
            ->whereIn('progressable_type', [Resource::class, Quiz::class])
            ->where('status', '!=', 'completed')
            ->with(['progressable.subject', 'progressable.semester'])
            ->orderByDesc('updated_at')
            ->get()
            ->filter(fn (Progress $progress) => $progress->progressable !== null)
            ->map(fn (Progress $progress) => [
                'id' => $progress->id,
                'resource' => $progress->progressable,
                'progress_percent' => $progress->progress_percent,
                'status' => $progress->status,
                'updated_at' => $progress->updated_at?->toISOString(),
            ]);

        $recentlyViewed = RecentView::where('user_id', $user->id)
            ->with('viewable')
            ->orderByDesc('viewed_at')
            ->limit(8)
            ->get()
            ->filter(fn ($view) => $view->viewable !== null)
            ->map(fn ($view) => [
                'resource' => $view->viewable,
                'viewed_at' => $view->viewed_at?->toISOString(),
            ]);

        $savedResources = Bookmark::where('user_id', $user->id)
            ->where('bookmarkable_type', Resource::class)
            ->whereHas('bookmarkable', fn ($query) => $query->published())
            ->with('bookmarkable')
            ->latest()
            ->limit(6)
            ->get()
            ->filter(fn ($bookmark) => $bookmark->bookmarkable !== null)
            ->map(fn ($bookmark) => $bookmark->bookmarkable);

        $recommended = Resource::published()
            ->with(['subject', 'semester', 'unit', 'topic'])
            ->latest('published_at')
            ->limit(6)
            ->get();

        $completed = Progress::where('user_id', $user->id)
            ->whereIn('progressable_type', [Resource::class, Quiz::class])
            ->where('status', 'completed')
            ->with(['progressable.subject', 'progressable.semester'])
            ->orderByDesc('completed_at')
            ->get()
            ->filter(fn (Progress $progress) => $progress->progressable !== null)
            ->map(fn (Progress $progress) => [
                'id' => $progress->id,
                'resource' => $progress->progressable,
                'completed_at' => $progress->completed_at?->toISOString(),
            ]);

        return inertia('Student/Learning', [
            'continueLearning' => $continueLearning->values(),
            'recentlyViewed' => $recentlyViewed->values(),
            'savedResources' => $savedResources->values(),
            'recommended' => $recommended,
            'completed' => $completed->values(),
            'counts' => [
                'in_progress' => $continueLearning->count(),
                'completed' => $completed->count(),
                'saved' => $savedResources->count(),
            ],
        ]);
    }
}