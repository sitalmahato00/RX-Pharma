<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\College;
use App\Models\Program;
use App\Models\University;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class AdminUniversityController extends Controller
{
    public function index(Request $request)
    {
        $universities = University::query()
            ->withCount('colleges')
            ->when($request->filled('search'), fn ($q) => $q->where('name', 'like', "%{$request->search}%"))
            ->latest()
            ->paginate(15)
            ->withQueryString();

        return inertia('Admin/University/Index', [
            'universities' => $universities,
            'filters' => $request->only(['search']),
        ]);
    }

    public function create()
    {
        return inertia('Admin/University/Create');
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255', Rule::unique('universities')],
            'code' => ['nullable', 'string', 'max:50'],
            'acronym' => ['nullable', 'string', 'max:50'],
            'location' => ['nullable', 'string', 'max:255'],
            'website' => ['nullable', 'url', 'max:255'],
            'description' => ['nullable', 'string'],
            'is_active' => ['nullable', 'boolean'],
        ]);

        $data['slug'] = ($data['slug'] ?? '') ?: Str::slug($data['name']);
        $data['is_active'] = $request->boolean('is_active');

        $university = University::create($data);

        ActivityLog::record($request->user(), 'create', "Created university: {$university->name}", 'university', $university->id);

        return redirect()->route('admin.universities.index')->with('success', 'University created.');
    }

    public function edit(University $university)
    {
        return inertia('Admin/University/Edit', ['university' => $university]);
    }

    public function update(Request $request, University $university)
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255', Rule::unique('universities')->ignore($university->id)],
            'code' => ['nullable', 'string', 'max:50'],
            'acronym' => ['nullable', 'string', 'max:50'],
            'location' => ['nullable', 'string', 'max:255'],
            'website' => ['nullable', 'url', 'max:255'],
            'description' => ['nullable', 'string'],
            'is_active' => ['nullable', 'boolean'],
        ]);

        $data['slug'] = ($data['slug'] ?? '') ?: Str::slug($data['name']);
        $data['is_active'] = $request->boolean('is_active');

        $university->update($data);

        ActivityLog::record($request->user(), 'update', "Updated university: {$university->name}", 'university', $university->id);

        return redirect()->route('admin.universities.index')->with('success', 'University updated.');
    }

    public function destroy(Request $request, University $university)
    {
        $name = $university->name;
        $university->delete();

        ActivityLog::record($request->user(), 'delete', "Deleted university: {$name}", 'university', $university->id);

        return back();
    }

    public function toggle(Request $request, University $university)
    {
        $university->update(['is_active' => ! $university->is_active]);

        ActivityLog::record($request->user(), 'toggle', "Updated university status: {$university->name}", 'university', $university->id);

        return back();
    }

    public function colleges(University $university)
    {
        return College::where('university_id', $university->id)->orderBy('name')->get(['id', 'name']);
    }

    public function programs(University $university)
    {
        return Program::where('university_id', $university->id)->orderBy('name')->get(['id', 'name']);
    }
}