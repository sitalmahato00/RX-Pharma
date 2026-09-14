<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\Resource;
use App\Models\Tag;
use App\Models\Video;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class AdminVideoController extends Controller
{
    public function index(Request $request)
    {
        $videos = Resource::ofType('video')
            ->with(['video', 'subject:id,name', 'semester:id,name,number'])
            ->when($request->filled('search'), fn ($q) => $q->where('title', 'like', "%{$request->search}%"))
            ->when($request->filled('subject_id'), fn ($q) => $q->where('subject_id', $request->integer('subject_id')))
            ->when($request->filled('status'), fn ($q) => $q->where('status', $request->status))
            ->latest()
            ->paginate(15)
            ->withQueryString();

        $subjects = \App\Models\Subject::active()->orderBy('name')->get(['id', 'name']);

        return inertia('Admin/Video/Index', [
            'videos' => $videos,
            'subjects' => $subjects,
            'filters' => $request->only(['search', 'subject_id', 'status']),
        ]);
    }

    public function create()
    {
        return inertia('Admin/Video/Create', [
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
            'resource_type' => 'video',
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

        $videoPath = null;
        if ($request->hasFile('video')) {
            $videoPath = $request->file('video')->store('videos', 'public');
        }

        $thumbnailPath = null;
        if ($request->hasFile('thumbnail')) {
            $thumbnailPath = $request->file('thumbnail')->store('videos/thumbnails', 'public');
        } elseif ($request->filled('thumbnail_path')) {
            $thumbnailPath = $request->input('thumbnail_path');
        }

        $video = Video::create([
            'resource_id' => $resource->id,
            'thumbnail' => $thumbnailPath,
            'video_url' => $data['video_type'] === 'url' ? ($data['video_url'] ?? null) : null,
            'video_path' => $videoPath,
            'video_type' => $data['video_type'],
            'provider' => $data['provider'] ?? null,
            'duration_seconds' => $data['duration_seconds'] ?? null,
        ]);

        $this->syncTags($resource, $data['tags'] ?? []);

        ActivityLog::record($request->user(), 'create', "Created video: {$resource->title}", 'video', $video->id);

        return redirect()->route('admin.videos.index')->with('success', 'Video created.');
    }

    public function edit(Video $video)
    {
        $video->load('resource');

        return inertia('Admin/Video/Edit', [
            'video' => $video,
            'universities' => \App\Models\University::active()->orderBy('name')->get(['id', 'name']),
            'colleges' => \App\Models\College::active()->orderBy('name')->get(['id', 'name', 'university_id']),
            'programs' => \App\Models\Program::active()->orderBy('name')->get(['id', 'name']),
            'semesters' => \App\Models\Semester::active()->orderBy('number')->get(['id', 'name', 'number']),
            'subjects' => \App\Models\Subject::active()->orderBy('name')->get(['id', 'name']),
            'units' => \App\Models\Unit::active()->orderBy('name')->get(['id', 'name', 'subject_id']),
            'topics' => \App\Models\Topic::active()->orderBy('name')->get(['id', 'name', 'unit_id']),
        ]);
    }

    public function update(Request $request, Video $video)
    {
        $data = $this->validatedData($request);

        $resource = $video->resource;

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

        $videoPath = null;
        if ($request->hasFile('video')) {
            $videoPath = $request->file('video')->store('videos', 'public');
        }

        $thumbnailPath = $video->thumbnail;
        if ($request->hasFile('thumbnail')) {
            $thumbnailPath = $request->file('thumbnail')->store('videos/thumbnails', 'public');
        } elseif ($request->filled('thumbnail_path')) {
            $thumbnailPath = $request->input('thumbnail_path');
        }

        $video->update([
            'thumbnail' => $thumbnailPath,
            'video_url' => $data['video_type'] === 'url' ? ($data['video_url'] ?? null) : null,
            'video_path' => $videoPath ?? $video->video_path,
            'video_type' => $data['video_type'],
            'provider' => $data['provider'] ?? null,
            'duration_seconds' => $data['duration_seconds'] ?? null,
        ]);

        $this->syncTags($resource, $data['tags'] ?? []);

        ActivityLog::record($request->user(), 'update', "Updated video: {$resource->title}", 'video', $video->id);

        return redirect()->route('admin.videos.index')->with('success', 'Video updated.');
    }

    public function destroy(Request $request, Video $video)
    {
        $title = $video->resource?->title ?? "Video #{$video->id}";

        $video->resource?->delete();
        $video->delete();

        ActivityLog::record($request->user(), 'delete', "Deleted video: {$title}", 'video', $video->id);

        return back();
    }

    public function publish(Request $request, Video $video)
    {
        $resource = $video->resource;

        $resource->update([
            'status' => 'published',
            'published_at' => $resource->published_at ?: now(),
        ]);

        ActivityLog::record($request->user(), 'publish', "Published video: {$resource->title}", 'video', $video->id);

        return back();
    }

    public function toggleFeature(Request $request, Video $video)
    {
        $resource = $video->resource;

        $resource->update(['featured' => ! $resource->featured]);

        ActivityLog::record($request->user(), 'toggle', "Updated video featured flag: {$resource->title}", 'video', $video->id);

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
            'video_url' => ['nullable', 'url', 'max:2048'],
            'thumbnail_path' => ['nullable', 'string', 'max:2048'],
            'thumbnail' => ['nullable', 'image', 'max:5120'],
            'video' => ['nullable', 'file', 'mimes:mp4,webm,ogg,mov,mkv', 'max:512000'],
            'video_type' => ['required', 'in:url,upload'],
            'provider' => ['nullable', 'string', 'max:100'],
            'duration_seconds' => ['nullable', 'integer', 'min:0'],
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