<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CorsHeaders
{
    /**
     * Handle an incoming request.
     *
     * This middleware ensures CORS headers are added to ALL responses,
     * including error responses (403, 404, 500, etc).
     *
     * Unlike Laravel's built-in HandleCors middleware, this runs at the very
     * beginning of the middleware stack, ensuring error responses also get
     * CORS headers.
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Handle preflight OPTIONS requests
        if ($request->isMethod('OPTIONS')) {
            $response = response('', 200);
        } else {
            $response = $next($request);
        }

        return $this->addCorsHeaders($request, $response);
    }

    /**
     * Add CORS headers to the response using config/cors.php settings.
     */
    protected function addCorsHeaders(Request $request, Response $response): Response
    {
        $allowedOrigins = config('cors.allowed_origins', []);
        $origin = $request->header('Origin');

        if (! $origin) {
            return $response;
        }

        // Check if origin is allowed (support for '*' wildcard)
        $isAllowed = in_array('*', $allowedOrigins) || in_array($origin, $allowedOrigins);

        // Also check origin patterns if configured
        if (! $isAllowed) {
            $patterns = config('cors.allowed_origins_patterns', []);
            foreach ($patterns as $pattern) {
                if (preg_match($pattern, $origin)) {
                    $isAllowed = true;
                    break;
                }
            }
        }

        if ($isAllowed) {
            $response->headers->set('Access-Control-Allow-Origin', $origin);

            // Get allowed methods from config
            $methods = config('cors.allowed_methods', ['*']);
            $methodsString = in_array('*', $methods)
                ? 'GET, POST, PUT, PATCH, DELETE, OPTIONS'
                : implode(', ', $methods);
            $response->headers->set('Access-Control-Allow-Methods', $methodsString);

            // Get allowed headers from config
            $headers = config('cors.allowed_headers', ['*']);
            $headersString = in_array('*', $headers)
                ? 'Content-Type, Authorization, X-Requested-With, Accept, X-XSRF-TOKEN'
                : implode(', ', $headers);
            $response->headers->set('Access-Control-Allow-Headers', $headersString);

            // Credentials support
            if (config('cors.supports_credentials', false)) {
                $response->headers->set('Access-Control-Allow-Credentials', 'true');
            }

            // Max age for preflight caching
            $maxAge = config('cors.max_age', 0);
            if ($maxAge > 0) {
                $response->headers->set('Access-Control-Max-Age', (string) $maxAge);
            }

            // Exposed headers
            $exposedHeaders = config('cors.exposed_headers', []);
            if (! empty($exposedHeaders)) {
                $response->headers->set('Access-Control-Expose-Headers', implode(', ', $exposedHeaders));
            }
        }

        return $response;
    }
}
