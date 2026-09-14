<?php

namespace App\Http\Controllers;

use App\Models\University;
use Illuminate\Http\Request;

class UniversityController extends Controller
{
    public function index(Request $request)
    {
        $universities = University::active()
            ->withCount(['colleges' => fn ($q) => $q->active()])
            ->orderBy('name')
            ->paginate($request->integer('per_page', 12))
            ->withQueryString();

        return inertia('University/Index', [
            'universities' => $universities,
        ]);
    }

    public function show(University $university)
    {
        abort_unless($university->is_active, 404);

        $university->loadCount(['colleges' => fn ($q) => $q->active()]);

        $colleges = $university->colleges()
            ->active()
            ->withCount(['resources' => fn ($q) => $q->published()])
            ->orderBy('name')
            ->paginate(12)
            ->withQueryString();

        return inertia('University/Show', [
            'university' => $university,
            'colleges' => $colleges,
        ]);
    }
}
