<?php

namespace App\Exceptions;

use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Response;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpKernel\Exception\HttpException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Throwable;

class ProblemDetails
{
    public function __construct(
        public string $type,
        public string $title,
        public int $status,
        public string $detail,
        public ?array $errors = null,
        public ?array $extensions = null
    ) {}

    public static function fromException(Throwable $e): self
    {
        return match (true) {
            $e instanceof ValidationException => self::fromValidationException($e),
            $e instanceof NotFoundHttpException => new self(
                type: 'https://tools.ietf.org/html/rfc7231#section-6.5.4',
                title: 'Resource Not Found',
                status: Response::HTTP_NOT_FOUND,
                detail: $e->getMessage() ?: 'The requested resource could not be found.'
            ),
            $e instanceof AuthenticationException => new self(
                type: 'https://tools.ietf.org/html/rfc7235#section-3.1',
                title: 'Unauthenticated',
                status: Response::HTTP_UNAUTHORIZED,
                detail: 'Unauthenticated.'
            ),
            $e instanceof AuthorizationException => new self(
                type: 'https://tools.ietf.org/html/rfc7231',
                title: 'Forbidden',
                status: Response::HTTP_FORBIDDEN,
                detail: $e->getMessage() ?: 'This action is unauthorized.'
            ),
            $e instanceof HttpException => new self(
                type: 'https://tools.ietf.org/html/rfc7231',
                title: Response::$statusTexts[$e->getStatusCode()] ?? 'HTTP Error',
                status: $e->getStatusCode(),
                detail: $e->getMessage() ?: 'An HTTP error occurred.'
            ),
            default => new self(
                type: 'https://tools.ietf.org/html/rfc7231#section-6.6.1',
                title: 'Internal Server Error',
                status: Response::HTTP_INTERNAL_SERVER_ERROR,
                detail: config('app.debug') ? $e->getMessage() : 'An unexpected error occurred.'
            )
        };
    }

    private static function fromValidationException(ValidationException $e): self
    {
        return new self(
            type: 'https://tools.ietf.org/html/rfc4918#section-11.2',
            title: 'Validation Error',
            status: Response::HTTP_UNPROCESSABLE_ENTITY,
            detail: 'The given data was invalid.',
            errors: $e->errors()
        );
    }

    public function toResponse(): JsonResponse
    {
        $data = [
            'type' => $this->type,
            'title' => $this->title,
            'status' => $this->status,
            'detail' => $this->detail,
        ];

        if ($this->errors !== null) {
            $data['errors'] = $this->errors;
        }

        if ($this->extensions !== null) {
            $data = array_merge($data, $this->extensions);
        }

        return response()->json($data, $this->status);
    }

    public function withExtensions(array $extensions): self
    {
        $this->extensions = $extensions;

        return $this;
    }
}
