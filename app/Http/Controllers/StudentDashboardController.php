<?php

namespace App\Http\Controllers;

use App\Enums\ResourceType;
use App\Models\Bookmark;
use App\Models\Progress;
use App\Models\Quiz;
use App\Models\QuizAttempt;
use App\Models\RecentView;
use App\Models\Resource;
use App\Models\Subject;

class StudentDashboardController extends Controller
{
    public function index()
    {
        $user = auth()->user();

        $firstName = collect(explode(' ', trim((string) $user->name)))->first() ?? $user->name;

        $progressRows = Progress::where('user_id', $user->id)
            ->whereIn('progressable_type', [Resource::class, Quiz::class])
            ->with(['progressable.subject', 'progressable.semester'])
            ->latest('updated_at')
            ->get();

        $continueLearning = $progressRows
            ->filter(fn (Progress $progress) => $progress->status !== 'completed' && $progress->progressable !== null)
            ->groupBy(fn (Progress $progress) => get_class($progress->progressable).':'.$progress->progressable_id)
            ->map(fn ($group) => $group->first())
            ->values()
            ->map(fn (Progress $progress) => [
                'id' => $progress->id,
                'resource' => $progress->progressable,
                'progress_percent' => $progress->progress_percent,
                'status' => $progress->status,
                'updated_at' => $progress->updated_at?->toISOString(),
            ]);

        $stats = collect(ResourceType::cases())
            ->mapWithKeys(fn (ResourceType $type) => [
                $type->value => Resource::published()->ofType($type)->count(),
            ])
            ->put('quizzes', Quiz::published()->count())
            ->put('subjects', Subject::active()->count())
            ->all();

        $quickLinks = [
            ['label' => 'Browse Notes', 'description' => 'Study notes from your subjects', 'route' => 'notes.index', 'icon' => 'document-text'],
            ['label' => 'Watch Videos', 'description' => 'Video lectures and demonstrations', 'route' => 'videos.index', 'icon' => 'play-circle'],
            ['label' => 'Read Literature', 'description' => 'Guidelines, journals and articles', 'route' => 'literature.index', 'icon' => 'book-open'],
            ['label' => 'Previous Papers', 'description' => 'Past exam papers with answer keys', 'route' => 'previous-papers.index', 'icon' => 'clipboard-document-list'],
            ['label' => 'Practice Quizzes', 'description' => 'Test your knowledge and track scores', 'route' => 'quizzes.index', 'icon' => 'academic-cap'],
            ['label' => 'Practical & Viva', 'description' => 'Lab manuals, procedures and viva questions', 'route' => 'practical.index', 'icon' => 'beaker'],
        ];

        $overallProgress = (int) round($progressRows->where('progress_percent', '>', 0)->avg('progress_percent') ?? 0);

        $totalCompleted = $progressRows->where('status', 'completed')->count();

        $subjectProgress = $progressRows
            ->filter(fn (Progress $progress) => $progress->progressable !== null && $progress->progressable->subject_id !== null)
            ->groupBy(fn (Progress $progress) => $progress->progressable->subject_id)
            ->map(function ($group) {
                $resource = $group->first()->progressable;

                return [
                    'subject_id' => $resource->subject_id,
                    'subject_name' => $resource->subject?->name,
                    'average_progress' => (int) round($group->avg('progress_percent')),
                ];
            })
            ->sortByDesc('average_progress')
            ->values();

        $recentViewed = RecentView::where('user_id', $user->id)
            ->with('viewable')
            ->orderByDesc('viewed_at')
            ->limit(6)
            ->get()
            ->filter(fn ($view) => $view->viewable !== null)
            ->values();

        $bookmarksCount = Bookmark::where('user_id', $user->id)->count();

        $quizStats = [
            'attempts' => QuizAttempt::where('user_id', $user->id)->count(),
            'average_score' => (int) round(QuizAttempt::where('user_id', $user->id)->avg('score_percentage') ?? 0),
        ];

        $topSubjectId = $progressRows
            ->filter(fn (Progress $progress) => $progress->progressable !== null && $progress->progressable->subject_id !== null)
            ->sortByDesc('progress_percent')
            ->first()?->progressable?->subject_id;

        $recommended = collect();

        if ($topSubjectId) {
            $completedResourceIds = $progressRows
                ->where('status', 'completed')
                ->filter(fn (Progress $progress) => $progress->progressable instanceof Resource)
                ->pluck('progressable.id')
                ->all();

            $recommended = Resource::published()
                ->where('subject_id', $topSubjectId)
                ->whereNotIn('id', $completedResourceIds)
                ->with(['subject', 'semester', 'unit', 'topic'])
                ->latest('published_at')
                ->limit(4)
                ->get();
        }

        return inertia('Student/Dashboard', [
            'user' => [
                'name' => $user->name,
                'firstName' => $firstName,
                'avatar' => $user->avatar_url,
                'email' => $user->email,
            ],
            'continueLearning' => $continueLearning,
            'stats' => $stats,
            'quickLinks' => $quickLinks,
            'overallProgress' => $overallProgress,
            'totalCompleted' => $totalCompleted,
            'subjectProgress' => $subjectProgress,
            'recentViewed' => $recentViewed,
            'bookmarksCount' => $bookmarksCount,
            'quizStats' => $quizStats,
            'recommended' => $recommended,
        ]);
    }
}