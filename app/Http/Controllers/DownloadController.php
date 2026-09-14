<?php

namespace App\Http\Controllers;

use App\Models\DownloadLog;
use App\Models\Resource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class DownloadController extends Controller
{
    private const DISK = 'public';

    public function stream(Resource $resource)
    {
        $resource->loadMissing($this->relationsFor($resource->resource_type));

        // URL-hosted videos have no local file, redirect to the source.
        if ($resource->resource_type === 'video' && $resource->video?->video_type !== 'upload') {
            return redirect()->away($resource->video->video_url);
        }

        $path = $this->resolvePath($resource);

        if (! $path || ! Storage::disk(self::DISK)->exists($path)) {
            abort(404);
        }

        return Storage::disk(self::DISK)->response(
            $path,
            $this->resolveName($resource, $path),
            [],
            'inline'
        );
    }

    public function download(Resource $resource, Request $request)
    {
        $resource->loadMissing($this->relationsFor($resource->resource_type));

        $path = $this->resolvePath($resource);

        if (! $path) {
            abort(404);
        }

        $this->logDownload($resource, $request);
        $resource->increment('downloads_count');

        // URL-hosted videos have no local file, redirect to the source.
        if ($resource->resource_type === 'video' && $resource->video?->video_type !== 'upload') {
            return redirect()->away($resource->video->video_url);
        }

        if (! Storage::disk(self::DISK)->exists($path)) {
            abort(404);
        }

        return Storage::disk(self::DISK)->download($path, $this->resolveName($resource, $path));
    }

    public function increment(Resource $resource, Request $request)
    {
        abort_if(! $resource->isPublished(), 404);

        $resource->increment('downloads_count');
        $this->logDownload($resource, $request);

        return response()->json(['downloads_count' => $resource->downloads_count]);
    }

    /**
     * Map a resource to the storage path of its downloadable file.
     *
     * Never exposes the resolved path to the client; the caller returns it
     * through the streams' Content-Disposition header only.
     */
    private function resolvePath(Resource $resource): ?string
    {
        return match ($resource->resource_type) {
            'note' => $resource->note?->file_path,
            'video' => $resource->video?->video_type === 'upload'
                ? $resource->video?->video_path
                : $resource->video?->video_url,
            'literature' => $resource->literature?->file_path,
            'previous_paper' => $resource->previousPaper?->file_path,
            'practical' => $resource->practicalResource?->resource_path,
            default => null,
        };
    }

    private function resolveName(Resource $resource, string $path): string
    {
        foreach (['note', 'literature', 'previousPaper'] as $relation) {
            $model = $resource->{$relation};

            if ($model && $model->file_name) {
                return $model->file_name;
            }
        }

        return basename($path);
    }

    private function relationsFor(string $resourceType): array
    {
        return match ($resourceType) {
            'note' => ['note'],
            'video' => ['video'],
            'literature' => ['literature'],
            'previous_paper' => ['previousPaper'],
            'practical' => ['practicalResource'],
            default => [],
        };
    }

    private function logDownload(Resource $resource, Request $request): void
    {
        DownloadLog::create([
            'user_id' => auth()->id(),
            'resource_id' => $resource->id,
            'ip' => $request->ip(),
            'user_agent' => mb_substr((string) $request->userAgent(), 0, 255),
            'downloaded_at' => now(),
        ]);
    }
}
