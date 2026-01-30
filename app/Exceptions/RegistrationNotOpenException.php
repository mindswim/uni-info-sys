<?php

namespace App\Exceptions;

class RegistrationNotOpenException extends BusinessRuleViolationException
{
    private string $opensAt;

    public function __construct(string $opensAt)
    {
        $this->opensAt = $opensAt;
        parent::__construct("Registration is not yet open for your time ticket. Your registration window opens at {$opensAt}.");
    }

    public function getOpensAt(): string
    {
        return $this->opensAt;
    }
}
