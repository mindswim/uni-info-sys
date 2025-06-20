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
        ]);

        //
    })
    ->withExceptions(function (Exceptions $exceptions) {
        $exceptions->render(function (Throwable $e, Illuminate\Http\Request $request) {
            if ($request->is('api/*') || $request->expectsJson()) {
                $message = 'An unexpected error occurred.';
                $statusCode = 500;
                $errors = [];
                $errorCode = null;

                // Handle our custom domain exceptions
                if ($e instanceof App\Exceptions\EnrollmentCapacityExceededException) {
                    $message = $e->getMessage();
                    $statusCode = 422;
                    $errorCode = 'ENROLLMENT_CAPACITY_EXCEEDED';
                    \Log::warning('Enrollment capacity exceeded', [
                        'message' => $e->getMessage(),
                        'user_id' => $request->user()?->id,
                        'url' => $request->url(),
                    ]);
                } elseif ($e instanceof App\Exceptions\DuplicateEnrollmentException) {
                    $message = $e->getMessage();
                    $statusCode = 422;
                    $errorCode = 'DUPLICATE_ENROLLMENT';
                    \Log::warning('Duplicate enrollment attempt', [
                        'message' => $e->getMessage(),
                        'user_id' => $request->user()?->id,
                        'url' => $request->url(),
                    ]);
                } elseif ($e instanceof App\Exceptions\StudentNotActiveException) {
                    $message = $e->getMessage();
                    $statusCode = 422;
                    $errorCode = 'STUDENT_NOT_ACTIVE';
                    \Log::warning('Inactive student enrollment attempt', [
                        'message' => $e->getMessage(),
                        'user_id' => $request->user()?->id,
                        'url' => $request->url(),
                    ]);
                } elseif ($e instanceof App\Exceptions\CourseSectionUnavailableException) {
                    $message = $e->getMessage();
                    $statusCode = 422;
                    $errorCode = 'COURSE_SECTION_UNAVAILABLE';
                    \Log::warning('Course section unavailable', [
                        'message' => $e->getMessage(),
                        'user_id' => $request->user()?->id,
                        'url' => $request->url(),
                    ]);
                } elseif ($e instanceof App\Exceptions\PrerequisiteNotMetException) {
                    $message = $e->getMessage();
                    $statusCode = 422;
                    $errorCode = 'PREREQUISITE_NOT_MET';
                    \Log::warning('Course prerequisites not met', [
                        'message' => $e->getMessage(),
                        'user_id' => $request->user()?->id,
                        'url' => $request->url(),
                    ]);
                } elseif ($e instanceof App\Exceptions\InvalidApplicationStatusException) {
                    $message = $e->getMessage();
                    $statusCode = 422;
                    $errorCode = 'INVALID_APPLICATION_STATUS';
                    \Log::warning('Invalid application status transition', [
                        'message' => $e->getMessage(),
                        'user_id' => $request->user()?->id,
                        'url' => $request->url(),
                    ]);
                } elseif ($e instanceof App\Exceptions\ResourceNotFoundException) {
                    $message = $e->getMessage();
                    $statusCode = 404;
                    $errorCode = 'RESOURCE_NOT_FOUND';
                    \Log::info('Resource not found', [
                        'message' => $e->getMessage(),
                        'user_id' => $request->user()?->id,
                        'url' => $request->url(),
                    ]);
                } elseif ($e instanceof App\Exceptions\InsufficientPermissionsException) {
                    $message = $e->getMessage();
                    $statusCode = 403;
                    $errorCode = 'INSUFFICIENT_PERMISSIONS';
                    \Log::warning('Insufficient permissions', [
                        'message' => $e->getMessage(),
                        'user_id' => $request->user()?->id,
                        'url' => $request->url(),
                    ]);
                } elseif ($e instanceof App\Exceptions\BusinessRuleViolationException) {
                    $message = $e->getMessage();
                    $statusCode = 422;
                    $errorCode = 'BUSINESS_RULE_VIOLATION';
                    \Log::warning('Business rule violation', [
                        'message' => $e->getMessage(),
                        'user_id' => $request->user()?->id,
                        'url' => $request->url(),
                    ]);
                }
                // Handle standard Laravel/Symfony exceptions
                elseif ($e instanceof Symfony\Component\HttpKernel\Exception\NotFoundHttpException) {
                    $message = 'The requested resource was not found.';
                    $statusCode = 404;
                    $errorCode = 'NOT_FOUND';
                } elseif ($e instanceof Illuminate\Auth\AuthenticationException) {
                    $message = 'Unauthenticated.';
                    $statusCode = 401;
                    $errorCode = 'UNAUTHENTICATED';
                } elseif ($e instanceof Illuminate\Auth\Access\AuthorizationException) {
                    $message = 'This action is unauthorized.';
                    $statusCode = 403;
                    $errorCode = 'UNAUTHORIZED';
                } elseif ($e instanceof Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException) {
                    $message = 'This action is unauthorized.';
                    $statusCode = 403;
                    $errorCode = 'UNAUTHORIZED';
                } elseif ($e instanceof Illuminate\Validation\ValidationException) {
                    $message = 'The given data was invalid.';
                    $statusCode = 422;
                    $errorCode = 'VALIDATION_ERROR';
                    $errors = $e->errors();
                } elseif ($e instanceof Symfony\Component\HttpKernel\Exception\TooManyRequestsHttpException) {
                    $message = 'Too many requests. Please try again later.';
                    $statusCode = 429;
                    $errorCode = 'RATE_LIMIT_EXCEEDED';
                } elseif ($e instanceof Illuminate\Database\Eloquent\ModelNotFoundException) {
                    $message = 'The requested resource was not found.';
                    $statusCode = 404;
                    $errorCode = 'MODEL_NOT_FOUND';
                } else {
                    // Log unexpected errors
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

                $response = [
                    'message' => $message,
                    'error_code' => $errorCode,
                ];

                if (!empty($errors)) {
                    $response['errors'] = $errors;
                }

                // Include debug information in development
                if (config('app.debug')) {
                    $response['debug'] = [
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
                    ];
                }

                return response()->json($response, $statusCode);
            }
        });
    })->create();
