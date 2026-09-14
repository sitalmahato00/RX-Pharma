<?php

namespace App\Http\Controllers;

use App\Models\Bookmark;
use App\Models\College;
use App\Models\Discussion;
use App\Models\Program;
use App\Models\Progress;
use App\Models\QuizAttempt;
use App\Models\Semester;
use App\Models\University;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;

class ProfileController extends Controller
{
    public function show()
    {
        $user = auth()->user()->load(['university', 'college', 'program', 'semester']);

        $stats = [
            'bookmarks' => Bookmark::where('user_id', $user->id)->count(),
            'completed_resources' => Progress::where('user_id', $user->id)->where('status', 'completed')->count(),
            'quiz_attempts' => QuizAttempt::where('user_id', $user->id)->count(),
            'average_score' => (int) round(QuizAttempt::where('user_id', $user->id)->avg('score_percentage') ?? 0),
            'discussions' => Discussion::where('user_id', $user->id)->count(),
        ];

        return inertia('Student/Profile', [
            'user' => $user,
            'stats' => $stats,
        ]);
    }

    public function settings()
    {
        $user = auth()->user()->load(['university', 'college', 'program', 'semester']);

        return inertia('Student/Settings', [
            'user' => $user,
            'universities' => University::active()->orderBy('name')->get(['id', 'name']),
            'colleges' => College::active()->orderBy('name')->get(['id', 'name', 'university_id']),
            'programs' => Program::active()->orderBy('name')->get(['id', 'name', 'university_id']),
            'semesters' => Semester::active()->orderBy('number')->get(['id', 'name', 'number', 'program_id']),
        ]);
    }

    public function update(Request $request)
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'phone' => ['nullable', 'string', 'max:20'],
            'bio' => ['nullable', 'string', 'max:1000'],
            'university_id' => ['nullable', Rule::exists('universities', 'id')],
            'college_id' => ['nullable', Rule::exists('colleges', 'id')],
            'program_id' => ['nullable', Rule::exists('programs', 'id')],
            'semester_id' => ['nullable', Rule::exists('semesters', 'id')],
        ]);

        auth()->user()->update($data);

        return back()->with('success', 'Profile updated.');
    }

    public function updatePassword(Request $request)
    {
        $user = auth()->user();

        $data = $request->validate([
            'current_password' => ['required', function ($attribute, $value, $fail) use ($user) {
                if (! Hash::check($value, $user->password)) {
                    $fail('The current password is incorrect.');
                }
            }],
            'password' => ['required', 'confirmed', Password::min(8)],
        ]);

        $user->update(['password' => $data['password']]);

        if ($request->boolean('logout_other_sessions')) {
            Auth::logoutOtherDevices($data['password']);
        }

        return back()->with('success', 'Password updated.');
    }
}