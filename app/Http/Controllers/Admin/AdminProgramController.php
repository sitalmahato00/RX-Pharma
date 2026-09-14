<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\Program;
use App\Models\Semester;
use App\Models\University;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class AdminProgramController extends Controller
{
    public function index(Request $request)
    {
        $programs = Program::query()
            ->with('university:id,name')
            ->when($request->filled('search'), fn ($q) => $q->where('name', 'like', "%{$request->search}%"))
            ->when($request->filled('university_id'), fn ($q) => $q->where('university_id', $request->integer('university_id')))
            ->latest()
            ->paginate(15)
            ->withQueryString();

        $universities = University::active()->orderBy('name')->get(['id', 'name']);

        return inertia('Admin/Program/Index', [
            'programs' => $programs,
            'universities' => $universities,
            'filters' => $request->only(['search', 'university_id']),
        ]);
    }

    public function create()
    {
        $universities = University::active()->orderBy('name')->get(['id', 'name']);

        return inertia('Admin/Program/Create', ['universities' => $universities]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'university_id' => ['nullable', 'exists:universities,id'],
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255', Rule::unique('programs')],
            'code' => ['nullable', 'string', 'max:50'],
            'level' => ['nullable', 'string', 'max:100'],
            'duration_years' => ['nullable', 'integer', 'min:1', 'max:10'],
            'description' => ['nullable', 'string'],
            'is_active' => ['nullable', 'boolean'],
        ]);

        $data['slug'] = ($data['slug'] ?? '') ?: Str::slug($data['name']);
        $data['is_active'] = $request->boolean('is_active');

        $program = Program::create($data);

        ActivityLog::record($request->user(), 'create', "Created program: {$program->name}", 'program', $program->id);

        return redirect()->route('admin.programs.index')->with('success', 'Program created.');
    }

    public function edit(Program $program)
    {
        $universities = University::active()->orderBy('name')->get(['id', 'name']);

        return inertia('Admin/Program/Edit', ['program' => $program, 'universities' => $universities]);
    }

    public function update(Request $request, Program $program)
    {
        $data = $request->validate([
            'university_id' => ['nullable', 'exists:universities,id'],
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255', Rule::unique('programs')->ignore($program->id)],
            'code' => ['nullable', 'string', 'max:50'],
            'level' => ['nullable', 'string', 'max:100'],
            'duration_years' => ['nullable', 'integer', 'min:1', 'max:10'],
            'description' => ['nullable', 'string'],
            'is_active' => ['nullable', 'boolean'],
        ]);

        $data['slug'] = ($data['slug'] ?? '') ?: Str::slug($data['name']);
        $data['is_active'] = $request->boolean('is_active');

        $program->update($data);

        ActivityLog::record($request->user(), 'update', "Updated program: {$program->name}", 'program', $program->id);

        return redirect()->route('admin.programs.index')->with('success', 'Program updated.');
    }

    public function destroy(Request $request, Program $program)
    {
        $name = $program->name;
        $program->delete();

        ActivityLog::record($request->user(), 'delete', "Deleted program: {$name}", 'program', $program->id);

        return back();
    }

    public function toggle(Request $request, Program $program)
    {
        $program->update(['is_active' => ! $program->is_active]);

        ActivityLog::record($request->user(), 'toggle', "Updated program status: {$program->name}", 'program', $program->id);

        return back();
    }

    public function semesters(Program $program)
    {
        return Semester::where('program_id', $program->id)->orderBy('number')->get(['id', 'name', 'number']);
    }
}