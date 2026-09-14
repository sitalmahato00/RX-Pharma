<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\Semester;
use App\Models\Subject;
use App\Models\Unit;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class AdminSubjectController extends Controller
{
    public function index(Request $request)
    {
        $subjects = Subject::query()
            ->with(['semester:id,name,number', 'program:id,name'])
            ->when($request->filled('search'), fn ($q) => $q->where('name', 'like', "%{$request->search}%"))
            ->when($request->filled('semester_id'), fn ($q) => $q->where('semester_id', $request->integer('semester_id')))
            ->latest()
            ->paginate(15)
            ->withQueryString();

        $semesters = Semester::active()->orderBy('number')->get(['id', 'name', 'number']);

        return inertia('Admin/Subject/Index', [
            'subjects' => $subjects,
            'semesters' => $semesters,
            'filters' => $request->only(['search', 'semester_id']),
        ]);
    }

    public function create()
    {
        $semesters = Semester::active()->orderBy('number')->get(['id', 'name', 'number']);

        return inertia('Admin/Subject/Create', ['semesters' => $semesters]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'semester_id' => ['nullable', 'exists:semesters,id'],
            'program_id' => ['nullable', 'exists:programs,id'],
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255', Rule::unique('subjects')],
            'code' => ['nullable', 'string', 'max:50'],
            'description' => ['nullable', 'string'],
            'color' => ['nullable', 'string', 'max:20'],
            'is_active' => ['nullable', 'boolean'],
        ]);

        $data['slug'] = ($data['slug'] ?? '') ?: Str::slug($data['name']);
        $data['is_active'] = $request->boolean('is_active');

        $subject = Subject::create($data);

        ActivityLog::record($request->user(), 'create', "Created subject: {$subject->name}", 'subject', $subject->id);

        return redirect()->route('admin.subjects.index')->with('success', 'Subject created.');
    }

    public function edit(Subject $subject)
    {
        $semesters = Semester::active()->orderBy('number')->get(['id', 'name', 'number']);

        return inertia('Admin/Subject/Edit', ['subject' => $subject, 'semesters' => $semesters]);
    }

    public function update(Request $request, Subject $subject)
    {
        $data = $request->validate([
            'semester_id' => ['nullable', 'exists:semesters,id'],
            'program_id' => ['nullable', 'exists:programs,id'],
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255', Rule::unique('subjects')->ignore($subject->id)],
            'code' => ['nullable', 'string', 'max:50'],
            'description' => ['nullable', 'string'],
            'color' => ['nullable', 'string', 'max:20'],
            'is_active' => ['nullable', 'boolean'],
        ]);

        $data['slug'] = ($data['slug'] ?? '') ?: Str::slug($data['name']);
        $data['is_active'] = $request->boolean('is_active');

        $subject->update($data);

        ActivityLog::record($request->user(), 'update', "Updated subject: {$subject->name}", 'subject', $subject->id);

        return redirect()->route('admin.subjects.index')->with('success', 'Subject updated.');
    }

    public function destroy(Request $request, Subject $subject)
    {
        $name = $subject->name;
        $subject->delete();

        ActivityLog::record($request->user(), 'delete', "Deleted subject: {$name}", 'subject', $subject->id);

        return back();
    }

    public function toggle(Request $request, Subject $subject)
    {
        $subject->update(['is_active' => ! $subject->is_active]);

        ActivityLog::record($request->user(), 'toggle', "Updated subject status: {$subject->name}", 'subject', $subject->id);

        return back();
    }

    public function units(Subject $subject)
    {
        return Unit::where('subject_id', $subject->id)->orderBy('sort_order')->get(['id', 'name']);
    }
}