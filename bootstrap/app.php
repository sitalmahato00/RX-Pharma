<?php

use App\Http\Middleware\AdminOnly;
use App\Http\Middleware\HandleInertiaRequests;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->web(append: [
            HandleInertiaRequests::class,
        ]);

        $middleware->alias([
            'admin' => AdminOnly::class,
            'student' => \App\Http\Middleware\StudentOnly::class,
        ]);

        $middleware->throttleApi('60,1');
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->render(function (\Symfony\Component\HttpKernel\Exception\NotFoundHttpException $e, Request $request) {
            if ($request->is('admin/*') || $request->is('admin')) {
                return inertia('Admin/Errors/NotFound')->toResponse($request)->setStatusCode(404);
            }
            return inertia('Errors/NotFound')->toResponse($request)->setStatusCode(404);
        });

        $exceptions->render(function (\Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException $e, Request $request) {
            if (str_starts_with($request->path(), 'admin')) {
                return inertia('Admin/Errors/Forbidden')->toResponse($request)->setStatusCode(403);
            }
            return inertia('Errors/Forbidden')->toResponse($request)->setStatusCode(403);
        });

        $exceptions->render(function (Illuminate\Session\TokenMismatchException $e, Request $request) {
            return inertia('Errors/InvalidToken')->toResponse($request)->setStatusCode(419);
        });
    })->create();