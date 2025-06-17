<?php

namespace App\Exceptions;

use Exception;

class ResourceNotFoundException extends Exception
{
    public function __construct(string $resource = 'Resource', int $id = null, int $code = 404, ?Exception $previous = null)
    {
        $message = $id 
            ? "{$resource} with ID {$id} not found"
            : "{$resource} not found";
            
        parent::__construct($message, $code, $previous);
    }
} 