<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class ContactController extends Controller
{
    public function show()
    {
        return inertia('Contact/Show');
    }

    public function about()
    {
        return inertia('Contact/About');
    }

    public function submit(Request $request)
    {
        $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255'],
            'message' => ['required', 'string', 'max:5000'],
        ]);

        return back()->with('success', 'Your message has been received. We will get back to you soon.');
    }
}
