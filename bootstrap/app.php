<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->web(append: [
            \App\Http\Middleware\HandleInertiaRequests::class,
            \Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets::class,
        ]);

        // Use Laravel 11's built-in API throttling
        $middleware->throttleApi();

        // Add trace ID to all API requests for structured logging
        $middleware->api(append: [
            \App\Http\Middleware\AddTraceIdToLogs::class,
            \App\Http\Middleware\PrometheusMetrics::class,
        ]);

        //
    })
    ->withExceptions(function (Exceptions $exceptions) {
        $exceptions->render(function (Throwable $e, Illuminate\Http\Request $request) {
            if ($request->is('api/*') || $request->expectsJson()) {
                // Handle our custom domain exceptions first
                if ($e instanceof App\Exceptions\EnrollmentCapacityExceededException) {
                    \Log::warning('Enrollment capacity exceeded', [
                        'message' => $e->getMessage(),
                        'user_id' => $request->user()?->id,
                        'url' => $request->url(),
                    ]);
                    
                    $problem = new App\Exceptions\ProblemDetails(
                        type: 'https://university-admissions.com/problems/enrollment-capacity-exceeded',
                        title: 'Enrollment Capacity Exceeded',
                        status: 422,
                        detail: $e->getMessage(),
                        extensions: ['error_code' => 'ENROLLMENT_CAPACITY_EXCEEDED']
                    );
                    
                    return $problem->toResponse();
                } elseif ($e instanceof App\Exceptions\DuplicateEnrollmentException) {
                    \Log::warning('Duplicate enrollment attempt', [
                        'message' => $e->getMessage(),
                        'user_id' => $request->user()?->id,
                        'url' => $request->url(),
                    ]);
                    
                    $problem = new App\Exceptions\ProblemDetails(
                        type: 'https://university-admissions.com/problems/duplicate-enrollment',
                        title: 'Duplicate Enrollment',
                        status: 422,
                        detail: $e->getMessage(),
                        extensions: ['error_code' => 'DUPLICATE_ENROLLMENT']
                    );
                    
                    return $problem->toResponse();
                } elseif ($e instanceof App\Exceptions\StudentNotActiveException) {
                    \Log::warning('Inactive student enrollment attempt', [
                        'message' => $e->getMessage(),
                        'user_id' => $request->user()?->id,
                        'url' => $request->url(),
                    ]);
                    
                    $problem = new App\Exceptions\ProblemDetails(
                        type: 'https://university-admissions.com/problems/student-not-active',
                        title: 'Student Not Active',
                        status: 422,
                        detail: $e->getMessage(),
                        extensions: ['error_code' => 'STUDENT_NOT_ACTIVE']
                    );
                    
                    return $problem->toResponse();
                } elseif ($e instanceof App\Exceptions\CourseSectionUnavailableException) {
                    \Log::warning('Course section unavailable', [
                        'message' => $e->getMessage(),
                        'user_id' => $request->user()?->id,
                        'url' => $request->url(),
                    ]);
                    
                    $problem = new App\Exceptions\ProblemDetails(
                        type: 'https://university-admissions.com/problems/course-section-unavailable',
                        title: 'Course Section Unavailable',
                        status: 422,
                        detail: $e->getMessage(),
                        extensions: ['error_code' => 'COURSE_SECTION_UNAVAILABLE']
                    );
                    
                    return $problem->toResponse();
                } elseif ($e instanceof App\Exceptions\PrerequisiteNotMetException) {
                    \Log::warning('Course prerequisites not met', [
                        'message' => $e->getMessage(),
                        'user_id' => $request->user()?->id,
                        'url' => $request->url(),
                    ]);
                    
                    $problem = new App\Exceptions\ProblemDetails(
                        type: 'https://university-admissions.com/problems/prerequisite-not-met',
                        title: 'Prerequisite Not Met',
                        status: 422,
                        detail: $e->getMessage(),
                        extensions: ['error_code' => 'PREREQUISITE_NOT_MET']
                    );
                    
                    return $problem->toResponse();
                } elseif ($e instanceof App\Exceptions\InvalidApplicationStatusException) {
                    \Log::warning('Invalid application status transition', [
                        'message' => $e->getMessage(),
                        'user_id' => $request->user()?->id,
                        'url' => $request->url(),
                    ]);
                    
                    $problem = new App\Exceptions\ProblemDetails(
                        type: 'https://university-admissions.com/problems/invalid-application-status',
                        title: 'Invalid Application Status',
                        status: 422,
                        detail: $e->getMessage(),
                        extensions: ['error_code' => 'INVALID_APPLICATION_STATUS']
                    );
                    
                    return $problem->toResponse();
                } elseif ($e instanceof App\Exceptions\ResourceNotFoundException) {
                    \Log::info('Resource not found', [
                        'message' => $e->getMessage(),
                        'user_id' => $request->user()?->id,
                        'url' => $request->url(),
                    ]);
                    
                    $problem = new App\Exceptions\ProblemDetails(
                        type: 'https://university-admissions.com/problems/resource-not-found',
                        title: 'Resource Not Found',
                        status: 404,
                        detail: $e->getMessage(),
                        extensions: ['error_code' => 'RESOURCE_NOT_FOUND']
                    );
                    
                    return $problem->toResponse();
                } elseif ($e instanceof App\Exceptions\InsufficientPermissionsException) {
                    \Log::warning('Insufficient permissions', [
                        'message' => $e->getMessage(),
                        'user_id' => $request->user()?->id,
                        'url' => $request->url(),
                    ]);
                    
                    $problem = new App\Exceptions\ProblemDetails(
                        type: 'https://university-admissions.com/problems/insufficient-permissions',
                        title: 'Insufficient Permissions',
                        status: 403,
                        detail: $e->getMessage(),
                        extensions: ['error_code' => 'INSUFFICIENT_PERMISSIONS']
                    );
                    
                    return $problem->toResponse();
                } elseif ($e instanceof App\Exceptions\BusinessRuleViolationException) {
                    \Log::warning('Business rule violation', [
                        'message' => $e->getMessage(),
                        'user_id' => $request->user()?->id,
                        'url' => $request->url(),
                    ]);
                    
                    $problem = new App\Exceptions\ProblemDetails(
                        type: 'https://university-admissions.com/problems/business-rule-violation',
                        title: 'Business Rule Violation',
                        status: 422,
                        detail: $e->getMessage(),
                        extensions: ['error_code' => 'BUSINESS_RULE_VIOLATION']
                    );
                    
                    return $problem->toResponse();
                } elseif ($e instanceof Symfony\Component\HttpKernel\Exception\TooManyRequestsHttpException) {
                    $problem = new App\Exceptions\ProblemDetails(
                        type: 'https://tools.ietf.org/html/rfc6585#section-4',
                        title: 'Too Many Requests',
                        status: 429,
                        detail: 'Too many requests. Please try again later.',
                        extensions: ['error_code' => 'RATE_LIMIT_EXCEEDED']
                    );
                    
                    return $problem->toResponse();
                } elseif ($e instanceof Illuminate\Database\Eloquent\ModelNotFoundException) {
                    $problem = new App\Exceptions\ProblemDetails(
                        type: 'https://tools.ietf.org/html/rfc7231#section-6.5.4',
                        title: 'Resource Not Found',
                        status: 404,
                        detail: 'The requested resource was not found.',
                        extensions: ['error_code' => 'MODEL_NOT_FOUND']
                    );
                    
                    return $problem->toResponse();
                } else {
                    // For all other exceptions, use the standard RFC 7807 handler
                    // but add debug information if needed
                    $problem = App\Exceptions\ProblemDetails::fromException($e);
                    
                    // Log unexpected errors
                    if ($problem->status >= 500) {
                        \Log::error('Unexpected API error', [
                            'exception' => get_class($e),
                            'message' => $e->getMessage(),
                            'file' => $e->getFile(),
                            'line' => $e->getLine(),
                            'user_id' => $request->user()?->id,
                            'url' => $request->url(),
                            'request_data' => $request->except(['password', 'password_confirmation']),
                        ]);
                    }
                    
                    // Include debug information in development
                    if (config('app.debug') && $problem->status >= 500) {
                        $problem = $problem->withExtensions([
                            'debug' => [
                                'exception' => get_class($e),
                                'file' => $e->getFile(),
                                'line' => $e->getLine(),
                                'trace' => collect($e->getTrace())->take(5)->map(function ($trace) {
                                    return [
                                        'file' => $trace['file'] ?? 'Unknown',
                                        'line' => $trace['line'] ?? 'Unknown',
                                        'function' => $trace['function'] ?? 'Unknown',
                                    ];
                                })->all(),
                            ]
                        ]);
                    }
                    
                    return $problem->toResponse();
                }
            }
        });
    })->create();
