<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\Setting;
use Illuminate\Http\Request;

class AdminSettingController extends Controller
{
    public function edit()
    {
        $defaults = [
            'site_name' => 'RX Pharma',
            'site_tagline' => 'Pharmacy Education Platform',
            'support_email' => 'support@rxpharma.test',
            'contact_email' => 'contact@rxpharma.test',
            'primary_color' => '#2563EB',
            'max_file_size_mb' => 50,
            'allow_registration' => true,
            'maintenance_mode' => false,
            'analytics_id' => '',
            'footer_text' => '',
            'meta_description' => 'Learn Pharmacy for free.',
        ];

        $stored = Setting::all()->pluck('value', 'key');

        foreach ($defaults as $key => $value) {
            if (isset($stored[$key])) {
                $decoded = json_decode($stored[$key], true);
                $defaults[$key] = ($decoded === null && $stored[$key] !== 'null') ? $stored[$key] : $decoded;
            }
        }

        return inertia('Admin/Setting/Edit', ['settings' => $defaults]);
    }

    public function update(Request $request)
    {
        $rules = [
            'site_name' => ['nullable', 'string', 'max:255'],
            'site_tagline' => ['nullable', 'string', 'max:255'],
            'support_email' => ['nullable', 'email', 'max:255'],
            'contact_email' => ['nullable', 'email', 'max:255'],
            'primary_color' => ['nullable', 'string', 'max:20'],
            'max_file_size_mb' => ['nullable', 'integer', 'min:1', 'max:10240'],
            'allow_registration' => ['nullable', 'boolean'],
            'maintenance_mode' => ['nullable', 'boolean'],
            'analytics_id' => ['nullable', 'string', 'max:255'],
            'footer_text' => ['nullable', 'string', 'max:2000'],
            'meta_description' => ['nullable', 'string', 'max:500'],
        ];

        $data = $request->validate($rules);

        foreach ($data as $key => $value) {
            Setting::set($key, $value);
        }

        ActivityLog::record($request->user(), 'update', 'Updated site settings');

        return back()->with('success', 'Settings updated.');
    }
}