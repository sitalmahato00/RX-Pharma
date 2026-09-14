<?php

namespace App\Http\Controllers;

use App\Enums\LiteratureCategory;
use App\Models\Resource;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class LiteratureController extends Controller
{
    public function index(Request $request)
    {
        $request->validate([
            'category' => ['nullable', Rule::in(array_column(LiteratureCategory::cases(), 'value'))],
        ]);

        $resources = Resource::published()
            ->ofType('literature')
            ->with(['subject', 'semester', 'literature'])
            ->when($request->filled('category'), fn ($q) => $q->whereHas('literature', fn ($q) => $q->where('category', $request->query('category'))))
            ->latest('published_at')
            ->paginate($request->integer('per_page', 12))
            ->withQueryString();

        $categories = collect(LiteratureCategory::cases())->map(fn ($c) => [
            'value' => $c->value,
            'label' => $c->label(),
        ]);

        return inertia('Literature/Index', [
            'resources' => $resources,
            'categories' => $categories,
            'filters' => $request->only(['category']),
        ]);
    }

    public function show(Resource $resource)
    {
        abort_unless($resource->isPublished(), 404);

        $resource->load(['subject', 'semester', 'unit', 'topic', 'tags', 'literature']);
        $resource->literature?->makeHidden(['file_path']);
        $resource->incrementViews();

        return inertia('Literature/Show', [
            'resource' => $resource,
        ]);
    }
}
