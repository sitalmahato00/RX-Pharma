<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\Report;
use Illuminate\Http\Request;

class AdminReportController extends Controller
{
    public function index(Request $request)
    {
        $reports = Report::query()
            ->with(['user:id,name,email', 'reportable', 'handledBy:id,name'])
            ->when($request->filled('status'), fn ($q) => $q->where('status', $request->status))
            ->latest()
            ->paginate(15)
            ->withQueryString();

        return inertia('Admin/Report/Index', [
            'reports' => $reports,
            'filters' => $request->only(['status']),
            'statuses' => [
                ['value' => 'pending', 'label' => 'Pending'],
                ['value' => 'reviewed', 'label' => 'Reviewed'],
                ['value' => 'resolved', 'label' => 'Resolved'],
            ],
        ]);
    }

    public function resolve(Request $request, Report $report)
    {
        $data = $request->validate([
            'admin_notes' => ['nullable', 'string', 'max:2000'],
        ]);

        $report->update([
            'status' => 'resolved',
            'admin_notes' => $data['admin_notes'] ?? null,
            'handled_by' => $request->user()->id,
            'handled_at' => now(),
        ]);

        ActivityLog::record($request->user(), 'resolve', "Resolved report #{$report->id}", 'report', $report->id);

        return back();
    }
}