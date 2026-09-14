<?php

namespace App\Http\Controllers;

use App\Models\Quiz;
use App\Models\Resource;
use App\Models\Subject;
use Illuminate\Http\Request;

class SearchController extends Controller
{
    public function index(Request $request)
    {
        $query = trim((string) $request->query('q', ''));

        if ($query === '') {
            return inertia('Search/Index', [
                'query' => '',
                'resources' => [],
                'subjects' => [],
                'quizzes' => [],
            ]);
        }

        $term = '%'.$query.'%';

        $resources = Resource::published()
            ->where(fn ($q) => $q->where('title', 'like', $term)->orWhere('description', 'like', $term))
            ->with(['subject', 'semester'])
            ->latest('published_at')
            ->paginate(12)
            ->withQueryString();

        $subjects = Subject::active()
            ->where(fn ($q) => $q->where('name', 'like', $term)->orWhere('code', 'like', $term))
            ->withCount(['resources' => fn ($q) => $q->published()])
            ->get();

        $quizzes = Quiz::published()
            ->where('title', 'like', $term)
            ->with('subject')
            ->get();

        return inertia('Search/Index', [
            'query' => $query,
            'resources' => $resources,
            'subjects' => $subjects,
            'quizzes' => $quizzes,
        ]);
    }
}
