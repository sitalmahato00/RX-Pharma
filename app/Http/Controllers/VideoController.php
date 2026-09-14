<?php

namespace App\Http\Controllers;

use App\Models\Resource;
use App\Models\Semester;
use App\Models\Subject;
use Illuminate\Http\Request;

class VideoController extends Controller
{
    public function index(Request $request)
    {
        $resources = Resource::published()
            ->ofType('video')
            ->with(['subject', 'semester', 'video'])
            ->when($request->filled('subject_id'), fn ($q) => $q->where('subject_id', $request->integer('subject_id')))
            ->when($request->filled('semester_id'), fn ($q) => $q->where('semester_id', $request->integer('semester_id')))
            ->latest('published_at')
            ->paginate($request->integer('per_page', 12))
            ->withQueryString();

        $subjects = Subject::active()->orderBy('name')->get(['id', 'name']);
        $semesters = Semester::active()->orderBy('number')->get(['id', 'name', 'number']);

        return inertia('Videos/Index', [
            'resources' => $resources,
            'subjects' => $subjects,
            'semesters' => $semesters,
            'filters' => $request->only(['subject_id', 'semester_id']),
        ]);
    }

    public function show(Resource $resource)
    {
        abort_unless($resource->isPublished(), 404);

        $resource->load(['subject', 'semester', 'unit', 'topic', 'tags', 'video']);
        $resource->video?->makeHidden(['video_path']);
        $resource->incrementViews();

        return inertia('Videos/Show', [
            'resource' => $resource,
        ]);
    }
}
