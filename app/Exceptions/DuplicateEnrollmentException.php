<?php

namespace App\Exceptions;

use Exception;

class DuplicateEnrollmentException extends Exception
{
    public function __construct(string $message = 'Student is already enrolled or waitlisted for this course section', int $code = 422, ?Exception $previous = null)
    {
        parent::__construct($message, $code, $previous);
    }
} 