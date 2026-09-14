<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\Program;
use App\Models\Semester;
use App\Models\Subject;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class AdminSemesterController extends Controller
{
    public function index(Request $request)
    {
        $semesters = Semester::query()
            ->with('program:id,name')
            ->when($request->filled('search'), fn ($q) => $q->where('name', 'like', "%{$request->search}%"))
            ->when($request->filled('program_id'), fn ($q) => $q->where('program_id', $request->integer('program_id')))
            ->latest()
            ->paginate(15)
            ->withQueryString();

        $programs = Program::active()->orderBy('name')->get(['id', 'name']);

        return inertia('Admin/Semester/Index', [
            'semesters' => $semesters,
            'programs' => $programs,
            'filters' => $request->only(['search', 'program_id']),
        ]);
    }

    public function create()
    {
        $programs = Program::active()->orderBy('name')->get(['id', 'name']);

        return inertia('Admin/Semester/Create', ['programs' => $programs]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'program_id' => ['required', 'exists:programs,id'],
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255', Rule::unique('semesters')],
            'number' => ['required', 'integer', 'min:1', 'max:12'],
            'is_active' => ['nullable', 'boolean'],
        ]);

        $data['slug'] = ($data['slug'] ?? '') ?: Str::slug($data['name']);
        $data['is_active'] = $request->boolean('is_active');

        $semester = Semester::create($data);

        ActivityLog::record($request->user(), 'create', "Created semester: {$semester->name}", 'semester', $semester->id);

        return redirect()->route('admin.semesters.index')->with('success', 'Semester created.');
    }

    public function edit(Semester $semester)
    {
        $programs = Program::active()->orderBy('name')->get(['id', 'name']);

        return inertia('Admin/Semester/Edit', ['semester' => $semester, 'programs' => $programs]);
    }

    public function update(Request $request, Semester $semester)
    {
        $data = $request->validate([
            'program_id' => ['required', 'exists:programs,id'],
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255', Rule::unique('semesters')->ignore($semester->id)],
            'number' => ['required', 'integer', 'min:1', 'max:12'],
            'is_active' => ['nullable', 'boolean'],
        ]);

        $data['slug'] = ($data['slug'] ?? '') ?: Str::slug($data['name']);
        $data['is_active'] = $request->boolean('is_active');

        $semester->update($data);

        ActivityLog::record($request->user(), 'update', "Updated semester: {$semester->name}", 'semester', $semester->id);

        return redirect()->route('admin.semesters.index')->with('success', 'Semester updated.');
    }

    public function destroy(Request $request, Semester $semester)
    {
        $name = $semester->name;
        $semester->delete();

        ActivityLog::record($request->user(), 'delete', "Deleted semester: {$name}", 'semester', $semester->id);

        return back();
    }

    public function subjects(Semester $semester)
    {
        return Subject::where('semester_id', $semester->id)->orderBy('name')->get(['id', 'name']);
    }
}