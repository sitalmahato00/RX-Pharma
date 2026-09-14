<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\College;
use App\Models\University;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class AdminCollegeController extends Controller
{
    public function index(Request $request)
    {
        $colleges = College::query()
            ->with('university:id,name')
            ->when($request->filled('search'), fn ($q) => $q->where('name', 'like', "%{$request->search}%"))
            ->when($request->filled('university_id'), fn ($q) => $q->where('university_id', $request->integer('university_id')))
            ->latest()
            ->paginate(15)
            ->withQueryString();

        $universities = University::active()->orderBy('name')->get(['id', 'name']);

        return inertia('Admin/College/Index', [
            'colleges' => $colleges,
            'universities' => $universities,
            'filters' => $request->only(['search', 'university_id']),
        ]);
    }

    public function create()
    {
        $universities = University::active()->orderBy('name')->get(['id', 'name']);

        return inertia('Admin/College/Create', ['universities' => $universities]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'university_id' => ['required', 'exists:universities,id'],
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255', Rule::unique('colleges')],
            'location' => ['nullable', 'string', 'max:255'],
            'address' => ['nullable', 'string'],
            'description' => ['nullable', 'string'],
            'website' => ['nullable', 'url', 'max:255'],
            'is_active' => ['nullable', 'boolean'],
        ]);

        $data['slug'] = ($data['slug'] ?? '') ?: Str::slug($data['name']);
        $data['is_active'] = $request->boolean('is_active');

        $college = College::create($data);

        ActivityLog::record($request->user(), 'create', "Created college: {$college->name}", 'college', $college->id);

        return redirect()->route('admin.colleges.index')->with('success', 'College created.');
    }

    public function edit(College $college)
    {
        $universities = University::active()->orderBy('name')->get(['id', 'name']);

        return inertia('Admin/College/Edit', ['college' => $college, 'universities' => $universities]);
    }

    public function update(Request $request, College $college)
    {
        $data = $request->validate([
            'university_id' => ['required', 'exists:universities,id'],
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255', Rule::unique('colleges')->ignore($college->id)],
            'location' => ['nullable', 'string', 'max:255'],
            'address' => ['nullable', 'string'],
            'description' => ['nullable', 'string'],
            'website' => ['nullable', 'url', 'max:255'],
            'is_active' => ['nullable', 'boolean'],
        ]);

        $data['slug'] = ($data['slug'] ?? '') ?: Str::slug($data['name']);
        $data['is_active'] = $request->boolean('is_active');

        $college->update($data);

        ActivityLog::record($request->user(), 'update', "Updated college: {$college->name}", 'college', $college->id);

        return redirect()->route('admin.colleges.index')->with('success', 'College updated.');
    }

    public function destroy(Request $request, College $college)
    {
        $name = $college->name;
        $college->delete();

        ActivityLog::record($request->user(), 'delete', "Deleted college: {$name}", 'college', $college->id);

        return back();
    }

    public function toggle(Request $request, College $college)
    {
        $college->update(['is_active' => ! $college->is_active]);

        ActivityLog::record($request->user(), 'toggle', "Updated college status: {$college->name}", 'college', $college->id);

        return back();
    }
}