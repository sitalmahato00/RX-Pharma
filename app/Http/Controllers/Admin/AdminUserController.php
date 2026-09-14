<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\User;
use Illuminate\Http\Request;

class AdminUserController extends Controller
{
    public function index(Request $request)
    {
        $users = User::query()
            ->withCount(['quizAttempts', 'discussions'])
            ->when($request->filled('search'), fn ($q) => $q->where(function ($q) use ($request) {
                $q->where('name', 'like', "%{$request->search}%")
                    ->orWhere('email', 'like', "%{$request->search}%");
            }))
            ->when($request->filled('role'), fn ($q) => $q->where('role', $request->role))
            ->latest()
            ->paginate(15)
            ->withQueryString();

        return inertia('Admin/User/Index', [
            'users' => $users,
            'filters' => $request->only(['search', 'role']),
            'roles' => [
                ['value' => 'student', 'label' => 'Student'],
                ['value' => 'admin', 'label' => 'Admin'],
            ],
        ]);
    }

    public function show(User $user)
    {
        $user->load([
            'university:id,name',
            'college:id,name',
            'program:id,name',
            'semester:id,name,number',
            'activityLogs' => fn ($q) => $q->latest('created_at')->limit(20),
            'quizAttempts' => fn ($q) => $q->with('quiz:id,title')->latest()->limit(20),
        ]);

        $stats = [
            'attempts_count' => $user->quizAttempts()->count(),
            'discussions_count' => $user->discussions()->count(),
            'bookmarks_count' => $user->bookmarks()->count(),
            'average_score' => round((float) $user->quizAttempts()->avg('score_percentage'), 2),
        ];

        return inertia('Admin/User/Show', [
            'user' => $user,
            'stats' => $stats,
        ]);
    }

    public function toggle(Request $request, User $user)
    {
        $user->update(['is_active' => ! $user->is_active]);

        ActivityLog::record($request->user(), 'toggle', "Updated user {$user->name} active status", 'user', $user->id);

        return back();
    }

    public function destroy(Request $request, User $user)
    {
        $name = $user->name;
        $user->delete();

        ActivityLog::record($request->user(), 'delete', "Deleted user: {$name}", 'user', $user->id);

        return back();
    }
}