<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;

class AuthController extends Controller
{
    public function create()
    {
        return inertia('Auth/Login');
    }

    public function store(Request $request)
    {
        $credentials = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required'],
        ]);

        if (! Auth::attempt($credentials, $request->boolean('remember'))) {
            return back()->withErrors([
                'email' => 'The provided credentials do not match our records.',
            ])->onlyInput('email');
        }

        $user = Auth::user();

        if (! $user->is_active) {
            Auth::logout();

            return back()->withErrors([
                'email' => 'Your account has been deactivated. Please contact the administrator.',
            ]);
        }

        if (! $user->isStudent()) {
            Auth::logout();

            return back()->withErrors([
                'email' => 'Please use the admin login to access the admin panel.',
            ]);
        }

        $user->forceFill(['last_login_at' => now()])->save();

        $request->session()->regenerate();

        return redirect()->intended(route('student.dashboard'));
    }

    public function registerForm()
    {
        return inertia('Auth/Register', [
            'universities' => \App\Models\University::active()->orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function registerStore(Request $request)
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users'],
            'password' => ['required', 'confirmed', Password::min(8)],
            'phone' => ['nullable', 'string', 'max:20'],
            'university_id' => ['nullable', 'exists:universities,id'],
            'college_id' => ['nullable', 'exists:colleges,id'],
            'program_id' => ['nullable', 'exists:programs,id'],
            'semester_id' => ['nullable', 'exists:semesters,id'],
        ]);

        $user = User::create([
            ...$data,
            'role' => 'student',
            'is_active' => true,
            'email_verified_at' => now(),
        ]);

        Auth::login($user);

        $user->forceFill(['last_login_at' => now()])->save();

        $request->session()->regenerate();

        return redirect()->route('student.dashboard');
    }

    public function destroy(Request $request)
    {
        Auth::logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('home');
    }
}