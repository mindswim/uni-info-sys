<?php

namespace App\Exceptions;

class CreditLimitExceededException extends BusinessRuleViolationException
{
    private int $currentCredits;

    private int $attemptedCredits;

    private int $maxCredits;

    public function __construct(int $currentCredits, int $attemptedCredits, int $maxCredits, int $code = 422, ?\Exception $previous = null)
    {
        $this->currentCredits = $currentCredits;
        $this->attemptedCredits = $attemptedCredits;
        $this->maxCredits = $maxCredits;

        $message = 'Cannot enroll: adding this course would bring total credits to '
            .($currentCredits + $attemptedCredits)
            .", which exceeds the maximum of {$maxCredits} credit hours per term.";

        parent::__construct($message, null, $code, $previous);
    }

    public function getCurrentCredits(): int
    {
        return $this->currentCredits;
    }

    public function getAttemptedCredits(): int
    {
        return $this->attemptedCredits;
    }

    public function getMaxCredits(): int
    {
        return $this->maxCredits;
    }
}
