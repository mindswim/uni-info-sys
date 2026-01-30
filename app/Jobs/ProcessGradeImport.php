<?php

namespace App\Jobs;

use App\Models\CourseSection;
use App\Models\Enrollment;
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

class ProcessGradeImport implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected string $filePath;

    protected int $userId;

    protected int $courseSectionId;

    protected string $importId;

    protected string $originalFileName;

    // Valid grade values
    protected array $validGrades = [
        'A+', 'A', 'A-',
        'B+', 'B', 'B-',
        'C+', 'C', 'C-',
        'D+', 'D', 'D-',
        'F', 'I', 'W', 'P', 'NP',
    ];

    /**
     * Create a new job instance.
     */
    public function __construct(string $filePath, int $userId, int $courseSectionId, string $importId, string $originalFileName)
    {
        $this->filePath = $filePath;
        $this->userId = $userId;
        $this->courseSectionId = $courseSectionId;
        $this->importId = $importId;
        $this->originalFileName = $originalFileName;
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        $user = User::find($this->userId);
        $courseSection = CourseSection::find($this->courseSectionId);
        $logFile = "imports/logs/{$this->importId}_errors.log";

        $stats = [
            'total_rows' => 0,
            'successful' => 0,
            'failed' => 0,
            'updated' => 0,
            'skipped' => 0,
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
            $expectedHeaders = ['student_id', 'grade'];

            // Validate CSV headers
            $missingHeaders = array_diff($expectedHeaders, array_map('trim', $headers));
            if (! empty($missingHeaders)) {
                throw new \Exception('Missing required headers: '.implode(', ', $missingHeaders));
            }

            // Map headers to indices
            $headerMap = array_flip(array_map('trim', $headers));

            Log::info('Starting grade import', [
                'import_id' => $this->importId,
                'user_id' => $this->userId,
                'course_section_id' => $this->courseSectionId,
                'total_rows' => count($lines),
            ]);

            $stats['total_rows'] = count($lines);

            // Get all enrollments for this course section for efficient lookup
            $enrollments = Enrollment::where('course_section_id', $this->courseSectionId)
                ->with('student')
                ->get()
                ->keyBy('student_id');

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
                    $gradeData = $this->extractGradeData($row, $headerMap);

                    // Validate the data
                    $validator = $this->validateGradeData($gradeData, $rowNumber);

                    if ($validator->fails()) {
                        $this->logError($logFile, $rowNumber, 'Validation failed', $validator->errors()->toArray(), $stats);

                        continue;
                    }

                    // Process the grade in a transaction
                    DB::transaction(function () use ($gradeData, $rowNumber, &$stats, $enrollments) {
                        $this->processGrade($gradeData, $rowNumber, $stats, $enrollments);
                    });

                } catch (\Exception $e) {
                    $this->logError($logFile, $rowNumber, 'Processing error', $e->getMessage(), $stats);
                }
            }

            // Send completion notification
            $this->sendCompletionNotification($user, $courseSection, $stats);

        } catch (\Exception $e) {
            Log::error('Grade import failed', [
                'import_id' => $this->importId,
                'course_section_id' => $this->courseSectionId,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            $this->logError($logFile, 0, 'Import failed', $e->getMessage(), $stats);
            $this->sendFailureNotification($user, $courseSection, $e->getMessage());
        } finally {
            // Clean up the uploaded file
            Storage::disk('local')->delete($this->filePath);
        }
    }

    /**
     * Extract grade data from CSV row
     */
    private function extractGradeData(array $row, array $headerMap): array
    {
        return [
            'student_id' => trim($row[$headerMap['student_id']] ?? ''),
            'grade' => trim(strtoupper($row[$headerMap['grade']] ?? '')),
        ];
    }

    /**
     * Validate grade data
     */
    private function validateGradeData(array $data, int $rowNumber): \Illuminate\Validation\Validator
    {
        return Validator::make($data, [
            'student_id' => 'required|integer|min:1',
            'grade' => 'required|string|in:'.implode(',', $this->validGrades),
        ], [
            'student_id.required' => 'Student ID is required',
            'student_id.integer' => 'Student ID must be a number',
            'student_id.min' => 'Student ID must be a positive number',
            'grade.required' => 'Grade is required',
            'grade.in' => 'Grade must be one of: '.implode(', ', $this->validGrades),
        ]);
    }

    /**
     * Process a single grade
     */
    private function processGrade(array $data, int $rowNumber, array &$stats, $enrollments): void
    {
        $studentId = (int) $data['student_id'];
        $grade = $data['grade'];

        // Check if student is enrolled in this course section
        if (! $enrollments->has($studentId)) {
            throw new \Exception("Student ID {$studentId} is not enrolled in this course section");
        }

        $enrollment = $enrollments->get($studentId);

        // Check if grade is already set to the same value
        if ($enrollment->grade === $grade) {
            $stats['skipped']++;
            Log::info('Grade skipped - already set', [
                'student_id' => $studentId,
                'grade' => $grade,
                'enrollment_id' => $enrollment->id,
            ]);

            return;
        }

        // Update the grade
        $oldGrade = $enrollment->grade;
        $enrollment->grade = $grade;
        $enrollment->save();

        $stats['updated']++;
        $stats['successful']++;

        Log::info('Grade updated', [
            'student_id' => $studentId,
            'enrollment_id' => $enrollment->id,
            'old_grade' => $oldGrade,
            'new_grade' => $grade,
        ]);
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
    private function sendCompletionNotification(User $user, CourseSection $courseSection, array $stats): void
    {
        $courseName = $courseSection->course->course_code ?? 'Unknown Course';

        $message = "Grade import completed!\n\n";
        $message .= "Course: {$courseName} (Section {$courseSection->id})\n";
        $message .= "File: {$this->originalFileName}\n";
        $message .= "Import ID: {$this->importId}\n\n";
        $message .= "Results:\n";
        $message .= "- Total rows processed: {$stats['total_rows']}\n";
        $message .= "- Successful: {$stats['successful']}\n";
        $message .= "- Failed: {$stats['failed']}\n";
        $message .= "- Updated: {$stats['updated']}\n";
        $message .= "- Skipped (already set): {$stats['skipped']}\n";

        if ($stats['failed'] > 0) {
            $message .= "\nSome rows failed to import. Check the error log for details.";
        }

        Log::info('Grade import completed', [
            'import_id' => $this->importId,
            'user_id' => $this->userId,
            'course_section_id' => $this->courseSectionId,
            'stats' => $stats,
        ]);

        // Here you could send an email notification, create a database notification, etc.
        // For now, we'll just log it
    }

    /**
     * Send failure notification
     */
    private function sendFailureNotification(User $user, CourseSection $courseSection, string $error): void
    {
        $courseName = $courseSection->course->course_code ?? 'Unknown Course';

        $message = "Grade import failed!\n\n";
        $message .= "Course: {$courseName} (Section {$courseSection->id})\n";
        $message .= "File: {$this->originalFileName}\n";
        $message .= "Import ID: {$this->importId}\n\n";
        $message .= "Error: {$error}";

        Log::error('Grade import failed notification', [
            'import_id' => $this->importId,
            'user_id' => $this->userId,
            'course_section_id' => $this->courseSectionId,
            'error' => $error,
        ]);

        // Here you could send an email notification, create a database notification, etc.
    }
}
