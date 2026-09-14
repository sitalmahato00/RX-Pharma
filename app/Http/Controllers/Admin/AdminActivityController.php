<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use Illuminate\Http\Request;

class AdminActivityController extends Controller
{
    public function index(Request $request)
    {
        $activities = ActivityLog::query()
            ->with('user:id,name,email')
            ->when($request->filled('search'), function ($q) use ($request) {
                $search = $request->search;
                $q->where(function ($q) use ($search) {
                    $q->where('action', 'like', "%{$search}%")
                        ->orWhere('description', 'like', "%{$search}%")
                        ->orWhere('resource_type', 'like', "%{$search}%");
                });
            })
            ->when($request->filled('action'), fn ($q) => $q->where('action', $request->action))
            ->latest()
            ->paginate(15)
            ->withQueryString();

        $actions = ActivityLog::select('action')->distinct()->pluck('action');

        return inertia('Admin/Activity/Index', [
            'activities' => $activities,
            'actions' => $actions,
            'filters' => $request->only(['search', 'action']),
        ]);
    }
}