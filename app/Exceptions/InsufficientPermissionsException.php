<?php

namespace App\Exceptions;

use Exception;

class InsufficientPermissionsException extends Exception
{
    public function __construct(string $action = 'perform this action', string $resource = 'resource', int $code = 403, ?Exception $previous = null)
    {
        $message = "Insufficient permissions to {$action} on {$resource}";
        parent::__construct($message, $code, $previous);
    }
} 