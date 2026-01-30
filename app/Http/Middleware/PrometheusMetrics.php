<?php

namespace App\Http\Middleware;

use App\Services\MetricsService;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response as SymfonyResponse;

class PrometheusMetrics
{
    private MetricsService $metricsService;

    public function __construct(MetricsService $metricsService)
    {
        $this->metricsService = $metricsService;
    }

    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): SymfonyResponse
    {
        $startTime = microtime(true);

        $response = $next($request);

        $this->recordMetrics($request, $response, $startTime);

        return $response;
    }

    private function recordMetrics(Request $request, SymfonyResponse $response, float $startTime): void
    {
        $duration = microtime(true) - $startTime;
        $method = $request->getMethod();
        $route = $this->getRouteName($request);
        $status = $response->getStatusCode();

        // Record request count
        $this->metricsService->incrementHttpRequests($method, $route, $status);

        // Record request duration
        $this->metricsService->observeHttpRequestDuration($method, $route, $duration);
    }

    private function getRouteName(Request $request): string
    {
        $route = $request->route();

        if ($route) {
            // Use the route name if available
            if ($route->getName()) {
                return $route->getName();
            }

            // Use the route URI pattern which already has {id} placeholders
            $uri = $route->uri();
            if ($uri) {
                return $uri;
            }
        }

        // Fallback to the request path, but normalize it to avoid high cardinality
        $path = $request->getPathInfo();

        // Replace numeric IDs with placeholders to reduce cardinality
        $normalizedPath = preg_replace('/\/\d+/', '/{id}', $path);

        return $normalizedPath ?: '/';
    }
}
