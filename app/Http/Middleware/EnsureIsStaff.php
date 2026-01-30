<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureIsStaff
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

        // Check if user has staff, faculty, or instructor role
        $allowedRoles = ['staff', 'faculty', 'instructor'];
        $hasStaffRole = false;

        foreach ($allowedRoles as $role) {
            if ($user->hasRole($role)) {
                $hasStaffRole = true;
                break;
            }
        }

        if (! $hasStaffRole) {
            return response()->json([
                'message' => 'Forbidden. This action requires staff, faculty, or instructor role.',
            ], 403);
        }

        // Check if user has an associated staff record
        if (! $user->staff) {
            return response()->json([
                'message' => 'No staff profile found for this user.',
            ], 403);
        }

        return $next($request);
    }
}
