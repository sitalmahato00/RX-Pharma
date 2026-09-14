<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;

class StudentOnly
{
    public function handle(Request $request, Closure $next)
    {
        if (! $request->user()) {
            return redirect()->guest(route('login'));
        }

        if (! $request->user()->isStudent()) {
            throw new AccessDeniedHttpException('Admins cannot access the student portal.');
        }

        return $next($request);
    }
}