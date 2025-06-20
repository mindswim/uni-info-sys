<?php

namespace App\Services;

use Prometheus\CollectorRegistry;
use Prometheus\Counter;
use Prometheus\Histogram;
use Prometheus\Storage\InMemory;

class MetricsService
{
    private CollectorRegistry $registry;
    private Counter $httpRequestsTotal;
    private Histogram $httpRequestDuration;

    public function __construct()
    {
        // Use InMemory storage for persistence between requests
        $this->registry = new CollectorRegistry(new InMemory());
        $this->initializeMetrics();
    }

    private function initializeMetrics(): void
    {
        // HTTP request counter with labels for method, route, and status
        $this->httpRequestsTotal = $this->registry->getOrRegisterCounter(
            'app',
            'http_requests_total',
            'Total number of HTTP requests',
            ['method', 'route', 'status']
        );

        // HTTP request duration histogram with labels for method and route
        $this->httpRequestDuration = $this->registry->getOrRegisterHistogram(
            'app',
            'http_request_duration_seconds',
            'HTTP request duration in seconds',
            ['method', 'route'],
            [0.1, 0.25, 0.5, 1.0, 2.5, 5.0, 10.0] // Buckets for response times
        );
    }

    public function incrementHttpRequests(string $method, string $route, int $status): void
    {
        $this->httpRequestsTotal->inc([
            'method' => $method,
            'route' => $route,
            'status' => (string) $status
        ]);
    }

    public function observeHttpRequestDuration(string $method, string $route, float $duration): void
    {
        $this->httpRequestDuration->observe($duration, [
            'method' => $method,
            'route' => $route
        ]);
    }

    public function getRegistry(): CollectorRegistry
    {
        return $this->registry;
    }
} 