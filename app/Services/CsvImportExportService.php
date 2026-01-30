<?php

namespace App\Services;

use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

/**
 * Universal CSV Import/Export Service
 *
 * Provides reusable CSV operations for any model with validation,
 * error handling, and template generation.
 */
class CsvImportExportService
{
    /**
     * Parse CSV file and return validated rows
     *
     * @param  string  $filePath  Storage path to CSV file
     * @param  array  $requiredHeaders  Expected headers in CSV
     * @param  array  $optionalHeaders  Headers that can be missing
     * @return array ['headers' => array, 'rows' => array, 'headerMap' => array]
     *
     * @throws \Exception
     */
    public function parseCsv(string $filePath, array $requiredHeaders, array $optionalHeaders = []): array
    {
        $csvContent = Storage::disk('local')->get($filePath);

        if (empty($csvContent)) {
            throw new \Exception('CSV file is empty or could not be read.');
        }

        // Parse CSV using str_getcsv for consistency with existing code
        $lines = str_getcsv($csvContent, "\n");

        if (empty($lines)) {
            throw new \Exception('No data found in CSV file.');
        }

        // Get headers from first line
        $headers = str_getcsv(array_shift($lines));
        $headers = array_map('trim', $headers);

        // Validate headers
        $missingHeaders = array_diff($requiredHeaders, $headers);
        if (! empty($missingHeaders)) {
            throw new \Exception('Missing required headers: '.implode(', ', $missingHeaders));
        }

        // Create header mapping (header name => column index)
        $headerMap = array_flip($headers);

        return [
            'headers' => $headers,
            'rows' => $lines,
            'headerMap' => $headerMap,
        ];
    }

    /**
     * Extract data from CSV row using header mapping
     *
     * @param  array  $row  CSV row data
     * @param  array  $headerMap  Header to index mapping
     * @param  array  $fields  Fields to extract (header names)
     * @return array Extracted data
     */
    public function extractRowData(array $row, array $headerMap, array $fields): array
    {
        $data = [];

        foreach ($fields as $field) {
            $data[$field] = isset($headerMap[$field]) && isset($row[$headerMap[$field]])
                ? trim($row[$headerMap[$field]])
                : '';
        }

        return $data;
    }

    /**
     * Validate row data against validation rules
     *
     * @param  array  $data  Data to validate
     * @param  array  $rules  Laravel validation rules
     * @param  array  $messages  Custom error messages
     */
    public function validateRow(array $data, array $rules, array $messages = []): \Illuminate\Validation\Validator
    {
        return Validator::make($data, $rules, $messages);
    }

    /**
     * Generate CSV template with headers
     *
     * @param  array  $headers  CSV headers
     * @param  array  $sampleData  Optional sample data row
     * @return string CSV content
     */
    public function generateTemplate(array $headers, array $sampleData = []): string
    {
        $output = fopen('php://temp', 'r+');

        // Add headers
        fputcsv($output, $headers);

        // Add sample data if provided
        if (! empty($sampleData)) {
            fputcsv($output, $sampleData);
        }

        rewind($output);
        $csv = stream_get_contents($output);
        fclose($output);

        return $csv;
    }

    /**
     * Export collection to CSV
     *
     * @param  Collection  $data  Data to export
     * @param  array  $headers  CSV headers (column names)
     * @param  callable  $transformer  Function to transform each row
     * @return string CSV content
     */
    public function exportToCsv(Collection $data, array $headers, callable $transformer): string
    {
        $output = fopen('php://temp', 'r+');

        // Add headers
        fputcsv($output, $headers);

        // Transform and add rows
        foreach ($data as $item) {
            $row = $transformer($item);
            fputcsv($output, $row);
        }

        rewind($output);
        $csv = stream_get_contents($output);
        fclose($output);

        return $csv;
    }

    /**
     * Save CSV content to storage
     *
     * @param  string  $content  CSV content
     * @param  string  $directory  Storage directory
     * @param  string  $filename  File name
     * @return string Full storage path
     */
    public function saveCsv(string $content, string $directory, string $filename): string
    {
        $path = "{$directory}/{$filename}";
        Storage::disk('local')->put($path, $content);

        return $path;
    }

    /**
     * Create import statistics tracker
     *
     * @return array Initial stats structure
     */
    public function createStatsTracker(): array
    {
        return [
            'total_rows' => 0,
            'successful' => 0,
            'failed' => 0,
            'created' => 0,
            'updated' => 0,
            'skipped' => 0,
            'errors' => [],
        ];
    }

    /**
     * Log error to stats and file
     *
     * @param  array  $stats  Stats array (passed by reference)
     * @param  string  $logFile  Log file path
     * @param  int  $rowNumber  Row number
     * @param  string  $type  Error type
     * @param  mixed  $details  Error details
     */
    public function logError(array &$stats, string $logFile, int $rowNumber, string $type, $details): void
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
     * Format import completion message
     *
     * @param  string  $entityName  Entity type (e.g., 'Students', 'Courses')
     * @param  string  $importId  Import identifier
     * @param  string  $fileName  Original file name
     * @param  array  $stats  Statistics
     * @return string Formatted message
     */
    public function formatCompletionMessage(string $entityName, string $importId, string $fileName, array $stats): string
    {
        $message = "{$entityName} import completed!\n\n";
        $message .= "File: {$fileName}\n";
        $message .= "Import ID: {$importId}\n\n";
        $message .= "Results:\n";
        $message .= "- Total rows processed: {$stats['total_rows']}\n";
        $message .= "- Successful: {$stats['successful']}\n";
        $message .= "- Failed: {$stats['failed']}\n";
        $message .= "- Created: {$stats['created']}\n";
        $message .= "- Updated: {$stats['updated']}\n";

        if ($stats['failed'] > 0) {
            $message .= "\nSome rows failed to import. Check the error log for details.";
        }

        return $message;
    }
}
