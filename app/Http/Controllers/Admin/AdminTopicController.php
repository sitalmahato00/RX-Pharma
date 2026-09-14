<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\Topic;
use App\Models\Unit;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class AdminTopicController extends Controller
{
    public function index(Request $request)
    {
        $topics = Topic::query()
            ->with(['unit:id,name', 'unit.subject:id,name'])
            ->when($request->filled('search'), fn ($q) => $q->where('name', 'like', "%{$request->search}%"))
            ->when($request->filled('unit_id'), fn ($q) => $q->where('unit_id', $request->integer('unit_id')))
            ->latest()
            ->paginate(15)
            ->withQueryString();

        $units = Unit::active()->with('subject:id,name')->orderBy('name')->get(['id', 'name', 'subject_id']);

        return inertia('Admin/Topic/Index', [
            'topics' => $topics,
            'units' => $units,
            'filters' => $request->only(['search', 'unit_id']),
        ]);
    }

    public function create()
    {
        $units = Unit::active()->with('subject:id,name')->orderBy('name')->get(['id', 'name', 'subject_id']);

        return inertia('Admin/Topic/Create', ['units' => $units]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'unit_id' => ['required', 'exists:units,id'],
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255', Rule::unique('topics')],
            'description' => ['nullable', 'string'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
            'is_active' => ['nullable', 'boolean'],
        ]);

        $data['slug'] = ($data['slug'] ?? '') ?: Str::slug($data['name']);
        $data['is_active'] = $request->boolean('is_active');

        $topic = Topic::create($data);

        ActivityLog::record($request->user(), 'create', "Created topic: {$topic->name}", 'topic', $topic->id);

        return redirect()->route('admin.topics.index')->with('success', 'Topic created.');
    }

    public function edit(Topic $topic)
    {
        $units = Unit::active()->with('subject:id,name')->orderBy('name')->get(['id', 'name', 'subject_id']);

        return inertia('Admin/Topic/Edit', ['topic' => $topic, 'units' => $units]);
    }

    public function update(Request $request, Topic $topic)
    {
        $data = $request->validate([
            'unit_id' => ['required', 'exists:units,id'],
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255', Rule::unique('topics')->ignore($topic->id)],
            'description' => ['nullable', 'string'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
            'is_active' => ['nullable', 'boolean'],
        ]);

        $data['slug'] = ($data['slug'] ?? '') ?: Str::slug($data['name']);
        $data['is_active'] = $request->boolean('is_active');

        $topic->update($data);

        ActivityLog::record($request->user(), 'update', "Updated topic: {$topic->name}", 'topic', $topic->id);

        return redirect()->route('admin.topics.index')->with('success', 'Topic updated.');
    }

    public function destroy(Request $request, Topic $topic)
    {
        $name = $topic->name;
        $topic->delete();

        ActivityLog::record($request->user(), 'delete', "Deleted topic: {$name}", 'topic', $topic->id);

        return back();
    }
}