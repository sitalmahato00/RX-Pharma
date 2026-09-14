<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;

class AdminOnly
{
    public function handle(Request $request, Closure $next)
    {
        if (! $request->user()) {
            return redirect()->guest(route('admin.login'));
        }

        if (! $request->user()->isAdmin()) {
            throw new AccessDeniedHttpException('You are not authorized to access the admin panel.');
        }

        return $next($request);
    }
}