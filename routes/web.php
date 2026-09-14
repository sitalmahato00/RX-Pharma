<?php

use App\Http\Controllers\Admin\{
    AdminAnalyticsController,
    AdminAttemptController,
    AdminCollegeController,
    AdminDashboardController,
    AdminDiscussionController,
    AdminLiteratureController,
    AdminMediaController,
    AdminNoteController,
    AdminPaperController,
    AdminPracticalController,
    AdminProgramController,
    AdminQuizController,
    AdminReportController,
    AdminSemesterController,
    AdminSettingController,
    AdminSubjectController,
    AdminTopicController,
    AdminUnitController,
    AdminUniversityController,
    AdminUserController,
    AdminVideoController,
    AdminActivityController,
};
use App\Http\Controllers\Auth\{
    AdminAuthController,
    AuthController,
    PasswordController,
};
use App\Http\Controllers\{
    BookmarkController,
    CollegeController,
    ContactController,
    DiscussionController,
    DownloadController,
    HomeController,
    LearningController,
    LiteratureController,
    NoteController,
    NotificationController,
    PracticalController,
    PreviousPaperController,
    ProfileController,
    ProgressController,
    QuizAttemptController,
    QuizController,
    SearchController,
    StudentDashboardController,
    SubjectController,
    UniversityController,
    VideoController,
};
use Illuminate\Support\Facades\Route;

Route::get('/', [HomeController::class, 'index'])->name('home');

// ---------- Public resource browsing ----------
Route::get('/universities', [UniversityController::class, 'index'])->name('universities.index');
Route::get('/universities/{university:slug}', [UniversityController::class, 'show'])->name('universities.show');

Route::get('/colleges', [CollegeController::class, 'index'])->name('colleges.index');
Route::get('/colleges/{college:slug}', [CollegeController::class, 'show'])->name('colleges.show');

Route::get('/subjects', [SubjectController::class, 'index'])->name('subjects.index');
Route::get('/subjects/{subject:slug}', [SubjectController::class, 'show'])->name('subjects.show');

Route::get('/notes', [NoteController::class, 'index'])->name('notes.index');
Route::get('/notes/{resource:slug}', [NoteController::class, 'show'])->name('notes.show');

Route::get('/videos', [VideoController::class, 'index'])->name('videos.index');
Route::get('/videos/{resource:slug}', [VideoController::class, 'show'])->name('videos.show');

Route::get('/literature', [LiteratureController::class, 'index'])->name('literature.index');
Route::get('/literature/{resource:slug}', [LiteratureController::class, 'show'])->name('literature.show');

Route::get('/previous-papers', [PreviousPaperController::class, 'index'])->name('previous-papers.index');
Route::get('/previous-papers/{resource:slug}', [PreviousPaperController::class, 'show'])->name('previous-papers.show');

Route::get('/practical-viva', [PracticalController::class, 'index'])->name('practical.index');
Route::get('/practical-viva/{resource:slug}', [PracticalController::class, 'show'])->name('practical.show');

Route::get('/quizzes', [QuizController::class, 'index'])->name('quizzes.index');
Route::get('/quizzes/{quiz:slug}', [QuizController::class, 'show'])->name('quizzes.show');

Route::get('/search', [SearchController::class, 'index'])->name('search.index');

Route::get('/about', [ContactController::class, 'about'])->name('about');
Route::get('/contact', [ContactController::class, 'show'])->name('contact');
Route::post('/contact', [ContactController::class, 'submit'])->middleware('throttle:5,1');

// ---------- Secure file delivery ----------
Route::get('/files/{resource}/stream', [DownloadController::class, 'stream'])->name('resources.stream');
Route::get('/files/{resource}/download', [DownloadController::class, 'download'])->name('resources.download');
Route::post('/files/{resource}/increment', [DownloadController::class, 'increment'])->name('resources.increment');

// ---------- Authentication ----------
Route::middleware('guest')->group(function () {
    Route::get('/login', [AuthController::class, 'create'])->name('login');
    Route::post('/login', [AuthController::class, 'store'])->middleware('throttle:5,1');
    Route::get('/register', [AuthController::class, 'registerForm'])->name('register');
    Route::post('/register', [AuthController::class, 'registerStore'])->middleware('throttle:5,1');
    Route::get('/forgot-password', [PasswordController::class, 'forgot'])->name('password.request');
    Route::post('/forgot-password', [PasswordController::class, 'sendResetLink'])->name('password.email');
    Route::get('/reset-password/{token}', [PasswordController::class, 'reset'])->name('password.reset');
    Route::post('/reset-password', [PasswordController::class, 'update'])->name('password.store');

    Route::prefix('admin')->name('admin.login')->group(function () {
        Route::get('/login', [AdminAuthController::class, 'create']);
        Route::post('/login', [AdminAuthController::class, 'store'])->middleware('throttle:5,1');
    });
});
Route::post('/logout', [AuthController::class, 'destroy'])->middleware('auth')->name('logout');

