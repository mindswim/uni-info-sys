<?php

namespace App\Exceptions;

use Exception;

class BusinessRuleViolationException extends Exception
{
    public function __construct(string $message = 'Business rule violation', ?string $rule = null, int $code = 422, ?Exception $previous = null)
    {
        if ($rule) {
            $message = "Business rule violation: {$rule}";
        }

        parent::__construct($message, $code, $previous);
    }
}
