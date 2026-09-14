<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\Note;
use App\Models\Resource;
use App\Models\Tag;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class AdminNoteController extends Controller
{
    public function index(Request $request)
    {
        $notes = Resource::ofType('note')
            ->with(['note', 'subject:id,name', 'semester:id,name,number'])
            ->when($request->filled('search'), fn ($q) => $q->where('title', 'like', "%{$request->search}%"))
            ->when($request->filled('subject_id'), fn ($q) => $q->where('subject_id', $request->integer('subject_id')))
            ->when($request->filled('status'), fn ($q) => $q->where('status', $request->status))
            ->latest()
            ->paginate(15)
            ->withQueryString();

        $subjects = \App\Models\Subject::active()->orderBy('name')->get(['id', 'name']);

        return inertia('Admin/Note/Index', [
            'notes' => $notes,
            'subjects' => $subjects,
            'filters' => $request->only(['search', 'subject_id', 'status']),
        ]);
    }

    public function create()
    {
        return inertia('Admin/Note/Create', [
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
            'resource_type' => 'note',
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

        $filePath = $this->resolveFilePath($request);

        $note = Note::create([
            'resource_id' => $resource->id,
            'cover_image' => $data['cover_image'] ?? null,
            'file_path' => $filePath,
            'file_name' => $this->uploadedFileName($request),
            'file_size' => $this->uploadedFileSize($request),
            'author' => $data['author'] ?? null,
        ]);

        $this->syncTags($resource, $data['tags'] ?? []);

        ActivityLog::record($request->user(), 'create', "Created note: {$resource->title}", 'note', $note->id);

        return redirect()->route('admin.notes.index')->with('success', 'Note created.');
    }

    public function edit(Note $note)
    {
        $note->load('resource');

        return inertia('Admin/Note/Edit', [
            'note' => $note,
            'universities' => \App\Models\University::active()->orderBy('name')->get(['id', 'name']),
            'colleges' => \App\Models\College::active()->orderBy('name')->get(['id', 'name', 'university_id']),
            'programs' => \App\Models\Program::active()->orderBy('name')->get(['id', 'name']),
            'semesters' => \App\Models\Semester::active()->orderBy('number')->get(['id', 'name', 'number']),
            'subjects' => \App\Models\Subject::active()->orderBy('name')->get(['id', 'name']),
            'units' => \App\Models\Unit::active()->orderBy('name')->get(['id', 'name', 'subject_id']),
            'topics' => \App\Models\Topic::active()->orderBy('name')->get(['id', 'name', 'unit_id']),
        ]);
    }

    public function update(Request $request, Note $note)
    {
        $data = $this->validatedData($request);

        $resource = $note->resource;

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

        $note->update([
            'cover_image' => $data['cover_image'] ?? $note->cover_image,
            'file_path' => $this->resolveFilePath($request) ?? $note->file_path,
            'file_name' => $this->uploadedFileName($request) ?? $note->file_name,
            'file_size' => $this->uploadedFileSize($request) ?? $note->file_size,
            'author' => $data['author'] ?? null,
        ]);

        $this->syncTags($resource, $data['tags'] ?? []);

        ActivityLog::record($request->user(), 'update', "Updated note: {$resource->title}", 'note', $note->id);

        return redirect()->route('admin.notes.index')->with('success', 'Note updated.');
    }

    public function destroy(Request $request, Note $note)
    {
        $title = $note->resource?->title ?? "Note #{$note->id}";

        $note->resource?->delete();
        $note->delete();

        ActivityLog::record($request->user(), 'delete', "Deleted note: {$title}", 'note', $note->id);

        return back();
    }

    public function publish(Request $request, Note $note)
    {
        $resource = $note->resource;

        $resource->update([
            'status' => 'published',
            'published_at' => $resource->published_at ?: now(),
        ]);

        ActivityLog::record($request->user(), 'publish', "Published note: {$resource->title}", 'note', $note->id);

        return back();
    }

    public function toggleFeature(Request $request, Note $note)
    {
        $resource = $note->resource;

        $resource->update(['featured' => ! $resource->featured]);

        ActivityLog::record($request->user(), 'toggle', "Updated note featured flag: {$resource->title}", 'note', $note->id);

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
            'cover_image' => ['nullable', 'string', 'max:2048'],
            'file_path' => ['nullable', 'string', 'max:2048'],
            'file' => ['nullable', 'file', 'mimes:pdf,doc,docx,ppt,pptx,txt', 'max:51200'],
            'pdf' => ['nullable', 'file', 'mimes:pdf', 'max:51200'],
            'tags' => ['nullable', 'array'],
            'tags.*' => ['string', 'max:100'],
            'author' => ['nullable', 'string', 'max:255'],
            'published_at' => ['nullable', 'date'],
        ]);
    }

    protected function resolveFilePath(Request $request): ?string
    {
        if ($request->hasFile('pdf')) {
            return $request->file('pdf')->store('notes/pdfs', 'public');
        }

        if ($request->hasFile('file')) {
            return $request->file('file')->store('notes', 'public');
        }

        return $request->filled('file_path') ? $request->input('file_path') : null;
    }

    protected function uploadedFileName(Request $request): ?string
    {
        return $request->hasFile('pdf')
            ? $request->file('pdf')->getClientOriginalName()
            : ($request->hasFile('file') ? $request->file('file')->getClientOriginalName() : null);
    }

    protected function uploadedFileSize(Request $request): ?int
    {
        return $request->hasFile('pdf')
            ? $request->file('pdf')->getSize()
            : ($request->hasFile('file') ? $request->file('file')->getSize() : null);
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

    protected function classify(?string $resourceSlug): ?Resource
    {
        return $resourceSlug ? Resource::where('slug', $resourceSlug)->first() : null;
    }
}