<?php

namespace App\Exceptions;

use Exception;

class PrerequisiteNotMetException extends Exception
{
    public function __construct(string $message = 'Course prerequisites have not been met', int $code = 422, ?Exception $previous = null)
    {
        parent::__construct($message, $code, $previous);
    }
}
