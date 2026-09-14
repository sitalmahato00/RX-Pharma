<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\Media;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class AdminMediaController extends Controller
{
    public function index(Request $request)
    {
        $media = Media::query()
            ->with('user:id,name')
            ->when($request->filled('collection'), fn ($q) => $q->where('collection', $request->collection))
            ->when($request->filled('search'), fn ($q) => $q->where('name', 'like', "%{$request->search}%")
                ->orWhere('original_name', 'like', "%{$request->search}%"))
            ->latest()
            ->paginate(15)
            ->withQueryString();

        $collections = Media::select('collection')->distinct()->pluck('collection');

        return inertia('Admin/Media/Index', [
            'media' => $media,
            'collections' => $collections,
            'filters' => $request->only(['collection', 'search']),
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'file' => ['required', 'file', 'mimes:jpg,jpeg,png,webp,gif,svg,pdf,mp4,webm,mov', 'max:102400'],
            'collection' => ['nullable', 'string', 'max:100'],
            'name' => ['nullable', 'string', 'max:255'],
        ]);

        $file = $request->file('file');
        $path = $file->store('media', 'public');

        $media = Media::create([
            'user_id' => $request->user()->id,
            'name' => $data['name'] ?? pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME),
            'original_name' => $file->getClientOriginalName(),
            'path' => $path,
            'disk' => 'public',
            'mime_type' => $file->getMimeType(),
            'extension' => $file->getClientOriginalExtension(),
            'size' => $file->getSize(),
            'collection' => $data['collection'] ?? 'general',
        ]);

        ActivityLog::record($request->user(), 'create', "Uploaded media: {$media->name}", 'media', $media->id);

        return back()->with('success', 'Media uploaded.');
    }

    public function destroy(Request $request, Media $media)
    {
        $name = $media->name;

        if ($media->disk && $media->path) {
            Storage::disk($media->disk)->delete($media->path);
        }

        $media->delete();

        ActivityLog::record($request->user(), 'delete', "Deleted media: {$name}", 'media', $media->id);

        return back();
    }
}