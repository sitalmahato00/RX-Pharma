<?php

namespace App\Http\Controllers;

use App\Models\Bookmark;
use App\Models\Quiz;
use App\Models\Resource;
use Illuminate\Http\Request;

class BookmarkController extends Controller
{
    public function index(Request $request)
    {
        $type = $request->query('type', 'all');

        $validTypes = ['all', 'note', 'video', 'literature', 'previous_paper', 'practical', 'quiz'];
        if (! in_array($type, $validTypes, true)) {
            $type = 'all';
        }

        $resourceTypes = ['note', 'video', 'literature', 'previous_paper', 'practical'];

        $bookmarks = Bookmark::where('user_id', auth()->id())
            ->whereIn('bookmarkable_type', [Resource::class, Quiz::class])
            ->with(['bookmarkable.subject', 'bookmarkable.unit', 'bookmarkable.topic'])
            ->when($type === 'quiz', fn ($query) => $query->where('bookmarkable_type', Quiz::class))
            ->when(in_array($type, $resourceTypes, true), fn ($query) => $query
                ->where('bookmarkable_type', Resource::class)
                ->whereHas('bookmarkable', fn ($query) => $query->ofType($type)))
            ->latest()
            ->get()
            ->filter(fn (Bookmark $bookmark) => $bookmark->bookmarkable !== null);

        $grouped = $bookmarks
            ->map(function (Bookmark $bookmark) {
                $bookmarkable = $bookmark->bookmarkable;

                return [
                    'id' => $bookmark->id,
                    'type' => $bookmarkable instanceof Quiz
                        ? 'quiz'
                        : ($bookmarkable instanceof Resource ? $bookmarkable->resource_type : 'other'),
                    'subject' => $bookmarkable->subject ?? null,
                    'resource' => $bookmarkable,
                    'created_at' => $bookmark->created_at?->toISOString(),
                ];
            })
            ->groupBy('type');

        $tabs = [
            ['key' => 'all', 'label' => 'All'],
            ['key' => 'note', 'label' => 'Notes'],
            ['key' => 'video', 'label' => 'Videos'],
            ['key' => 'literature', 'label' => 'Literature'],
            ['key' => 'previous_paper', 'label' => 'Previous Papers'],
            ['key' => 'practical', 'label' => 'Practical & Viva'],
            ['key' => 'quiz', 'label' => 'Quizzes'],
        ];

        return inertia('Student/Bookmarks', [
            'bookmarks' => $grouped,
            'tabs' => $tabs,
            'activeType' => $type,
        ]);
    }

    public function toggle(Request $request)
    {
        $data = $request->validate([
            'bookmarkable_type' => ['required', 'string'],
            'bookmarkable_id' => ['required', 'integer'],
        ]);

        $bookmark = Bookmark::where('user_id', auth()->id())
            ->where('bookmarkable_type', $data['bookmarkable_type'])
            ->where('bookmarkable_id', $data['bookmarkable_id'])
            ->first();

        if ($bookmark) {
            $bookmark->delete();

            if (str_ends_with($data['bookmarkable_type'], 'Resource')) {
                Resource::where('id', $data['bookmarkable_id'])->decrement('bookmarks_count');
            }

            return ['bookmarked' => false];
        }

        Bookmark::create([
            'user_id' => auth()->id(),
            'bookmarkable_type' => $data['bookmarkable_type'],
            'bookmarkable_id' => $data['bookmarkable_id'],
        ]);

        if (str_ends_with($data['bookmarkable_type'], 'Resource')) {
            Resource::where('id', $data['bookmarkable_id'])->increment('bookmarks_count');
        }

        return ['bookmarked' => true];
    }

    public function remove(Request $request)
    {
        $data = $request->validate([
            'id' => ['required', 'integer'],
        ]);

        Bookmark::where('user_id', auth()->id())
            ->where('id', $data['id'])
            ->delete();

        return back()->with('success', 'Bookmark removed.');
    }
}