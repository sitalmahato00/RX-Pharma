<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Quiz;
use App\Models\QuizAttempt;
use App\Models\Resource;
use App\Models\Subject;
use App\Models\User;
use Illuminate\Http\Request;

class AdminAnalyticsController extends Controller
{
    public function index()
    {
        $resourceStats = Resource::selectRaw('resource_type, COUNT(*) as total')
            ->groupBy('resource_type')
            ->pluck('total', 'resource_type')
            ->toArray();

        $months = collect();
        for ($i = 5; $i >= 0; $i--) {
            $month = now()->subMonths($i)->startOfMonth();
            $months->put($month->format('Y-m'), ['label' => $month->format('M Y'), 'total' => 0]);
        }

        $registrations = User::where('role', 'student')
            ->where('created_at', '>=', now()->subMonths(6)->startOfMonth())
            ->selectRaw("DATE_FORMAT(created_at, '%Y-%m') as month, COUNT(*) as total")
            ->groupBy('month')
            ->pluck('total', 'month');

        $studentRegistrations = $months->map(function ($data, $key) use ($registrations) {
            $data['total'] = (int) ($registrations[$key] ?? 0);
            return $data;
        })->values()->all();

        $mostViewedNotes = Resource::ofType('note')
            ->with('note')
            ->orderByDesc('views_count')
            ->limit(5)
            ->get(['id', 'title', 'views_count', 'status']);

        $mostWatchedVideos = Resource::ofType('video')
            ->with('video')
            ->orderByDesc('views_count')
            ->limit(5)
            ->get(['id', 'title', 'views_count', 'status']);

        $popularSubjects = Subject::withCount('resources')
            ->orderByDesc('resources_count')
            ->limit(8)
            ->get(['id', 'name', 'color']);

        $quizPerformance = [
            'total_attempts' => QuizAttempt::count(),
            'average_score' => round((float) QuizAttempt::avg('score_percentage'), 2),
            'pass_rate' => QuizAttempt::count() > 0
                ? round((float) (QuizAttempt::where('passed', true)->count() / QuizAttempt::count()) * 100, 2)
                : 0,
        ];

        $mostAttemptedQuizzes = Quiz::withCount('attempts')
            ->orderByDesc('attempts_count')
            ->limit(5)
            ->get(['id', 'title', 'difficulty', 'status']);

        $recentResources = Resource::with('subject:id,name')
            ->latest()
            ->limit(5)
            ->get(['id', 'title', 'resource_type', 'status', 'views_count', 'created_at']);

        return inertia('Admin/Analytics/Index', [
            'resourceStats' => $resourceStats,
            'studentRegistrations' => $studentRegistrations,
            'mostViewedNotes' => $mostViewedNotes,
            'mostWatchedVideos' => $mostWatchedVideos,
            'popularSubjects' => $popularSubjects,
            'quizPerformance' => $quizPerformance,
            'mostAttemptedQuizzes' => $mostAttemptedQuizzes,
            'recentResources' => $recentResources,
        ]);
    }
}