<?php

namespace App\Http\Controllers;

use App\Models\Quiz;
use App\Models\Subject;
use Illuminate\Http\Request;

class QuizController extends Controller
{
    public function index(Request $request)
    {
        $quizzes = Quiz::published()
            ->with(['subject', 'semester'])
            ->when($request->filled('subject_id'), fn ($q) => $q->where('subject_id', $request->integer('subject_id')))
            ->latest()
            ->paginate($request->integer('per_page', 12))
            ->withQueryString();

        $subjects = Subject::active()->orderBy('name')->get(['id', 'name']);

        return inertia('Quiz/Index', [
            'quizzes' => $quizzes,
            'subjects' => $subjects,
            'filters' => $request->only(['subject_id']),
        ]);
    }

    public function show(Quiz $quiz)
    {
        abort_unless($quiz->is_published, 404);

        $quiz->load(['subject', 'semester', 'unit', 'topic']);

        $questions = $quiz->questions()
            ->with('options')
            ->get()
            ->each(function ($question) {
                $question->options->each->makeHidden(['is_correct']);
                $question->makeHidden(['correct_option']);
            });

        $quiz->setRelation('questions', $questions);

        return inertia('Quiz/Show', [
            'quiz' => $quiz,
        ]);
    }
}
