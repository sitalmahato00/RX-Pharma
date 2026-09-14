<?php

namespace App\Http\Middleware;

use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Middleware;
use Tighten\Ziggy\Ziggy;

class HandleInertiaRequests extends Middleware
{
    protected $rootView = 'app';

    public function share(Request $request): array
    {
        return array_merge(parent::share($request), [
            'app' => [
                'name' => config('app.name'),
                'tagline' => Setting::get('tagline', 'Learn • Practice • Succeed'),
                'logo' => Setting::get('logo') ? Storage::disk('public')->url(Setting::get('logo')) : null,
            ],
            'auth' => [
                'user' => $request->user() ? [
                    'id' => $request->user()->id,
                    'name' => $request->user()->name,
                    'email' => $request->user()->email,
                    'phone' => $request->user()->phone,
                    'role' => $request->user()->role,
                    'avatar' => $request->user()->avatar_url,
                    'university' => $request->user()->university?->name,
                    'college' => $request->user()->college?->name,
                    'program' => $request->user()->program?->name,
                    'semester' => $request->user()->semester?->name,
                ] : null,
                'notifications' => $request->user()?->notifications()->latest()->take(8)->get()->map(fn ($n) => [
                    'id' => $n->id,
                    'title' => $n->title,
                    'body' => $n->body,
                    'link' => $n->link,
                    'read_at' => $n->read_at,
                    'created_at' => $n->created_at->diffForHumans(),
                ]),
                'unread_count' => $request->user()?->notifications()->whereNull('read_at')->count() ?? 0,
            ],
            'flash' => [
                'success' => session('success'),
                'error' => session('error'),
                'warning' => session('warning'),
            ],
            'appUrl' => url('/'),
            'ziggy' => fn () => \Illuminate\Support\Facades\App::runningUnitTests() ? null : new Ziggy,
        ]);
    }
}