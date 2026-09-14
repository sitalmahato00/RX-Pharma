<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\PracticalResource;
use App\Models\Resource;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class AdminPracticalController extends Controller
{
    public function index(Request $request)
    {
        $practicals = Resource::ofType('practical')
            ->with(['practicalResource', 'subject:id,name', 'semester:id,name,number'])
            ->when($request->filled('search'), fn ($q) => $q->where('title', 'like', "%{$request->search}%"))
            ->when($request->filled('subject_id'), fn ($q) => $q->where('subject_id', $request->integer('subject_id')))
            ->when($request->filled('status'), fn ($q) => $q->where('status', $request->status))
            ->latest()
            ->paginate(15)
            ->withQueryString();

        $subjects = \App\Models\Subject::active()->orderBy('name')->get(['id', 'name']);

        return inertia('Admin/Practical/Index', [
            'practicals' => $practicals,
            'subjects' => $subjects,
            'filters' => $request->only(['search', 'subject_id', 'status']),
        ]);
    }

    public function create()
    {
        return inertia('Admin/Practical/Create', [
            'universities' => \App\Models\University::active()->orderBy('name')->get(['id', 'name']),
            'colleges' => \App\Models\College::active()->orderBy('name')->get(['id', 'name', 'university_id']),
            'programs' => \App\Models\Program::active()->orderBy('name')->get(['id', 'name']),
            'semesters' => \App\Models\Semester::active()->orderBy('number')->get(['id', 'name', 'number']),
            'subjects' => \App\Models\Subject::active()->orderBy('name')->get(['id', 'name']),
            'units' => \App\Models\Unit::active()->orderBy('name')->get(['id', 'name', 'subject_id']),
            'topics' => \App\Models\Topic::active()->orderBy('name')->get(['id', 'name', 'unit_id']),
            'practicalTypes' => [
                ['value' => 'practical_notes', 'label' => 'Practical Notes'],
                ['value' => 'lab_manuals', 'label' => 'Lab Manuals'],
                ['value' => 'viva_questions', 'label' => 'Viva Questions'],
                ['value' => 'procedures', 'label' => 'Procedures'],
                ['value' => 'diagrams', 'label' => 'Diagrams'],
                ['value' => 'demonstration_videos', 'label' => 'Demonstration Videos'],
            ],
        ]);
    }

    public function store(Request $request)
    {
        $data = $this->validatedData($request);

        $resource = Resource::create([
            'title' => $data['title'],
            'slug' => Str::slug($data['title']),
            'description' => $data['description'] ?? null,
            'resource_type' => 'practical',
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

        $resourcePath = null;
        if ($request->hasFile('resource_file')) {
            $resourcePath = $request->file('resource_file')->store('practical', 'public');
        } elseif ($request->filled('resource_path')) {
            $resourcePath = $request->input('resource_path');
        }

        $thumbnailPath = null;
        if ($request->hasFile('thumbnail')) {
            $thumbnailPath = $request->file('thumbnail')->store('practical/thumbnails', 'public');
        }

        $practical = PracticalResource::create([
            'resource_id' => $resource->id,
            'practical_type' => $data['practical_type'],
            'resource_path' => $resourcePath,
            'thumbnail' => $thumbnailPath,
            'steps' => $data['steps'] ?? null,
        ]);

        ActivityLog::record($request->user(), 'create', "Created practical: {$resource->title}", 'practical', $practical->id);

        return redirect()->route('admin.practical.index')->with('success', 'Practical created.');
    }

    public function edit(PracticalResource $practical)
    {
        $practical->load('resource');

        return inertia('Admin/Practical/Edit', [
            'practical' => $practical,
            'universities' => \App\Models\University::active()->orderBy('name')->get(['id', 'name']),
            'colleges' => \App\Models\College::active()->orderBy('name')->get(['id', 'name', 'university_id']),
            'programs' => \App\Models\Program::active()->orderBy('name')->get(['id', 'name']),
            'semesters' => \App\Models\Semester::active()->orderBy('number')->get(['id', 'name', 'number']),
            'subjects' => \App\Models\Subject::active()->orderBy('name')->get(['id', 'name']),
            'units' => \App\Models\Unit::active()->orderBy('name')->get(['id', 'name', 'subject_id']),
            'topics' => \App\Models\Topic::active()->orderBy('name')->get(['id', 'name', 'unit_id']),
            'practicalTypes' => [
                ['value' => 'practical_notes', 'label' => 'Practical Notes'],
                ['value' => 'lab_manuals', 'label' => 'Lab Manuals'],
                ['value' => 'viva_questions', 'label' => 'Viva Questions'],
                ['value' => 'procedures', 'label' => 'Procedures'],
                ['value' => 'diagrams', 'label' => 'Diagrams'],
                ['value' => 'demonstration_videos', 'label' => 'Demonstration Videos'],
            ],
        ]);
    }

    public function update(Request $request, PracticalResource $practical)
    {
        $data = $this->validatedData($request);

        $resource = $practical->resource;

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

        $resourcePath = $practical->resource_path;
        if ($request->hasFile('resource_file')) {
            $resourcePath = $request->file('resource_file')->store('practical', 'public');
        } elseif ($request->filled('resource_path')) {
            $resourcePath = $request->input('resource_path');
        }

        $thumbnailPath = $practical->thumbnail;
        if ($request->hasFile('thumbnail')) {
            $thumbnailPath = $request->file('thumbnail')->store('practical/thumbnails', 'public');
        }

        $practical->update([
            'practical_type' => $data['practical_type'],
            'resource_path' => $resourcePath,
            'thumbnail' => $thumbnailPath,
            'steps' => $data['steps'] ?? null,
        ]);

        ActivityLog::record($request->user(), 'update', "Updated practical: {$resource->title}", 'practical', $practical->id);

        return redirect()->route('admin.practical.index')->with('success', 'Practical updated.');
    }

    public function destroy(Request $request, PracticalResource $practical)
    {
        $title = $practical->resource?->title ?? "Practical #{$practical->id}";

        $practical->resource?->delete();
        $practical->delete();

        ActivityLog::record($request->user(), 'delete', "Deleted practical: {$title}", 'practical', $practical->id);

        return back();
    }

    public function publish(Request $request, PracticalResource $practical)
    {
        $resource = $practical->resource;

        $resource->update([
            'status' => 'published',
            'published_at' => $resource->published_at ?: now(),
        ]);

        ActivityLog::record($request->user(), 'publish', "Published practical: {$resource->title}", 'practical', $practical->id);

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
            'practical_type' => ['required', 'string'],
            'resource_path' => ['nullable', 'string', 'max:2048'],
            'resource_file' => ['nullable', 'file', 'max:51200'],
            'thumbnail' => ['nullable', 'image', 'max:5120'],
            'steps' => ['nullable', 'array'],
            'tags' => ['nullable', 'array'],
            'tags.*' => ['string', 'max:100'],
            'published_at' => ['nullable', 'date'],
        ]);
    }
}