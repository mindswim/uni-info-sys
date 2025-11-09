<?php

namespace App\Exceptions;

use Exception;
use Illuminate\Http\JsonResponse;

class UnauthorizedGradeSubmissionException extends Exception
{
    public function render($request): JsonResponse
    {
        return response()->json([
            'message' => $this->getMessage(),
            'error_code' => 'UNAUTHORIZED_GRADE_SUBMISSION',
        ], 403);
    }
}
