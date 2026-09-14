<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\Quiz;
use App\Models\QuizAttempt;
use Illuminate\Http\Request;

class AdminAttemptController extends Controller
{
    public function index(Request $request)
    {
        $attempts = QuizAttempt::query()
            ->with(['user:id,name,email', 'quiz:id,title'])
            ->when($request->filled('quiz_id'), fn ($q) => $q->where('quiz_id', $request->integer('quiz_id')))
            ->when($request->filled('search'), fn ($q) => $q->whereHas('user', function ($q) use ($request) {
                $q->where('name', 'like', "%{$request->search}%")
                    ->orWhere('email', 'like', "%{$request->search}%");
            }))
            ->latest()
            ->paginate(15)
            ->withQueryString();

        $quizzes = Quiz::orderBy('title')->get(['id', 'title']);

        return inertia('Admin/Attempt/Index', [
            'attempts' => $attempts,
            'quizzes' => $quizzes,
            'filters' => $request->only(['quiz_id', 'search']),
        ]);
    }

    public function destroy(Request $request, QuizAttempt $attempt)
    {
        $attempt->delete();

        ActivityLog::record($request->user(), 'delete', "Deleted quiz attempt #{$attempt->id}", 'quiz_attempt', $attempt->id);

        return back();
    }
}