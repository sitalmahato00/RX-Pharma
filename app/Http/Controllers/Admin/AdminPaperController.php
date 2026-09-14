<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\PreviousPaper;
use App\Models\Resource;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class AdminPaperController extends Controller
{
    public function index(Request $request)
    {
        $papers = Resource::ofType('previous_paper')
            ->with(['previousPaper', 'subject:id,name', 'semester:id,name,number'])
            ->when($request->filled('search'), fn ($q) => $q->where('title', 'like', "%{$request->search}%"))
            ->when($request->filled('subject_id'), fn ($q) => $q->where('subject_id', $request->integer('subject_id')))
            ->when($request->filled('status'), fn ($q) => $q->where('status', $request->status))
            ->latest()
            ->paginate(15)
            ->withQueryString();

        $subjects = \App\Models\Subject::active()->orderBy('name')->get(['id', 'name']);

        return inertia('Admin/Paper/Index', [
            'papers' => $papers,
            'subjects' => $subjects,
            'filters' => $request->only(['search', 'subject_id', 'status']),
        ]);
    }

    public function create()
    {
        return inertia('Admin/Paper/Create', [
            'universities' => \App\Models\University::active()->orderBy('name')->get(['id', 'name']),
            'colleges' => \App\Models\College::active()->orderBy('name')->get(['id', 'name', 'university_id']),
            'programs' => \App\Models\Program::active()->orderBy('name')->get(['id', 'name']),
            'semesters' => \App\Models\Semester::active()->orderBy('number')->get(['id', 'name', 'number']),
            'subjects' => \App\Models\Subject::active()->orderBy('name')->get(['id', 'name']),
            'units' => \App\Models\Unit::active()->orderBy('name')->get(['id', 'name', 'subject_id']),
            'topics' => \App\Models\Topic::active()->orderBy('name')->get(['id', 'name', 'unit_id']),
        ]);
    }

    public function store(Request $request)
    {
        $data = $this->validatedData($request);

        $resource = Resource::create([
            'title' => $data['title'],
            'slug' => Str::slug($data['title']),
            'description' => $data['description'] ?? null,
            'resource_type' => 'previous_paper',
            'university_id' => $data['university_id'] ?? null,
            'college_id' => $data['college_id'] ?? null,
            'program_id' => $data['program_id'] ?? null,
            'semester_id' => $data['semester_id'] ?? null,
            'subject_id' => $data['subject_id'] ?? null,
            'unit_id' => $data['unit_id'] ?? null,
            'topic_id' => $data['topic_id'] ?? null,
            'status' => $data['status'],
            'featured' => $request->boolean('featured'),
            'published_at' => $data['published_at'] ?? ($data['status'] === 'published' ? now() : null),
            'created_by' => $request->user()->id,
        ]);

        $filePath = null;
        $fileName = null;
        $fileSize = null;
        if ($request->hasFile('file')) {
            $file = $request->file('file');
            $filePath = $file->store('papers', 'public');
            $fileName = $file->getClientOriginalName();
            $fileSize = $file->getSize();
        } elseif ($request->filled('file_path')) {
            $filePath = $request->input('file_path');
        }

        $answerKeyPath = null;
        $hasAnswerKey = false;
        if ($request->hasFile('answer_key')) {
            $answerKeyPath = $request->file('answer_key')->store('papers/answers', 'public');
            $hasAnswerKey = true;
        } elseif ($request->filled('answer_key_path')) {
            $answerKeyPath = $request->input('answer_key_path');
            $hasAnswerKey = true;
        }

        $paper = PreviousPaper::create([
            'resource_id' => $resource->id,
            'year' => $data['year'],
            'exam_type' => $data['exam_type'] ?? null,
            'file_path' => $filePath,
            'file_name' => $fileName,
            'file_size' => $fileSize,
            'answer_key_path' => $answerKeyPath,
            'has_answer_key' => $hasAnswerKey,
        ]);

        ActivityLog::record($request->user(), 'create', "Created paper: {$resource->title}", 'previous_paper', $paper->id);

        return redirect()->route('admin.papers.index')->with('success', 'Paper created.');
    }

    public function edit(PreviousPaper $paper)
    {
        $paper->load('resource');

        return inertia('Admin/Paper/Edit', [
            'paper' => $paper,
            'universities' => \App\Models\University::active()->orderBy('name')->get(['id', 'name']),
            'colleges' => \App\Models\College::active()->orderBy('name')->get(['id', 'name', 'university_id']),
            'programs' => \App\Models\Program::active()->orderBy('name')->get(['id', 'name']),
            'semesters' => \App\Models\Semester::active()->orderBy('number')->get(['id', 'name', 'number']),
            'subjects' => \App\Models\Subject::active()->orderBy('name')->get(['id', 'name']),
            'units' => \App\Models\Unit::active()->orderBy('name')->get(['id', 'name', 'subject_id']),
            'topics' => \App\Models\Topic::active()->orderBy('name')->get(['id', 'name', 'unit_id']),
        ]);
    }

    public function update(Request $request, PreviousPaper $paper)
    {
        $data = $this->validatedData($request);

        $resource = $paper->resource;

        $resource->update([
            'title' => $data['title'],
            'slug' => Str::slug($data['title']),
            'description' => $data['description'] ?? null,
            'university_id' => $data['university_id'] ?? null,
            'college_id' => $data['college_id'] ?? null,
            'program_id' => $data['program_id'] ?? null,
            'semester_id' => $data['semester_id'] ?? null,
            'subject_id' => $data['subject_id'] ?? null,
            'unit_id' => $data['unit_id'] ?? null,
            'topic_id' => $data['topic_id'] ?? null,
            'status' => $data['status'],
            'featured' => $request->boolean('featured'),
            'published_at' => $data['published_at'] ?? ($data['status'] === 'published' ? ($resource->published_at ?: now()) : null),
        ]);

        $filePath = $paper->file_path;
        $fileName = $paper->file_name;
        $fileSize = $paper->file_size;
        if ($request->hasFile('file')) {
            $file = $request->file('file');
            $filePath = $file->store('papers', 'public');
            $fileName = $file->getClientOriginalName();
            $fileSize = $file->getSize();
        } elseif ($request->filled('file_path')) {
            $filePath = $request->input('file_path');
        }

        $answerKeyPath = $paper->answer_key_path;
        $hasAnswerKey = $paper->has_answer_key;
        if ($request->hasFile('answer_key')) {
            $answerKeyPath = $request->file('answer_key')->store('papers/answers', 'public');
            $hasAnswerKey = true;
        } elseif ($request->filled('answer_key_path')) {
            $answerKeyPath = $request->input('answer_key_path');
            $hasAnswerKey = true;
        } elseif ($request->input('answer_key_path') === '' || $request->input('answer_key_path') === null) {
            $answerKeyPath = null;
            $hasAnswerKey = false;
        }

        $paper->update([
            'year' => $data['year'],
            'exam_type' => $data['exam_type'] ?? null,
            'file_path' => $filePath,
            'file_name' => $fileName,
            'file_size' => $fileSize,
            'answer_key_path' => $answerKeyPath,
            'has_answer_key' => $hasAnswerKey,
        ]);

        ActivityLog::record($request->user(), 'update', "Updated paper: {$resource->title}", 'previous_paper', $paper->id);

        return redirect()->route('admin.papers.index')->with('success', 'Paper updated.');
    }

    public function destroy(Request $request, PreviousPaper $paper)
    {
        $title = $paper->resource?->title ?? "Paper #{$paper->id}";

        $paper->resource?->delete();
        $paper->delete();

        ActivityLog::record($request->user(), 'delete', "Deleted paper: {$title}", 'previous_paper', $paper->id);

        return back();
    }

    public function publish(Request $request, PreviousPaper $paper)
    {
        $resource = $paper->resource;

        $resource->update([
            'status' => 'published',
            'published_at' => $resource->published_at ?: now(),
        ]);

        ActivityLog::record($request->user(), 'publish', "Published paper: {$resource->title}", 'previous_paper', $paper->id);

        return back();
    }

    protected function validatedData(Request $request): array
    {
        return $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'university_id' => ['nullable', 'exists:universities,id'],
            'college_id' => ['nullable', 'exists:colleges,id'],
            'program_id' => ['nullable', 'exists:programs,id'],
            'semester_id' => ['nullable', 'exists:semesters,id'],
            'subject_id' => ['nullable', 'exists:subjects,id'],
            'unit_id' => ['nullable', 'exists:units,id'],
            'topic_id' => ['nullable', 'exists:topics,id'],
            'status' => ['required', 'in:draft,published,archived'],
            'featured' => ['nullable', 'boolean'],
            'year' => ['required', 'integer', 'min:1990', 'max:2100'],
            'exam_type' => ['nullable', 'string', 'max:255'],
            'file_path' => ['nullable', 'string', 'max:2048'],
            'file' => ['nullable', 'file', 'mimes:pdf,doc,docx,zip', 'max:51200'],
            'answer_key_path' => ['nullable', 'string', 'max:2048'],
            'answer_key' => ['nullable', 'file', 'mimes:pdf,doc,docx,zip', 'max:51200'],
            'tags' => ['nullable', 'array'],
            'tags.*' => ['string', 'max:100'],
            'published_at' => ['nullable', 'date'],
        ]);
    }
}