// ---------- Student portal ----------
Route::middleware(['auth', 'student'])->group(function () {
    Route::get('/dashboard', [StudentDashboardController::class, 'index'])->name('student.dashboard');

    Route::get('/my-learning', [LearningController::class, 'index'])->name('student.learning');
    Route::get('/my-bookmarks', [BookmarkController::class, 'index'])->name('student.bookmarks');
    Route::post('/bookmarks/toggle', [BookmarkController::class, 'toggle'])->name('student.bookmark.toggle');
    Route::post('/bookmarks/remove', [BookmarkController::class, 'remove'])->name('student.bookmark.remove');

    Route::get('/my-progress', [ProgressController::class, 'index'])->name('student.progress');
    Route::post('/progress/update', [ProgressController::class, 'update'])->name('student.progress.update');
    Route::post('/progress/mark-complete', [ProgressController::class, 'markComplete'])->name('student.progress.complete');

    Route::get('/my-quiz-results', [QuizAttemptController::class, 'history'])->name('student.quiz-results');
    Route::get('/quizzes/{quiz:slug}/attempt', [QuizAttemptController::class, 'attempt'])->name('quizzes.attempt');
    Route::post('/quizzes/{quiz}/submit', [QuizAttemptController::class, 'submit'])->name('quizzes.submit');
    Route::get('/quizzes/{quiz}/results/{attempt}', [QuizAttemptController::class, 'results'])->name('quizzes.result');

    Route::get('/profile', [ProfileController::class, 'show'])->name('student.profile');
    Route::post('/profile', [ProfileController::class, 'update'])->name('student.profile.update');
    Route::post('/profile/password', [ProfileController::class, 'updatePassword'])->name('student.profile.password');
    Route::get('/settings', [ProfileController::class, 'settings'])->name('student.settings');

    Route::get('/discussions', [DiscussionController::class, 'index'])->name('discussions.index');
    Route::get('/discussions/create', [DiscussionController::class, 'create'])->name('discussions.create');
    Route::post('/discussions', [DiscussionController::class, 'store'])->name('discussions.store');
    Route::get('/discussions/{discussion:slug}', [DiscussionController::class, 'show'])->name('discussions.show');
    Route::post('/discussions/{discussion}/replies', [DiscussionController::class, 'reply'])->name('discussions.reply');
    Route::post('/discussions/{discussion}/like', [DiscussionController::class, 'like'])->name('discussions.like');
    Route::post('/replies/{reply}/like', [DiscussionController::class, 'likeReply'])->name('discussions.like-reply');
    Route::post('/reports', [DiscussionController::class, 'report'])->name('reports.store');

    Route::get('/notifications', [NotificationController::class, 'index'])->name('student.notifications');
    Route::post('/notifications/read-all', [NotificationController::class, 'readAll'])->name('student.notifications.read-all');
    Route::post('/notifications/{notification}/read', [NotificationController::class, 'markRead'])->name('student.notifications.read');
});

