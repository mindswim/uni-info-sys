<?php

namespace App\Exceptions;

use Exception;
use Illuminate\Http\JsonResponse;

class GradingDeadlinePassedException extends Exception
{
    public function render($request): JsonResponse
    {
        return response()->json([
            'message' => $this->getMessage(),
            'error_code' => 'GRADING_DEADLINE_PASSED',
        ], 422);
    }
}
