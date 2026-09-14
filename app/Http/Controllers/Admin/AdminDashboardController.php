<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Discussion;
use App\Models\Literature;
use App\Models\Note;
use App\Models\PreviousPaper;
use App\Models\QuizAttempt;
use App\Models\QuizQuestion;
use App\Models\Report;
use App\Models\Resource;
use App\Models\User;
use App\Models\Video;

class AdminDashboardController extends Controller
{
    public function index()
    {
        $stats = [
            'students' => User::where('role', 'student')->count(),
            'notes' => Note::count(),
            'videos' => Video::count(),
            'mcqs' => QuizQuestion::count(),
            'literature' => Literature::count(),
            'papers' => PreviousPaper::count(),
            'quizzes' => \App\Models\Quiz::count(),
            'discussions' => Discussion::count(),
        ];

        $recentResources = Resource::with('subject:id,name')
            ->latest()
            ->limit(5)
            ->get(['id', 'title', 'resource_type', 'status', 'views_count', 'created_at']);

        $recentStudents = User::where('role', 'student')
            ->latest()
            ->limit(5)
            ->get(['id', 'name', 'email', 'is_active', 'created_at']);

        $activityCounts = [
            'total_views' => (int) Resource::sum('views_count'),
            'total_bookmarks' => (int) Resource::sum('bookmarks_count'),
            'total_downloads' => (int) Resource::sum('downloads_count'),
            'total_attempts' => QuizAttempt::count(),
            'pending_reports' => Report::where('status', 'pending')->count(),
            'pending_resources' => Resource::where('status', 'draft')->count(),
        ];

        return inertia('Admin/Dashboard/Index', [
            'stats' => $stats,
            'recentResources' => $recentResources,
            'recentStudents' => $recentStudents,
            'activityCounts' => $activityCounts,
        ]);
    }
}