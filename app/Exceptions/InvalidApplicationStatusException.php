<?php

namespace App\Exceptions;

use Exception;

class InvalidApplicationStatusException extends Exception
{
    public function __construct(string $message = 'Invalid application status transition', int $code = 422, ?Exception $previous = null)
    {
        parent::__construct($message, $code, $previous);
    }
} 