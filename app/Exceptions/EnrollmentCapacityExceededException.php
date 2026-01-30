<?php

namespace App\Exceptions;

use Exception;

class EnrollmentCapacityExceededException extends Exception
{
    public function __construct(string $message = 'Course section is at full capacity', int $code = 422, ?Exception $previous = null)
    {
        parent::__construct($message, $code, $previous);
    }
}
