<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreCourseImportRequest;
use App\Jobs\ProcessCourseImport;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use OpenApi\Attributes as OA;

#[OA\Tag(
    name: 'Course Import',
    description: 'API endpoints for bulk course imports via CSV'
)]
class CourseImportController extends Controller
{
    /**
     * Import courses from CSV file
     */
    #[OA\Post(
        path: '/api/v1/imports/courses',
        summary: 'Import courses from CSV file',
        description: 'Upload a CSV file to bulk import or update courses. Requires courses.manage permission. The CSV must contain headers: course_code, title, description, credits, department_code, prerequisite_course_codes.',
        security: [['sanctum' => []]],
        tags: ['Course Import'],
        requestBody: new OA\RequestBody(
            required: true,
            description: 'CSV file containing course data',
            content: new OA\MediaType(
                mediaType: 'multipart/form-data',
                schema: new OA\Schema(ref: '#/components/schemas/StoreCourseImportRequest')
            )
        ),
        responses: [
            new OA\Response(
                response: 202,
                description: 'Import started successfully',
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: 'message', type: 'string', example: 'Course import has been started. You will be notified when the process is complete.'),
                        new OA\Property(property: 'import_id', type: 'string', example: 'import_courses_2024-01-15_abc123'),
                        new OA\Property(property: 'file_name', type: 'string', example: 'courses_import.csv'),
                        new OA\Property(property: 'estimated_processing_time', type: 'string', example: 'Processing typically takes 1-5 minutes depending on file size.'),
                    ]
                )
            ),
            new OA\Response(
                response: 401,
                description: 'Unauthenticated'
            ),
            new OA\Response(
                response: 403,
                description: 'Forbidden - requires courses.manage permission'
            ),
            new OA\Response(
                response: 422,
                description: 'Validation error - invalid file format or size'
            ),
        ]
    )]
    public function store(StoreCourseImportRequest $request): JsonResponse
    {
        // Authorization is handled by middleware, but let's double-check
        $user = $request->user();
        if (! $user->hasPermission('courses.manage')) {
            return response()->json([
                'message' => 'You do not have permission to import courses.',
                'error' => 'Insufficient permissions',
            ], 403);
        }

        // Get the uploaded file
        $file = $request->file('file');
        $originalName = $file->getClientOriginalName();

        // Generate a unique filename for storage
        $importId = 'import_courses_'.now()->format('Y-m-d').'_'.Str::random(8);
        $fileName = $importId.'.csv';

        // Store the file in a private directory
        $filePath = $file->storeAs('imports/courses', $fileName, 'local');

        // Dispatch the background job to process the import
        ProcessCourseImport::dispatch($filePath, $user->id, $importId, $originalName);

        return response()->json([
            'message' => 'Course import has been started. You will be notified when the process is complete.',
            'import_id' => $importId,
            'file_name' => $originalName,
            'estimated_processing_time' => 'Processing typically takes 1-5 minutes depending on file size.',
        ], 202);
    }
}
