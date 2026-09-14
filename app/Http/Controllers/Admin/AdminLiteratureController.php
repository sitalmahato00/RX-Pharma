<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\Literature;
use App\Models\Resource;
use App\Models\Tag;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class AdminLiteratureController extends Controller
{
    public function index(Request $request)
    {
        $literature = Resource::ofType('literature')
            ->with(['literature', 'subject:id,name', 'semester:id,name,number'])
            ->when($request->filled('search'), fn ($q) => $q->where('title', 'like', "%{$request->search}%"))
            ->when($request->filled('subject_id'), fn ($q) => $q->where('subject_id', $request->integer('subject_id')))
            ->when($request->filled('status'), fn ($q) => $q->where('status', $request->status))
            ->latest()
            ->paginate(15)
            ->withQueryString();

        $subjects = \App\Models\Subject::active()->orderBy('name')->get(['id', 'name']);

        return inertia('Admin/Literature/Index', [
            'literature' => $literature,
            'subjects' => $subjects,
            'filters' => $request->only(['search', 'subject_id', 'status']),
        ]);
    }

    public function create()
    {
        return inertia('Admin/Literature/Create', [
            'universities' => \App\Models\University::active()->orderBy('name')->get(['id', 'name']),
            'colleges' => \App\Models\College::active()->orderBy('name')->get(['id', 'name', 'university_id']),
            'programs' => \App\Models\Program::active()->orderBy('name')->get(['id', 'name']),
            'semesters' => \App\Models\Semester::active()->orderBy('number')->get(['id', 'name', 'number']),
            'subjects' => \App\Models\Subject::active()->orderBy('name')->get(['id', 'name']),
            'units' => \App\Models\Unit::active()->orderBy('name')->get(['id', 'name', 'subject_id']),
            'topics' => \App\Models\Topic::active()->orderBy('name')->get(['id', 'name', 'unit_id']),
            'categories' => [
                ['value' => 'who_guidelines', 'label' => 'WHO Guidelines'],
                ['value' => 'research_articles', 'label' => 'Research Articles'],
                ['value' => 'clinical_guidelines', 'label' => 'Clinical Guidelines'],
                ['value' => 'pharmacopoeia', 'label' => 'Pharmacopoeia'],
                ['value' => 'drug_guidelines', 'label' => 'Drug Guidelines'],
                ['value' => 'reference_books', 'label' => 'Reference Books'],
                ['value' => 'government_documents', 'label' => 'Government Documents'],
                ['value' => 'journals', 'label' => 'Journals'],
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
            'resource_type' => 'literature',
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
        if ($request->hasFile('file')) {
            $filePath = $request->file('file')->store('literature', 'public');
        } elseif ($request->filled('file_path')) {
            $filePath = $request->input('file_path');
        }

        $coverPath = null;
        if ($request->hasFile('cover_image_file')) {
            $coverPath = $request->file('cover_image_file')->store('literature/covers', 'public');
        } elseif ($request->filled('cover_image')) {
            $coverPath = $request->input('cover_image');
        }

        $lit = Literature::create([
            'resource_id' => $resource->id,
            'category' => $data['category'],
            'author' => $data['author'] ?? null,
            'organization' => $data['organization'] ?? null,
            'year' => $data['year'] ?? null,
            'file_path' => $filePath,
            'external_url' => $data['external_url'] ?? null,
            'cover_image' => $coverPath,
        ]);

        $this->syncTags($resource, $data['tags'] ?? []);

        ActivityLog::record($request->user(), 'create', "Created literature: {$resource->title}", 'literature', $lit->id);

        return redirect()->route('admin.literature.index')->with('success', 'Literature created.');
    }

    public function edit(Literature $literature)
    {
        $literature->load('resource');

        return inertia('Admin/Literature/Edit', [
            'literature' => $literature,
            'universities' => \App\Models\University::active()->orderBy('name')->get(['id', 'name']),
            'colleges' => \App\Models\College::active()->orderBy('name')->get(['id', 'name', 'university_id']),
            'programs' => \App\Models\Program::active()->orderBy('name')->get(['id', 'name']),
            'semesters' => \App\Models\Semester::active()->orderBy('number')->get(['id', 'name', 'number']),
            'subjects' => \App\Models\Subject::active()->orderBy('name')->get(['id', 'name']),
            'units' => \App\Models\Unit::active()->orderBy('name')->get(['id', 'name', 'subject_id']),
            'topics' => \App\Models\Topic::active()->orderBy('name')->get(['id', 'name', 'unit_id']),
            'categories' => [
                ['value' => 'who_guidelines', 'label' => 'WHO Guidelines'],
                ['value' => 'research_articles', 'label' => 'Research Articles'],
                ['value' => 'clinical_guidelines', 'label' => 'Clinical Guidelines'],
                ['value' => 'pharmacopoeia', 'label' => 'Pharmacopoeia'],
                ['value' => 'drug_guidelines', 'label' => 'Drug Guidelines'],
                ['value' => 'reference_books', 'label' => 'Reference Books'],
                ['value' => 'government_documents', 'label' => 'Government Documents'],
                ['value' => 'journals', 'label' => 'Journals'],
            ],
        ]);
    }

    public function update(Request $request, Literature $literature)
    {
        $data = $this->validatedData($request);

        $resource = $literature->resource;

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

        $filePath = $literature->file_path;
        if ($request->hasFile('file')) {
            $filePath = $request->file('file')->store('literature', 'public');
        } elseif ($request->filled('file_path')) {
            $filePath = $request->input('file_path');
        }

        $coverPath = $literature->cover_image;
        if ($request->hasFile('cover_image_file')) {
            $coverPath = $request->file('cover_image_file')->store('literature/covers', 'public');
        } elseif ($request->filled('cover_image')) {
            $coverPath = $request->input('cover_image');
        }

        $literature->update([
            'category' => $data['category'],
            'author' => $data['author'] ?? null,
            'organization' => $data['organization'] ?? null,
            'year' => $data['year'] ?? null,
            'file_path' => $filePath,
            'external_url' => $data['external_url'] ?? null,
            'cover_image' => $coverPath,
        ]);

        $this->syncTags($resource, $data['tags'] ?? []);

        ActivityLog::record($request->user(), 'update', "Updated literature: {$resource->title}", 'literature', $literature->id);

        return redirect()->route('admin.literature.index')->with('success', 'Literature updated.');
    }

    public function destroy(Request $request, Literature $literature)
    {
        $title = $literature->resource?->title ?? "Literature #{$literature->id}";

        $literature->resource?->delete();
        $literature->delete();

        ActivityLog::record($request->user(), 'delete', "Deleted literature: {$title}", 'literature', $literature->id);

        return back();
    }

    public function publish(Request $request, Literature $literature)
    {
        $resource = $literature->resource;

        $resource->update([
            'status' => 'published',
            'published_at' => $resource->published_at ?: now(),
        ]);

        ActivityLog::record($request->user(), 'publish', "Published literature: {$resource->title}", 'literature', $literature->id);

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
            'category' => ['required', Rule::in(['who_guidelines', 'research_articles', 'clinical_guidelines', 'pharmacopoeia', 'drug_guidelines', 'reference_books', 'government_documents', 'journals'])],
            'author' => ['nullable', 'string', 'max:255'],
            'organization' => ['nullable', 'string', 'max:255'],
            'year' => ['nullable', 'integer', 'min:1900', 'max:2100'],
            'file_path' => ['nullable', 'string', 'max:2048'],
            'file' => ['nullable', 'file', 'mimes:pdf,doc,docx,txt', 'max:51200'],
            'external_url' => ['nullable', 'url', 'max:2048'],
            'cover_image' => ['nullable', 'string', 'max:2048'],
            'cover_image_file' => ['nullable', 'image', 'max:5120'],
            'tags' => ['nullable', 'array'],
            'tags.*' => ['string', 'max:100'],
            'published_at' => ['nullable', 'date'],
        ]);
    }

    protected function syncTags(Resource $resource, array $tags): void
    {
        $tagIds = collect($tags)
            ->filter()
            ->map(fn ($name) => Tag::firstOrCreate(
                ['name' => trim($name)],
                ['slug' => Str::slug($name), 'type' => 'resource']
            ))
            ->pluck('id');

        $resource->tags()->sync($tagIds);
    }
}