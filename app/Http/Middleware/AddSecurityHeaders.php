<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AddSecurityHeaders
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        // Prevent clickjacking attacks by controlling iframe embedding
        $response->headers->set('X-Frame-Options', 'SAMEORIGIN');

        // Prevent MIME type sniffing attacks
        $response->headers->set('X-Content-Type-Options', 'nosniff');

        // Control referrer information sent when navigating away from the page
        $response->headers->set('Referrer-Policy', 'no-referrer-when-downgrade');

        // Enforce HTTPS connections (only in production)
        if (app()->environment('production')) {
            $response->headers->set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
        }

        // Remove potentially sensitive server information
        $response->headers->remove('X-Powered-By');
        $response->headers->remove('Server');

        // Add basic XSS protection (deprecated but still useful for older browsers)
        $response->headers->set('X-XSS-Protection', '1; mode=block');

        // Prevent browsers from performing dangerous actions based on MIME type
        $response->headers->set('X-Permitted-Cross-Domain-Policies', 'none');

        // A restrictive Content-Security-Policy would be ideal, but requires careful tuning
        // For now, we'll add a basic policy that allows same-origin resources
        // This can be customized based on specific application needs
        $response->headers->set('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self'; connect-src 'self'");

        // Note: CORS headers are handled by CorsHeaders middleware which runs first
        // to ensure all responses (including errors) get proper CORS headers

        return $response;
    }
}
