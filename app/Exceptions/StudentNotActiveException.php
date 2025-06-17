<?php

namespace App\Exceptions;

use Exception;

class StudentNotActiveException extends Exception
{
    public function __construct(string $message = 'Student account is not active or verified', int $code = 422, ?Exception $previous = null)
    {
        parent::__construct($message, $code, $previous);
    }
} 