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

        //
    })
    ->withExceptions(function (Exceptions $exceptions) {
        $exceptions->render(function (Throwable $e, Illuminate\Http\Request $request) {
            if ($request->is('api/*')) {
                $message = 'An unexpected error occurred.';
                $statusCode = 500;
                $errors = [];

                if ($e instanceof Symfony\Component\HttpKernel\Exception\NotFoundHttpException) {
                    $message = 'The requested resource was not found.';
                    $statusCode = 404;
                } elseif ($e instanceof Illuminate\Auth\AuthenticationException) {
                    $message = 'Unauthenticated.';
                    $statusCode = 401;
                } elseif ($e instanceof Illuminate\Auth\Access\AuthorizationException) {
                    $message = 'This action is unauthorized.';
                    $statusCode = 403;
                } elseif ($e instanceof Illuminate\Validation\ValidationException) {
                    $message = 'The given data was invalid.';
                    $statusCode = 422;
                    $errors = $e->errors();
                } elseif ($e instanceof Symfony\Component\HttpKernel\Exception\TooManyRequestsHttpException) {
                    $message = 'Too many requests. Please try again later.';
                    $statusCode = 429;
                }

                $response = ['message' => $message];

                if (!empty($errors)) {
                    $response['errors'] = $errors;
                }

                if (config('app.debug')) {
                    $response['exception'] = get_class($e);
                    $response['file'] = $e->getFile();
                    $response['line'] = $e->getLine();
                    $response['trace'] = collect($e->getTrace())->pluck('file', 'line')->all();
                }

                return response()->json($response, $statusCode);
            }
        });
    })->create();
