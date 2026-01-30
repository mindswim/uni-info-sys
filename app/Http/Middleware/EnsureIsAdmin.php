<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureIsAdmin
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (! $user) {
            return response()->json([
                'message' => 'Unauthenticated.',
            ], 401);
        }

        // Check if user has admin or administrator role
        $allowedRoles = ['admin', 'administrator'];
        $hasAdminRole = false;

        foreach ($allowedRoles as $role) {
            if ($user->hasRole($role)) {
                $hasAdminRole = true;
                break;
            }
        }

        if (! $hasAdminRole) {
            return response()->json([
                'message' => 'Forbidden. This action requires administrator privileges.',
            ], 403);
        }

        return $next($request);
    }
}
