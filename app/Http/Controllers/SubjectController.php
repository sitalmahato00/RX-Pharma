<?php

namespace App\Http\Controllers;

use App\Enums\ResourceType;
use App\Models\Program;
use App\Models\Semester;
use App\Models\Subject;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class SubjectController extends Controller
{
    public function index(Request $request)
    {
        $subjects = Subject::active()
            ->withCount([
                'resources' => fn ($q) => $q->published(),
                'units',
            ])
            ->when($request->filled('semester_id'), fn ($q) => $q->where('semester_id', $request->integer('semester_id')))
            ->when($request->filled('program_id'), fn ($q) => $q->where('program_id', $request->integer('program_id')))
            ->orderBy('name')
            ->paginate($request->integer('per_page', 12))
            ->withQueryString();

        $programs = Program::active()->orderBy('name')->get(['id', 'name', 'code']);
        $semesters = Semester::active()->orderBy('number')->get(['id', 'name', 'number']);

        return inertia('Subject/Index', [
            'subjects' => $subjects,
            'programs' => $programs,
            'semesters' => $semesters,
            'filters' => $request->only(['semester_id', 'program_id']),
        ]);
    }

    public function show(Subject $subject, Request $request)
    {
        abort_unless($subject->is_active, 404);

        $subject->loadCount(['resources' => fn ($q) => $q->published()]);

        $units = $subject->units()
            ->active()
            ->withCount(['topics'])
            ->orderBy('sort_order')
            ->get();

        $type = $request->query('type', 'note');
        $request->validate([
            'type' => ['nullable', Rule::in(array_column(ResourceType::cases(), 'value'))],
        ]);

        $resources = $subject->resources()
            ->published()
            ->ofType($type)
            ->with(['unit', 'topic'])
            ->latest('published_at')
            ->paginate(12)
            ->withQueryString();

        return inertia('Subject/Show', [
            'subject' => $subject,
            'units' => $units,
            'resources' => $resources,
            'type' => $type,
        ]);
    }
}
