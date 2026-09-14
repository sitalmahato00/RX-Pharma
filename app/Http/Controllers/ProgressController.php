<?php

namespace App\Http\Controllers;

use App\Models\Progress;
use App\Models\Quiz;
use App\Models\QuizAttempt;
use App\Models\Resource;
use Illuminate\Http\Request;

class ProgressController extends Controller
{
    public function index()
    {
        $user = auth()->user();

        $progressRows = Progress::where('user_id', $user->id)
            ->whereIn('progressable_type', [Resource::class, Quiz::class])
            ->with(['progressable.subject'])
            ->orderByDesc('updated_at')
            ->get();

        $overallProgress = (int) round($progressRows->where('progress_percent', '>', 0)->avg('progress_percent') ?? 0);

        $subjectProgress = $progressRows
            ->filter(fn (Progress $progress) => $progress->progressable !== null && $progress->progressable->subject_id !== null)
            ->groupBy(fn (Progress $progress) => $progress->progressable->subject_id)
            ->map(function ($group, $subjectId) {
                return [
                    'subject_id' => $subjectId,
                    'subject_name' => $group->first()->progressable->subject?->name,
                    'average_progress' => (int) round($group->avg('progress_percent')),
                    'total_resources' => Resource::where('subject_id', $subjectId)->count(),
                    'completed_resources' => $group->where('status', 'completed')->count(),
                ];
            })
            ->sortByDesc('average_progress')
            ->values();

        $completedByType = $progressRows
            ->where('status', 'completed')
            ->filter(fn (Progress $progress) => $progress->progressable instanceof Resource)
            ->map(fn (Progress $progress) => $progress->progressable->resource_type)
            ->countBy()
            ->all();

        $quizStats = [
            'total_attempts' => QuizAttempt::where('user_id', $user->id)->count(),
            'average_score' => (int) round(QuizAttempt::where('user_id', $user->id)->avg('score_percentage') ?? 0),
            'passed' => QuizAttempt::where('user_id', $user->id)->where('passed', true)->count(),
        ];

        return inertia('Student/Progress', [
            'progress' => $progressRows->map(fn (Progress $progress) => [
                'id' => $progress->id,
                'resource' => $progress->progressable,
                'status' => $progress->status,
                'progress_percent' => $progress->progress_percent,
                'completed_at' => $progress->completed_at?->toISOString(),
                'updated_at' => $progress->updated_at?->toISOString(),
            ]),
            'overallProgress' => $overallProgress,
            'subjectProgress' => $subjectProgress,
            'completedByType' => $completedByType,
            'quizStats' => $quizStats,
        ]);
    }

    public function update(Request $request)
    {
        $data = $request->validate([
            'progressable_type' => ['required', 'string'],
            'progressable_id' => ['required', 'integer'],
            'progress_percent' => ['required', 'integer', 'min:0', 'max:100'],
        ]);

        $progress = Progress::updateOrCreate(
            [
                'user_id' => auth()->id(),
                'progressable_type' => $data['progressable_type'],
                'progressable_id' => $data['progressable_id'],
            ],
            [
                'progress_percent' => $data['progress_percent'],
                'status' => $data['progress_percent'] >= 100 ? 'completed' : 'in_progress',
                'completed_at' => $data['progress_percent'] >= 100 ? now() : null,
            ]
        );

        return ['progress' => $progress];
    }

    public function markComplete(Request $request)
    {
        $data = $request->validate([
            'progressable_type' => ['required', 'string'],
            'progressable_id' => ['required', 'integer'],
        ]);

        $progress = Progress::updateOrCreate(
            [
                'user_id' => auth()->id(),
                'progressable_type' => $data['progressable_type'],
                'progressable_id' => $data['progressable_id'],
            ],
            [
                'status' => 'completed',
                'progress_percent' => 100,
                'completed_at' => now(),
            ]
        );

        return ['progress' => $progress];
    }
}