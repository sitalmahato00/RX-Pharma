<?php

namespace App\Http\Controllers;

use App\Models\College;
use App\Models\Program;
use Illuminate\Http\Request;

class CollegeController extends Controller
{
    public function index(Request $request)
    {
        $colleges = College::active()
            ->with('university')
            ->withCount(['resources' => fn ($q) => $q->published()])
            ->orderBy('name')
            ->paginate($request->integer('per_page', 12))
            ->withQueryString();

        return inertia('College/Index', [
            'colleges' => $colleges,
        ]);
    }

    public function show(College $college)
    {
        abort_unless($college->is_active, 404);

        $college->load('university');
        $college->loadCount(['resources' => fn ($q) => $q->published()]);

        $programs = Program::active()
            ->where('university_id', $college->university_id)
            ->withCount(['subjects', 'resources'])
            ->orderBy('name')
            ->get();

        return inertia('College/Show', [
            'college' => $college,
            'programs' => $programs,
        ]);
    }
}
