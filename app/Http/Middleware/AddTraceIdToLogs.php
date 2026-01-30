<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\Response;

class AddTraceIdToLogs
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Generate a UUID if the X-Request-ID header isn't present
        $traceId = $request->header('X-Request-ID') ?: (string) Str::uuid();

        // Add the trace ID to the request for potential use in other parts of the application
        $request->headers->set('X-Request-ID', $traceId);

        // Push the trace ID to the logging context
        // This will be automatically included in all subsequent logs for this request
        Log::withContext([
            'request_id' => $traceId,
            'method' => $request->getMethod(),
            'url' => $request->getUri(),
            'ip' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        $response = $next($request);

        // Add the trace ID to the response headers for client reference
        $response->headers->set('X-Request-ID', $traceId);

        return $response;
    }
}
