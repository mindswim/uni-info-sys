<?php

namespace App\Exceptions;

class RepeatCourseException extends BusinessRuleViolationException
{
    public function __construct(string $courseCode, string $existingGrade, int $code = 422, ?\Exception $previous = null)
    {
        $message = "Cannot enroll: you have already passed {$courseCode} with a grade of {$existingGrade}. "
            . "Repeat enrollment is only allowed for courses with failing or withdrawn grades (F, W, D, D-).";

        parent::__construct($message, null, $code, $previous);
    }
}
