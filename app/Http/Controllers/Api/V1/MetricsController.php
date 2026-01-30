<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Services\MetricsService;
use Illuminate\Http\Response;
use Prometheus\RenderTextFormat;

class MetricsController extends Controller
{
    private MetricsService $metricsService;

    public function __construct(MetricsService $metricsService)
    {
        $this->metricsService = $metricsService;
    }

    /**
     * Expose Prometheus metrics endpoint
     */
    public function index(): Response
    {
        $registry = $this->metricsService->getRegistry();
        $renderer = new RenderTextFormat;
        $result = $renderer->render($registry->getMetricFamilySamples());

        return response($result, 200, [
            'Content-Type' => RenderTextFormat::MIME_TYPE,
        ]);
    }
}
