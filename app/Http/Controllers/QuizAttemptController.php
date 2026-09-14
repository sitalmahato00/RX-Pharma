<?php

namespace App\Http\Controllers;

use App\Models\Quiz;
use App\Models\QuizAnswer;
use App\Models\QuizAttempt;
use App\Models\QuizQuestion;
use Illuminate\Http\Request;

class QuizAttemptController extends Controller
{
    public function attempt(Quiz $quiz)
    {
        abort_unless($quiz->is_published, 404);

        $quiz->load(['subject', 'semester']);

        $attempt = $quiz->attempts()
            ->where('user_id', auth()->id())
            ->where('status', 'in_progress')
            ->latest('started_at')
            ->first();

        if ($attempt) {
            $attempt->answers()->delete();
        } else {
            $attempt = QuizAttempt::create([
                'user_id' => auth()->id(),
                'quiz_id' => $quiz->id,
                'total_questions' => $quiz->questions()->count(),
                'status' => 'in_progress',
                'started_at' => now(),
            ]);
        }

        $questions = $quiz->questions()
            ->with('options')
            ->get()
            ->each(function (QuizQuestion $question) {
                $question->options->each->makeHidden(['is_correct']);
                $question->makeHidden(['correct_option', 'explanation']);
            });

        return inertia('Student/Quiz/Attempt', [
            'quiz' => $quiz,
            'questions' => $questions,
            'attempt' => $attempt,
            'durationMinutes' => $quiz->duration_minutes,
        ]);
    }

    public function submit(Request $request, Quiz $quiz)
    {
        $data = $request->validate([
            'attempt_id' => ['required', 'integer'],
            'answers' => ['nullable', 'array'],
            'answers.*' => ['nullable', 'integer'],
            'time_spent_seconds' => ['nullable', 'integer', 'min:0'],
        ]);

        $attempt = QuizAttempt::where('user_id', auth()->id())
            ->where('quiz_id', $quiz->id)
            ->findOrFail($data['attempt_id']);

        $questions = $quiz->questions()->with('options')->get();

        $answers = $data['answers'] ?? [];
        $correct = 0;
        $wrong = 0;
        $unanswered = 0;
        $answerRows = [];

        foreach ($questions as $question) {
            $selectedOptionId = $answers[$question->id] ?? null;
            $correctOption = $question->options->firstWhere('is_correct', true);

            if ($selectedOptionId === null) {
                $unanswered++;

                continue;
            }

            $isCorrect = $correctOption?->id === $selectedOptionId;

            if ($isCorrect) {
                $correct++;
            } else {
                $wrong++;
            }

            $answerRows[] = [
                'attempt_id' => $attempt->id,
                'question_id' => $question->id,
                'option_id' => $selectedOptionId,
                'is_correct' => $isCorrect,
                'answered_at' => now(),
            ];
        }

        $total = $questions->count();
        $scorePercentage = $total > 0 ? (int) round(($correct / $total) * 100) : 0;

        QuizAnswer::insert($answerRows);

        $attempt->update([
            'total_questions' => $total,
            'correct_answers' => $correct,
            'wrong_answers' => $wrong,
            'unanswered' => $unanswered,
            'score_percentage' => $scorePercentage,
            'passed' => $scorePercentage >= $quiz->passing_score,
            'time_spent_seconds' => $data['time_spent_seconds'] ?? 0,
            'status' => 'completed',
            'completed_at' => now(),
            'answers_snapshot' => ['answers' => $answers],
        ]);

        $quiz->increment('attempts_count');

        return redirect()->route('quizzes.result', [$quiz, $attempt]);
    }

    public function results(Quiz $quiz, QuizAttempt $attempt)
    {
        abort_unless($attempt->user_id === auth()->id(), 403);
        abort_unless($attempt->quiz_id === $quiz->id, 404);

        $attempt->load(['quiz.subject', 'answers.question', 'answers.option']);

        $questions = $quiz->questions()->with('options')->get();

        $attemptAnswers = $attempt->answers->keyBy('question_id');

        $review = $questions->map(function (QuizQuestion $question) use ($attemptAnswers) {
            $userAnswer = $attemptAnswers->get($question->id);

            return [
                'id' => $question->id,
                'question' => $question->question,
                'explanation' => $question->explanation,
                'is_correct' => (bool) $userAnswer?->is_correct,
                'user_option_id' => $userAnswer?->option_id ?? null,
                'options' => $question->options->map(function ($option) use ($userAnswer) {
                    return [
                        'id' => $option->id,
                        'label' => $option->label,
                        'option_text' => $option->option_text,
                        'is_correct' => (bool) $option->is_correct,
                        'is_selected' => $userAnswer?->option_id === $option->id,
                    ];
                }),
            ];
        });

        return inertia('Student/Quiz/Results', [
            'quiz' => $attempt->quiz,
            'attempt' => $attempt,
            'review' => $review,
        ]);
    }

    public function history(Request $request)
    {
        $attempts = QuizAttempt::where('user_id', auth()->id())
            ->with(['quiz.subject'])
            ->orderByDesc('created_at')
            ->paginate($request->integer('per_page', 12))
            ->withQueryString();

        return inertia('Student/QuizResults', [
            'attempts' => $attempts,
        ]);
    }
}