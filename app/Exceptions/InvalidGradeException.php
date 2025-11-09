<?php

namespace App\Exceptions;

use Exception;
use Illuminate\Http\JsonResponse;

class InvalidGradeException extends Exception
{
    public function render($request): JsonResponse
    {
        return response()->json([
            'message' => $this->getMessage(),
            'error_code' => 'INVALID_GRADE',
        ], 422);
    }
}
