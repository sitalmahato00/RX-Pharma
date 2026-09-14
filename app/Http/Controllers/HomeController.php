<?php

namespace App\Http\Controllers;

use App\Enums\ResourceType;
use App\Models\Subject;
use Illuminate\Http\Request;

class HomeController extends Controller
{
    public function index()
    {
        $stats = [
            'notes' => \App\Models\Resource::published()->ofType('note')->count(),
            'videos' => \App\Models\Resource::published()->ofType('video')->count(),
            'mcqs' => \App\Models\QuizQuestion::count(),
            'literature' => \App\Models\Resource::published()->ofType('literature')->count(),
            'papers' => \App\Models\Resource::published()->ofType('previous_paper')->count(),
            'practical' => \App\Models\Resource::published()->ofType('practical')->count(),
        ];

        $subjects = Subject::active()->popular(8)->withCount(['resources' => fn ($q) => $q->published()])->get();

        $latestResources = \App\Models\Resource::published()
            ->with(['subject', 'semester'])
            ->latest('published_at')
            ->limit(12)
            ->get();

        $universities = \App\Models\University::active()
            ->withCount(['colleges' => fn ($q) => $q->active()])
            ->limit(5)
            ->get();

        $userProgress = null;
        $recentResources = [];
        if (auth()->check()) {
            $user = auth()->user();
            $subjectIds = $user->progress()->pluck('progressable_id');
            $userProgress = Subject::whereIn('id', $subjectIds)
                ->withCount('resources')
                ->get();
            $recentResources = \App\Models\RecentView::where('user_id', $user->id)
                ->with('viewable.subject')
                ->latest('viewed_at')
                ->limit(6)
                ->get()
                ->pluck('viewable')
                ->filter();
        }

        return inertia('Home', [
            'stats' => $stats,
            'subjects' => $subjects,
            'latestResources' => $latestResources,
            'universities' => $universities,
            'userProgress' => $userProgress,
            'recentResources' => $recentResources,
        ]);
    }
}