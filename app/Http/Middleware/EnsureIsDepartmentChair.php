<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureIsDepartmentChair
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (! $user) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        if (! $user->hasRole('department-chair')) {
            return response()->json([
                'message' => 'Forbidden. This action requires department chair privileges.',
            ], 403);
        }

        return $next($request);
    }
}
