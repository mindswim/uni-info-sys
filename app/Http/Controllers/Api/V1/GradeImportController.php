<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreGradeImportRequest;
use App\Jobs\ProcessGradeImport;
use App\Models\CourseSection;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use OpenApi\Attributes as OA;

#[OA\Tag(
    name: 'Grade Import',
    description: 'API endpoints for bulk grade imports via CSV'
)]
class GradeImportController extends Controller
{
    /**
     * Import grades from CSV file for a specific course section
     */
    #[OA\Post(
        path: '/api/v1/course-sections/{courseSection}/import-grades',
        summary: 'Import grades from CSV file for a course section',
        description: 'Upload a CSV file to bulk import grades for students enrolled in a course section. Only the assigned instructor or admins can upload grades. The CSV must contain headers: student_id, grade.',
        security: [['sanctum' => []]],
        tags: ['Grade Import'],
        parameters: [
            new OA\Parameter(
                name: 'courseSection',
                description: 'Course section ID',
                in: 'path',
                required: true,
                schema: new OA\Schema(type: 'integer')
            ),
        ],
        requestBody: new OA\RequestBody(
            required: true,
            description: 'CSV file containing grade data',
            content: new OA\MediaType(
                mediaType: 'multipart/form-data',
                schema: new OA\Schema(ref: '#/components/schemas/StoreGradeImportRequest')
            )
        ),
        responses: [
            new OA\Response(
                response: 202,
                description: 'Grade import started successfully',
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: 'message', type: 'string', example: 'Grade import has been started. You will be notified when the process is complete.'),
                        new OA\Property(property: 'import_id', type: 'string', example: 'import_grades_2024-01-15_abc123'),
                        new OA\Property(property: 'file_name', type: 'string', example: 'grades_section_1.csv'),
                        new OA\Property(property: 'course_section', type: 'object', properties: [
                            new OA\Property(property: 'id', type: 'integer', example: 1),
                            new OA\Property(property: 'course_code', type: 'string', example: 'CS101'),
                            new OA\Property(property: 'section', type: 'string', example: 'Section A'),
                        ]),
                        new OA\Property(property: 'estimated_processing_time', type: 'string', example: 'Processing typically takes 1-2 minutes depending on file size.'),
                    ]
                )
            ),
            new OA\Response(
                response: 401,
                description: 'Unauthenticated'
            ),
            new OA\Response(
                response: 403,
                description: 'Forbidden - only assigned instructor or admin can upload grades'
            ),
            new OA\Response(
                response: 404,
                description: 'Course section not found'
            ),
            new OA\Response(
                response: 422,
                description: 'Validation error - invalid file format or size'
            ),
        ]
    )]
    public function store(StoreGradeImportRequest $request, CourseSection $courseSection): JsonResponse
    {
        // Authorization check - only instructor or admin can upload grades
        $user = $request->user();
        if (! $user->can('uploadGrades', $courseSection)) {
            return response()->json([
                'message' => 'You do not have permission to upload grades for this course section.',
                'error' => 'Only the assigned instructor or administrators can upload grades.',
            ], 403);
        }

        // Get the uploaded file
        $file = $request->file('file');
        $originalName = $file->getClientOriginalName();

        // Generate a unique filename for storage
        $importId = 'import_grades_'.now()->format('Y-m-d').'_'.Str::random(8);
        $fileName = $importId.'.csv';

        // Store the file in a private directory
        $filePath = $file->storeAs('imports/grades', $fileName, 'local');

        // Dispatch the background job to process the import
        ProcessGradeImport::dispatch($filePath, $user->id, $courseSection->id, $importId, $originalName);

        return response()->json([
            'message' => 'Grade import has been started. You will be notified when the process is complete.',
            'import_id' => $importId,
            'file_name' => $originalName,
            'course_section' => [
                'id' => $courseSection->id,
                'course_code' => $courseSection->course->course_code ?? 'N/A',
                'section' => "Section {$courseSection->id}", // Could be enhanced with actual section naming
            ],
            'estimated_processing_time' => 'Processing typically takes 1-2 minutes depending on file size.',
        ], 202);
    }
}
