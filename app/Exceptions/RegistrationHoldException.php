<?php

namespace App\Exceptions;

use Exception;

class RegistrationHoldException extends Exception
{
    private array $holds;

    public function __construct(string $message = 'Student has active registration holds', array $holds = [], int $code = 422, ?Exception $previous = null)
    {
        $this->holds = $holds;
        parent::__construct($message, $code, $previous);
    }

    public function getHolds(): array
    {
        return $this->holds;
    }
}
