<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth as AuthFacade;

class AdminAuthController extends Controller
{
    public function create()
    {
        return inertia('Admin/Auth/Login');
    }

    public function store(Request $request)
    {
        $credentials = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required'],
        ]);

        if (! AuthFacade::attempt($credentials, $request->boolean('remember'))) {
            return back()->withErrors([
                'email' => 'The provided credentials do not match our records.',
            ])->onlyInput('email');
        }

        $user = AuthFacade::user();

        if (! $user->isAdmin()) {
            AuthFacade::logout();

            return back()->withErrors([
                'email' => 'This account does not have admin access.',
            ]);
        }

        if (! $user->is_active) {
            AuthFacade::logout();

            return back()->withErrors([
                'email' => 'Your account has been deactivated.',
            ]);
        }

        $user->forceFill(['last_login_at' => now()])->save();

        $request->session()->regenerate();

        return redirect()->intended(route('admin.dashboard'));
    }
}