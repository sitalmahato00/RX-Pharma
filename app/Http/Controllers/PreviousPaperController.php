<?php

namespace App\Http\Controllers;

use App\Models\PreviousPaper;
use App\Models\Resource;
use Illuminate\Http\Request;

class PreviousPaperController extends Controller
{
    public function index(Request $request)
    {
        $filters = $request->validate([
            'year' => ['nullable', 'integer', 'min:2000', 'max:2100'],
            'exam_type' => ['nullable', 'string', 'max:50'],
        ]);

        $resources = Resource::published()
            ->ofType('previous_paper')
            ->with(['subject', 'semester', 'previousPaper'])
            ->when($request->filled('year'), fn ($q) => $q->whereHas('previousPaper', fn ($q) => $q->where('year', $request->integer('year'))))
            ->when($request->filled('exam_type'), fn ($q) => $q->whereHas('previousPaper', fn ($q) => $q->where('exam_type', $request->query('exam_type'))))
            ->latest('published_at')
            ->paginate($request->integer('per_page', 12))
            ->withQueryString();

        $years = PreviousPaper::query()
            ->distinct()
            ->orderByDesc('year')
            ->pluck('year');

        $examTypes = PreviousPaper::query()
            ->whereNotNull('exam_type')
            ->distinct()
            ->orderBy('exam_type')
            ->pluck('exam_type');

        return inertia('PreviousPapers/Index', [
            'resources' => $resources,
            'years' => $years,
            'examTypes' => $examTypes,
            'filters' => $filters,
        ]);
    }

    public function show(Resource $resource)
    {
        abort_unless($resource->isPublished(), 404);

        $resource->load(['subject', 'semester', 'unit', 'topic', 'tags', 'previousPaper']);
        $resource->previousPaper?->makeHidden(['file_path', 'answer_key_path']);
        $resource->incrementViews();

        return inertia('PreviousPapers/Show', [
            'resource' => $resource,
        ]);
    }
}
