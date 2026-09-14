<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\Quiz;
use App\Models\QuizQuestion;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class AdminQuizController extends Controller
{
    public function index(Request $request)
    {
        $quizzes = Quiz::query()
            ->with('subject:id,name')
            ->withCount('questions')
            ->when($request->filled('search'), fn ($q) => $q->where('title', 'like', "%{$request->search}%"))
            ->when($request->filled('subject_id'), fn ($q) => $q->where('subject_id', $request->integer('subject_id')))
            ->when($request->filled('status'), fn ($q) => $q->where('status', $request->status))
            ->latest()
            ->paginate(15)
            ->withQueryString();

        $subjects = \App\Models\Subject::active()->orderBy('name')->get(['id', 'name']);

        return inertia('Admin/Quiz/Index', [
            'quizzes' => $quizzes,
            'subjects' => $subjects,
            'filters' => $request->only(['search', 'subject_id', 'status']),
        ]);
    }

    public function create()
    {
        return inertia('Admin/Quiz/Create', [
            'subjects' => \App\Models\Subject::active()->orderBy('name')->get(['id', 'name']),
            'semesters' => \App\Models\Semester::active()->orderBy('number')->get(['id', 'name', 'number']),
            'units' => \App\Models\Unit::active()->orderBy('name')->get(['id', 'name', 'subject_id']),
            'topics' => \App\Models\Topic::active()->orderBy('name')->get(['id', 'name', 'unit_id']),
        ]);
    }

    public function store(Request $request)
    {
        $data = $this->validatedData($request);

        $quiz = Quiz::create([
            'title' => $data['title'],
            'slug' => Str::slug($data['title']),
            'description' => $data['description'] ?? null,
            'subject_id' => $data['subject_id'] ?? null,
            'semester_id' => $data['semester_id'] ?? null,
            'unit_id' => $data['unit_id'] ?? null,
            'topic_id' => $data['topic_id'] ?? null,
            'duration_minutes' => $data['duration_minutes'] ?? null,
            'passing_score' => $data['passing_score'] ?? null,
            'difficulty' => $data['difficulty'] ?? 'medium',
            'status' => $data['status'],
            'featured' => $request->boolean('featured'),
            'created_by' => $request->user()->id,
        ]);

        $this->syncQuestions($quiz, $data['questions'] ?? []);

        ActivityLog::record($request->user(), 'create', "Created quiz: {$quiz->title}", 'quiz', $quiz->id);

        return redirect()->route('admin.quizzes.index')->with('success', 'Quiz created.');
    }

    public function edit(Quiz $quiz)
    {
        $quiz->load(['questions' => fn ($q) => $q->with('options')->orderBy('sort_order')]);

        return inertia('Admin/Quiz/Edit', [
            'quiz' => $quiz,
            'subjects' => \App\Models\Subject::active()->orderBy('name')->get(['id', 'name']),
            'semesters' => \App\Models\Semester::active()->orderBy('number')->get(['id', 'name', 'number']),
            'units' => \App\Models\Unit::active()->orderBy('name')->get(['id', 'name', 'subject_id']),
            'topics' => \App\Models\Topic::active()->orderBy('name')->get(['id', 'name', 'unit_id']),
        ]);
    }

    public function update(Request $request, Quiz $quiz)
    {
        $data = $this->validatedData($request);

        $quiz->update([
            'title' => $data['title'],
            'slug' => Str::slug($data['title']),
            'description' => $data['description'] ?? null,
            'subject_id' => $data['subject_id'] ?? null,
            'semester_id' => $data['semester_id'] ?? null,
            'unit_id' => $data['unit_id'] ?? null,
            'topic_id' => $data['topic_id'] ?? null,
            'duration_minutes' => $data['duration_minutes'] ?? null,
            'passing_score' => $data['passing_score'] ?? null,
            'difficulty' => $data['difficulty'] ?? 'medium',
            'status' => $data['status'],
            'featured' => $request->boolean('featured'),
        ]);

        $this->syncQuestions($quiz, $data['questions'] ?? []);

        ActivityLog::record($request->user(), 'update', "Updated quiz: {$quiz->title}", 'quiz', $quiz->id);

        return redirect()->route('admin.quizzes.index')->with('success', 'Quiz updated.');
    }

    public function destroy(Request $request, Quiz $quiz)
    {
        $title = $quiz->title;
        $quiz->delete();

        ActivityLog::record($request->user(), 'delete', "Deleted quiz: {$title}", 'quiz', $quiz->id);

        return back();
    }

    public function publish(Request $request, Quiz $quiz)
    {
        $quiz->update([
            'status' => 'published',
            'total_questions' => $quiz->questions()->count(),
        ]);

        ActivityLog::record($request->user(), 'publish', "Published quiz: {$quiz->title}", 'quiz', $quiz->id);

        return back();
    }

    public function questions(Request $request)
    {
        $questions = QuizQuestion::query()
            ->with(['quiz:id,title', 'options'])
            ->when($request->filled('quiz_id'), fn ($q) => $q->where('quiz_id', $request->integer('quiz_id')))
            ->latest()
            ->paginate(15)
            ->withQueryString();

        $quizzes = Quiz::orderBy('title')->get(['id', 'title']);

        return inertia('Admin/Quiz/Questions', [
            'questions' => $questions,
            'quizzes' => $quizzes,
            'filters' => $request->only(['quiz_id']),
        ]);
    }

    protected function validatedData(Request $request): array
    {
        return $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'subject_id' => ['nullable', 'exists:subjects,id'],
            'semester_id' => ['nullable', 'exists:semesters,id'],
            'unit_id' => ['nullable', 'exists:units,id'],
            'topic_id' => ['nullable', 'exists:topics,id'],
            'duration_minutes' => ['nullable', 'integer', 'min:1', 'max:600'],
            'passing_score' => ['nullable', 'integer', 'min:0', 'max:100'],
            'difficulty' => ['nullable', 'in:easy,medium,hard'],
            'status' => ['required', 'in:draft,published'],
            'featured' => ['nullable', 'boolean'],
            'questions' => ['nullable', 'array'],
            'questions.*.question' => ['required_with:questions', 'string', 'max:1000'],
            'questions.*.explanation' => ['nullable', 'string'],
            'questions.*.difficulty' => ['nullable', 'in:easy,medium,hard'],
            'questions.*.points' => ['nullable', 'integer', 'min:0'],
            'questions.*.options' => ['nullable', 'array', 'min:2'],
        ]);
    }

    protected function syncQuestions(Quiz $quiz, array $questions): void
    {
        $quiz->questions()->get()->each(function ($question) {
            $question->options()->delete();
            $question->delete();
        });

        foreach (array_values($questions) as $index => $questionData) {
            $question = $quiz->questions()->create([
                'question' => $questionData['question'],
                'explanation' => $questionData['explanation'] ?? null,
                'difficulty' => $questionData['difficulty'] ?? 'medium',
                'points' => $questionData['points'] ?? 1,
                'sort_order' => $index + 1,
            ]);

            foreach ($this->normalizeOptions($questionData['options'] ?? []) as $optionIndex => $option) {
                $question->options()->create([
                    'label' => $option['label'],
                    'option_text' => $option['option_text'],
                    'is_correct' => $option['is_correct'],
                    'sort_order' => $optionIndex + 1,
                ]);
            }
        }

        $quiz->update(['total_questions' => $quiz->questions()->count()]);
    }

    protected function normalizeOptions(array $options): array
    {
        $hasShorthand = array_key_exists('correct_index', $options) || isset($options['options']);

        if ($hasShorthand) {
            $correctIndex = (int) ($options['correct_index'] ?? -1);
            $raw = is_array($options['options'] ?? null) ? $options['options'] : $options;

            return collect(array_values($raw))->map(function ($option, $index) use ($correctIndex) {
                return [
                    'label' => is_array($option) ? ($option['label'] ?? chr(65 + $index)) : chr(65 + $index),
                    'option_text' => is_array($option) ? ($option['option_text'] ?? '') : $option,
                    'is_correct' => is_array($option) ? boolval($option['is_correct'] ?? ($index === $correctIndex)) : $index === $correctIndex,
                ];
            })->values()->all();
        }

        return collect($options)->map(function ($option, $index) {
            return [
                'label' => $option['label'] ?? chr(65 + $index),
                'option_text' => $option['option_text'] ?? '',
                'is_correct' => boolval($option['is_correct'] ?? false),
            ];
        })->values()->all();
    }
}