<?php

namespace App\Http\Controllers;

use App\Enums\PracticalType;
use App\Models\Resource;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class PracticalController extends Controller
{
    public function index(Request $request)
    {
        $request->validate([
            'practical_type' => ['nullable', Rule::in(array_column(PracticalType::cases(), 'value'))],
        ]);

        $resources = Resource::published()
            ->ofType('practical')
            ->with(['subject', 'semester', 'practicalResource'])
            ->when($request->filled('practical_type'), fn ($q) => $q->whereHas('practicalResource', fn ($q) => $q->where('practical_type', $request->query('practical_type'))))
            ->latest('published_at')
            ->paginate($request->integer('per_page', 12))
            ->withQueryString();

        $practicalTypes = collect(PracticalType::cases())->map(fn ($t) => [
            'value' => $t->value,
            'label' => $t->label(),
        ]);

        return inertia('Practical/Index', [
            'resources' => $resources,
            'practicalTypes' => $practicalTypes,
            'filters' => $request->only(['practical_type']),
        ]);
    }

    public function show(Resource $resource)
    {
        abort_unless($resource->isPublished(), 404);

        $resource->load(['subject', 'semester', 'unit', 'topic', 'tags', 'practicalResource']);
        $resource->practicalResource?->makeHidden(['resource_path']);
        $resource->incrementViews();

        return inertia('Practical/Show', [
            'resource' => $resource,
        ]);
    }
}
