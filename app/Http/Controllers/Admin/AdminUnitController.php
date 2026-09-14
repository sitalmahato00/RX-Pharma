<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\Subject;
use App\Models\Topic;
use App\Models\Unit;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class AdminUnitController extends Controller
{
    public function index(Request $request)
    {
        $units = Unit::query()
            ->with('subject:id,name')
            ->when($request->filled('search'), fn ($q) => $q->where('name', 'like', "%{$request->search}%"))
            ->when($request->filled('subject_id'), fn ($q) => $q->where('subject_id', $request->integer('subject_id')))
            ->latest()
            ->paginate(15)
            ->withQueryString();

        $subjects = Subject::active()->orderBy('name')->get(['id', 'name']);

        return inertia('Admin/Unit/Index', [
            'units' => $units,
            'subjects' => $subjects,
            'filters' => $request->only(['search', 'subject_id']),
        ]);
    }

    public function create()
    {
        $subjects = Subject::active()->orderBy('name')->get(['id', 'name']);

        return inertia('Admin/Unit/Create', ['subjects' => $subjects]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'subject_id' => ['required', 'exists:subjects,id'],
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255', Rule::unique('units')],
            'description' => ['nullable', 'string'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
            'is_active' => ['nullable', 'boolean'],
        ]);

        $data['slug'] = ($data['slug'] ?? '') ?: Str::slug($data['name']);
        $data['is_active'] = $request->boolean('is_active');

        $unit = Unit::create($data);

        ActivityLog::record($request->user(), 'create', "Created unit: {$unit->name}", 'unit', $unit->id);

        return redirect()->route('admin.units.index')->with('success', 'Unit created.');
    }

    public function edit(Unit $unit)
    {
        $subjects = Subject::active()->orderBy('name')->get(['id', 'name']);

        return inertia('Admin/Unit/Edit', ['unit' => $unit, 'subjects' => $subjects]);
    }

    public function update(Request $request, Unit $unit)
    {
        $data = $request->validate([
            'subject_id' => ['required', 'exists:subjects,id'],
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255', Rule::unique('units')->ignore($unit->id)],
            'description' => ['nullable', 'string'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
            'is_active' => ['nullable', 'boolean'],
        ]);

        $data['slug'] = ($data['slug'] ?? '') ?: Str::slug($data['name']);
        $data['is_active'] = $request->boolean('is_active');

        $unit->update($data);

        ActivityLog::record($request->user(), 'update', "Updated unit: {$unit->name}", 'unit', $unit->id);

        return redirect()->route('admin.units.index')->with('success', 'Unit updated.');
    }

    public function destroy(Request $request, Unit $unit)
    {
        $name = $unit->name;
        $unit->delete();

        ActivityLog::record($request->user(), 'delete', "Deleted unit: {$name}", 'unit', $unit->id);

        return back();
    }

    public function topics(Unit $unit)
    {
        return Topic::where('unit_id', $unit->id)->orderBy('sort_order')->get(['id', 'name']);
    }
}