// ---------- Admin portal ----------
Route::prefix('admin')->name('admin.')->middleware(['auth', 'admin'])->group(function () {
    Route::get('/', [AdminDashboardController::class, 'index'])->name('dashboard');

    // Academic hierarchy
    Route::resource('universities', AdminUniversityController::class)->except('show');
    Route::post('universities/{university}/toggle', [AdminUniversityController::class, 'toggle'])->name('universities.toggle');

    Route::resource('colleges', AdminCollegeController::class)->except('show');
    Route::post('colleges/{college}/toggle', [AdminCollegeController::class, 'toggle'])->name('colleges.toggle');

    Route::resource('programs', AdminProgramController::class)->except('show');
    Route::post('programs/{program}/toggle', [AdminProgramController::class, 'toggle'])->name('programs.toggle');

    Route::resource('semesters', AdminSemesterController::class)->except('show');

    Route::resource('subjects', AdminSubjectController::class)->except('show');
    Route::post('subjects/{subject}/toggle', [AdminSubjectController::class, 'toggle'])->name('subjects.toggle');

    Route::resource('units', AdminUnitController::class)->except('show');

    Route::resource('topics', AdminTopicController::class)->except('show');

    // Resources
    Route::resource('notes', AdminNoteController::class)->except('show');
    Route::post('notes/{note}/publish', [AdminNoteController::class, 'publish'])->name('notes.publish');
    Route::post('notes/{note}/toggle-feature', [AdminNoteController::class, 'toggleFeature'])->name('notes.toggle-feature');

    Route::resource('videos', AdminVideoController::class)->except('show');
    Route::post('videos/{video}/publish', [AdminVideoController::class, 'publish'])->name('videos.publish');
    Route::post('videos/{video}/toggle-feature', [AdminVideoController::class, 'toggleFeature'])->name('videos.toggle-feature');

    Route::resource('literature', AdminLiteratureController::class)->except('show');
    Route::post('literature/{literature}/publish', [AdminLiteratureController::class, 'publish'])->name('literature.publish');

    Route::resource('papers', AdminPaperController::class)->except('show');
    Route::post('papers/{paper}/publish', [AdminPaperController::class, 'publish'])->name('papers.publish');

    Route::resource('practical', AdminPracticalController::class)->except('show');
    Route::post('practical/{practical}/publish', [AdminPracticalController::class, 'publish'])->name('practical.publish');

    // Quiz
    Route::resource('quizzes', AdminQuizController::class)->except('show');
    Route::post('quizzes/{quiz}/publish', [AdminQuizController::class, 'publish'])->name('quizzes.publish');
    Route::get('questions', [AdminQuizController::class, 'questions'])->name('questions');
    Route::get('attempts', [AdminAttemptController::class, 'index'])->name('attempts');
    Route::delete('attempts/{attempt}', [AdminAttemptController::class, 'destroy'])->name('attempts.destroy');

    // Users
    Route::get('users', [AdminUserController::class, 'index'])->name('users.index');
    Route::get('users/{user}', [AdminUserController::class, 'show'])->name('users.show');
    Route::post('users/{user}/toggle', [AdminUserController::class, 'toggle'])->name('users.toggle');
    Route::delete('users/{user}', [AdminUserController::class, 'destroy'])->name('users.destroy');

    // Community
    Route::get('discussions', [AdminDiscussionController::class, 'index'])->name('discussions.index');
    Route::post('discussions/{discussion}/toggle', [AdminDiscussionController::class, 'toggle'])->name('discussions.toggle');
    Route::delete('discussions/{discussion}', [AdminDiscussionController::class, 'destroy'])->name('discussions.destroy');
    Route::get('reports', [AdminReportController::class, 'index'])->name('reports.index');
    Route::post('reports/{report}/resolve', [AdminReportController::class, 'resolve'])->name('reports.resolve');

    // Media & System
    Route::get('media', [AdminMediaController::class, 'index'])->name('media.index');
    Route::post('media', [AdminMediaController::class, 'store'])->name('media.store');
    Route::delete('media/{media}', [AdminMediaController::class, 'destroy'])->name('media.destroy');

    Route::get('analytics', [AdminAnalyticsController::class, 'index'])->name('analytics');
    Route::get('activities', [AdminActivityController::class, 'index'])->name('activities');

Route::get('settings', [AdminSettingController::class, 'edit'])->name('settings.edit');
    Route::post('settings', [AdminSettingController::class, 'update'])->name('settings.update');
});

// Dependent dropdown helper (academic hierarchy ajax) — public master data, no auth.
Route::prefix('admin')->name('admin.')->group(function () {
    Route::get('colleges/by-university/{university}', [AdminUniversityController::class, 'colleges'])->name('colleges.by-university');
    Route::get('programs/by-university/{university}', [AdminUniversityController::class, 'programs'])->name('programs.by-university');
    Route::get('semesters/by-program/{program}', [AdminProgramController::class, 'semesters'])->name('semesters.by-program');
    Route::get('subjects/by-semester/{semester}', [AdminSemesterController::class, 'subjects'])->name('subjects.by-semester');
    Route::get('units/by-subject/{subject}', [AdminSubjectController::class, 'units'])->name('units.by-subject');
    Route::get('topics/by-unit/{unit}', [AdminUnitController::class, 'topics'])->name('topics.by-unit');
});

Route::get('/sitemap.xml', function () {
    $urls = [
        route('home'),
        route('universities.index'),
        route('colleges.index'),
        route('subjects.index'),
        route('notes.index'),
        route('videos.index'),
        route('literature.index'),
        route('previous-papers.index'),
        route('practical.index'),
        route('quizzes.index'),
        route('search.index'),
    ];

    $content = view('sitemap', compact('urls'));

    return response($content)->header('Content-Type', 'application/xml');
});