<?php

namespace App\Exceptions;

use Exception;

class CourseSectionUnavailableException extends Exception
{
    public function __construct(string $message = 'Course section is not available for enrollment', int $code = 422, ?Exception $previous = null)
    {
        parent::__construct($message, $code, $previous);
    }
}
