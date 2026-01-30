<?php

namespace App\Jobs;

use App\Models\Course;
use App\Models\Department;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class ProcessCourseImport implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected string $filePath;

    protected int $userId;

    protected string $importId;

    protected string $originalFileName;

    /**
     * Create a new job instance.
     */
    public function __construct(string $filePath, int $userId, string $importId, string $originalFileName)
    {
        $this->filePath = $filePath;
        $this->userId = $userId;
        $this->importId = $importId;
        $this->originalFileName = $originalFileName;
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        $user = User::find($this->userId);
        $logFile = "imports/logs/{$this->importId}_errors.log";

        $stats = [
            'total_rows' => 0,
            'successful' => 0,
            'failed' => 0,
            'updated' => 0,
            'created' => 0,
            'errors' => [],
        ];

        try {
            // Get the file contents
            $csvContent = Storage::disk('local')->get($this->filePath);

            if (empty($csvContent)) {
                throw new \Exception('CSV file is empty or could not be read.');
            }

            // Parse CSV
            $lines = str_getcsv($csvContent, "\n");

            if (empty($lines)) {
                throw new \Exception('No data found in CSV file.');
            }

            // Get headers from first line
            $headers = str_getcsv(array_shift($lines));
            $expectedHeaders = ['course_code', 'title', 'description', 'credits', 'department_code', 'prerequisite_course_codes'];

            // Validate CSV headers
            $missingHeaders = array_diff($expectedHeaders, array_map('trim', $headers));
            if (! empty($missingHeaders)) {
                // Allow missing optional headers
                $requiredHeaders = ['course_code', 'title', 'credits', 'department_code'];
                $missingRequired = array_intersect($missingHeaders, $requiredHeaders);

                if (! empty($missingRequired)) {
                    throw new \Exception('Missing required headers: '.implode(', ', $missingRequired));
                }
            }

            // Map headers to indices
            $headerMap = array_flip(array_map('trim', $headers));

            Log::info('Starting course import', [
                'import_id' => $this->importId,
                'user_id' => $this->userId,
                'total_rows' => count($lines),
            ]);

            $stats['total_rows'] = count($lines);

            // Process each row
            foreach ($lines as $lineNumber => $line) {
                $rowNumber = $lineNumber + 2; // +2 because we removed header and line numbers start at 0

                try {
                    $row = str_getcsv($line);

                    // Skip empty rows
                    if (empty(array_filter($row))) {
                        continue;
                    }

                    // Extract data using header mapping
                    $courseData = $this->extractCourseData($row, $headerMap);

                    // Validate the data
                    $validator = $this->validateCourseData($courseData, $rowNumber);

                    if ($validator->fails()) {
                        $this->logError($logFile, $rowNumber, 'Validation failed', $validator->errors()->toArray(), $stats);

                        continue;
                    }

                    // Process the course in a transaction
                    DB::transaction(function () use ($courseData, $rowNumber, &$stats) {
                        $this->processCourse($courseData, $rowNumber, $stats);
                    });

                } catch (\Exception $e) {
                    $this->logError($logFile, $rowNumber, 'Processing error', $e->getMessage(), $stats);
                }
            }

            // Send completion notification
            $this->sendCompletionNotification($user, $stats);

        } catch (\Exception $e) {
            Log::error('Course import failed', [
                'import_id' => $this->importId,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            $this->logError($logFile, 0, 'Import failed', $e->getMessage(), $stats);
            $this->sendFailureNotification($user, $e->getMessage());
        } finally {
            // Clean up the uploaded file
            Storage::disk('local')->delete($this->filePath);
        }
    }

    /**
     * Extract course data from CSV row
     */
    private function extractCourseData(array $row, array $headerMap): array
    {
        return [
            'course_code' => trim($row[$headerMap['course_code']] ?? ''),
            'title' => trim($row[$headerMap['title']] ?? ''),
            'description' => trim($row[$headerMap['description']] ?? ''),
            'credits' => trim($row[$headerMap['credits']] ?? ''),
            'department_code' => trim($row[$headerMap['department_code']] ?? ''),
            'prerequisite_course_codes' => trim($row[$headerMap['prerequisite_course_codes']] ?? ''),
        ];
    }

    /**
     * Validate course data
     */
    private function validateCourseData(array $data, int $rowNumber): \Illuminate\Validation\Validator
    {
        return Validator::make($data, [
            'course_code' => 'required|string|max:20',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'credits' => 'required|integer|min:1|max:10',
            'department_code' => 'required|string|exists:departments,code',
            'prerequisite_course_codes' => 'nullable|string',
        ], [
            'course_code.required' => 'Course code is required',
            'course_code.max' => 'Course code must not exceed 20 characters',
            'title.required' => 'Course title is required',
            'title.max' => 'Course title must not exceed 255 characters',
            'credits.required' => 'Credits is required',
            'credits.integer' => 'Credits must be a number',
            'credits.min' => 'Credits must be at least 1',
            'credits.max' => 'Credits must not exceed 10',
            'department_code.required' => 'Department code is required',
            'department_code.exists' => 'Department code does not exist in the system',
        ]);
    }

    /**
     * Process a single course
     */
    private function processCourse(array $data, int $rowNumber, array &$stats): void
    {
        // Find the department
        $department = Department::where('code', $data['department_code'])->first();

        if (! $department) {
            throw new \Exception("Department with code '{$data['department_code']}' not found");
        }

        // Check if course exists
        $existingCourse = Course::where('course_code', $data['course_code'])->first();
        $isUpdate = $existingCourse !== null;

        // Prepare course data
        $courseAttributes = [
            'title' => $data['title'],
            'description' => $data['description'] ?: null,
            'credits' => (int) $data['credits'],
            'department_id' => $department->id,
        ];

        // Create or update course
        $course = Course::updateOrCreate(
            ['course_code' => $data['course_code']],
            $courseAttributes
        );

        if ($isUpdate) {
            $stats['updated']++;
        } else {
            $stats['created']++;
        }

        // Handle prerequisites
        if (! empty($data['prerequisite_course_codes'])) {
            $this->processPrerequisites($course, $data['prerequisite_course_codes']);
        }

        $stats['successful']++;
    }

    /**
     * Process course prerequisites
     */
    private function processPrerequisites(Course $course, string $prerequisiteCodes): void
    {
        $codes = array_map('trim', explode(',', $prerequisiteCodes));
        $codes = array_filter($codes); // Remove empty values

        if (empty($codes)) {
            return;
        }

        // Find prerequisite courses
        $prerequisites = Course::whereIn('course_code', $codes)->get();
        $foundCodes = $prerequisites->pluck('course_code')->toArray();
        $missingCodes = array_diff($codes, $foundCodes);

        if (! empty($missingCodes)) {
            Log::warning('Some prerequisite courses not found', [
                'course_code' => $course->course_code,
                'missing_prerequisites' => $missingCodes,
            ]);
        }

        // Sync prerequisites (this replaces all existing prerequisites)
        $course->prerequisiteCourses()->sync($prerequisites->pluck('id')->toArray());
    }

    /**
     * Log error to file and stats
     */
    private function logError(string $logFile, int $rowNumber, string $type, $details, array &$stats): void
    {
        $stats['failed']++;

        $errorMessage = is_array($details) ? json_encode($details, JSON_PRETTY_PRINT) : $details;
        $logEntry = "Row {$rowNumber}: {$type} - {$errorMessage}\n";

        Storage::disk('local')->append($logFile, $logEntry);

        $stats['errors'][] = [
            'row' => $rowNumber,
            'type' => $type,
            'details' => $details,
        ];
    }

    /**
     * Send completion notification
     */
    private function sendCompletionNotification(User $user, array $stats): void
    {
        $message = "Course import completed!\n\n";
        $message .= "File: {$this->originalFileName}\n";
        $message .= "Import ID: {$this->importId}\n\n";
        $message .= "Results:\n";
        $message .= "- Total rows processed: {$stats['total_rows']}\n";
        $message .= "- Successful: {$stats['successful']}\n";
        $message .= "- Failed: {$stats['failed']}\n";
        $message .= "- Created: {$stats['created']}\n";
        $message .= "- Updated: {$stats['updated']}\n";

        if ($stats['failed'] > 0) {
            $message .= "\nSome rows failed to import. Check the error log for details.";
        }

        Log::info('Course import completed', [
            'import_id' => $this->importId,
            'user_id' => $this->userId,
            'stats' => $stats,
        ]);

        // Here you could send an email notification, create a database notification, etc.
        // For now, we'll just log it
    }

    /**
     * Send failure notification
     */
    private function sendFailureNotification(User $user, string $error): void
    {
        $message = "Course import failed!\n\n";
        $message .= "File: {$this->originalFileName}\n";
        $message .= "Import ID: {$this->importId}\n\n";
        $message .= "Error: {$error}";

        Log::error('Course import failed notification', [
            'import_id' => $this->importId,
            'user_id' => $this->userId,
            'error' => $error,
        ]);

        // Here you could send an email notification, create a database notification, etc.
    }
}
