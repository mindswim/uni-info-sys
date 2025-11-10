<?php

namespace App\Jobs;

use App\Models\User;
use App\Services\CsvImportExportService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

/**
 * Abstract CSV Import Job
 *
 * Base class for all CSV import jobs. Provides common functionality
 * for parsing, validating, and processing CSV files.
 *
 * Extending classes must implement abstract methods to define
 * entity-specific behavior.
 */
abstract class AbstractCsvImportJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected string $filePath;
    protected int $userId;
    protected string $importId;
    protected string $originalFileName;
    protected CsvImportExportService $csvService;

    /**
     * Create a new job instance
     */
    public function __construct(string $filePath, int $userId, string $importId, string $originalFileName)
    {
        $this->filePath = $filePath;
        $this->userId = $userId;
        $this->importId = $importId;
        $this->originalFileName = $originalFileName;
    }

    /**
     * Execute the job
     */
    public function handle(): void
    {
        $this->csvService = app(CsvImportExportService::class);
        $user = User::find($this->userId);
        $logFile = "imports/logs/{$this->importId}_errors.log";
        $stats = $this->csvService->createStatsTracker();

        try {
            // Parse CSV file
            $csvData = $this->csvService->parseCsv(
                $this->filePath,
                $this->getRequiredHeaders(),
                $this->getOptionalHeaders()
            );

            $headerMap = $csvData['headerMap'];
            $rows = $csvData['rows'];

            Log::info("{$this->getEntityName()} import started", [
                'import_id' => $this->importId,
                'user_id' => $this->userId,
                'total_rows' => count($rows)
            ]);

            $stats['total_rows'] = count($rows);

            // Process each row
            foreach ($rows as $lineNumber => $line) {
                $rowNumber = $lineNumber + 2; // +2 for header row and 0-based index

                try {
                    $row = str_getcsv($line);

                    // Skip empty rows
                    if (empty(array_filter($row))) {
                        $stats['skipped']++;
                        continue;
                    }

                    // Extract data from row
                    $data = $this->csvService->extractRowData($row, $headerMap, $this->getAllHeaders());

                    // Validate data
                    $validator = $this->csvService->validateRow(
                        $data,
                        $this->getValidationRules($data),
                        $this->getValidationMessages()
                    );

                    if ($validator->fails()) {
                        $this->csvService->logError(
                            $stats,
                            $logFile,
                            $rowNumber,
                            'Validation failed',
                            $validator->errors()->toArray()
                        );
                        continue;
                    }

                    // Process the row in a database transaction
                    DB::transaction(function () use ($data, $rowNumber, &$stats) {
                        $this->processRow($data, $rowNumber, $stats);
                    });

                } catch (\Exception $e) {
                    $this->csvService->logError(
                        $stats,
                        $logFile,
                        $rowNumber,
                        'Processing error',
                        $e->getMessage()
                    );
                }
            }

            // Send completion notification
            $this->sendCompletionNotification($user, $stats);

        } catch (\Exception $e) {
            Log::error("{$this->getEntityName()} import failed", [
                'import_id' => $this->importId,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            $this->csvService->logError($stats, $logFile, 0, 'Import failed', $e->getMessage());
            $this->sendFailureNotification($user, $e->getMessage());

        } finally {
            // Clean up the uploaded file
            Storage::disk('local')->delete($this->filePath);
        }
    }

    /**
     * Get entity name (e.g., 'Students', 'Courses')
     */
    abstract protected function getEntityName(): string;

    /**
     * Get required CSV headers
     */
    abstract protected function getRequiredHeaders(): array;

    /**
     * Get optional CSV headers
     */
    abstract protected function getOptionalHeaders(): array;

    /**
     * Get all headers (required + optional)
     */
    protected function getAllHeaders(): array
    {
        return array_merge($this->getRequiredHeaders(), $this->getOptionalHeaders());
    }

    /**
     * Get validation rules for row data
     *
     * @param array $data Row data
     * @return array Laravel validation rules
     */
    abstract protected function getValidationRules(array $data): array;

    /**
     * Get custom validation messages
     */
    abstract protected function getValidationMessages(): array;

    /**
     * Process a single CSV row
     *
     * @param array $data Validated row data
     * @param int $rowNumber Row number in CSV
     * @param array $stats Statistics tracker (passed by reference)
     * @return void
     */
    abstract protected function processRow(array $data, int $rowNumber, array &$stats): void;

    /**
     * Send completion notification to user
     */
    protected function sendCompletionNotification(User $user, array $stats): void
    {
        $message = $this->csvService->formatCompletionMessage(
            $this->getEntityName(),
            $this->importId,
            $this->originalFileName,
            $stats
        );

        Log::info("{$this->getEntityName()} import completed", [
            'import_id' => $this->importId,
            'user_id' => $this->userId,
            'stats' => $stats
        ]);

        // TODO: Send actual notification (email, database notification, etc.)
        // For now, just logging
    }

    /**
     * Send failure notification to user
     */
    protected function sendFailureNotification(User $user, string $error): void
    {
        $message = "{$this->getEntityName()} import failed!\n\n";
        $message .= "File: {$this->originalFileName}\n";
        $message .= "Import ID: {$this->importId}\n\n";
        $message .= "Error: {$error}";

        Log::error("{$this->getEntityName()} import failed notification", [
            'import_id' => $this->importId,
            'user_id' => $this->userId,
            'error' => $error
        ]);

        // TODO: Send actual notification (email, database notification, etc.)
    }
}
