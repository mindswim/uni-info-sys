<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureIsStudent
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'message' => 'Unauthenticated.'
            ], 401);
        }

        // Check if user has student role
        if (!$user->hasRole('student')) {
            return response()->json([
                'message' => 'Forbidden. This action requires student role.'
            ], 403);
        }

        // Check if user has an associated student record
        if (!$user->student) {
            return response()->json([
                'message' => 'No student profile found for this user.'
            ], 403);
        }

        return $next($request);
    }
}
