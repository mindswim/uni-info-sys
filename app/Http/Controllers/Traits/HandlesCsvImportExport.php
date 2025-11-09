<?php

namespace App\Http\Controllers\Traits;

use App\Services\CsvImportExportService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

/**
 * Trait HandlesCsvImportExport
 *
 * Provides reusable CSV import/export functionality for controllers.
 * Controllers using this trait must implement abstract methods to
 * define entity-specific behavior.
 *
 * @package App\Http\Controllers\Traits
 */
trait HandlesCsvImportExport
{
    protected CsvImportExportService $csvService;

    /**
     * Initialize the CSV service
     */
    public function initializeCsvService(): void
    {
        $this->csvService = app(CsvImportExportService::class);
    }

    /**
     * Get the entity name (e.g., 'students', 'courses')
     * Must be implemented by using controller
     */
    abstract protected function getEntityName(): string;

    /**
     * Get the job class for processing imports
     * Must return fully qualified class name of job
     */
    abstract protected function getImportJobClass(): string;

    /**
     * Get CSV headers for this entity
     * Must return array of header names
     */
    abstract protected function getCsvHeaders(): array;

    /**
     * Get sample CSV data for template
     * Optional - return empty array if no sample needed
     */
    protected function getSampleCsvData(): array
    {
        return [];
    }

    /**
     * Export entity data to CSV
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function exportCsv(Request $request): JsonResponse
    {
        try {
            $this->initializeCsvService();

            // Get data to export (implement in controller)
            $data = $this->getExportData($request);

            // Transform data to CSV format
            $csvContent = $this->csvService->exportToCsv(
                $data,
                $this->getCsvHeaders(),
                fn($item) => $this->transformToRow($item)
            );

            // Generate filename
            $entityName = $this->getEntityName();
            $timestamp = now()->format('Y-m-d_His');
            $filename = "{$entityName}_export_{$timestamp}.csv";

            // Return CSV as download
            return response()->json([
                'content' => base64_encode($csvContent),
                'filename' => $filename,
                'mime_type' => 'text/csv',
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Export failed',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Download blank CSV template
     *
     * @return JsonResponse
     */
    public function downloadTemplate(): JsonResponse
    {
        try {
            $this->initializeCsvService();

            $csvContent = $this->csvService->generateTemplate(
                $this->getCsvHeaders(),
                $this->getSampleCsvData()
            );

            $entityName = $this->getEntityName();
            $filename = "{$entityName}_template.csv";

            return response()->json([
                'content' => base64_encode($csvContent),
                'filename' => $filename,
                'mime_type' => 'text/csv',
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Template generation failed',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Import CSV file
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function importCsv(Request $request): JsonResponse
    {
        try {
            // Validate file upload
            $request->validate([
                'file' => 'required|file|mimes:csv,txt|max:10240' // 10MB max
            ]);

            $file = $request->file('file');
            $originalName = $file->getClientOriginalName();

            // Generate unique import ID
            $entityName = $this->getEntityName();
            $importId = "import_{$entityName}_" . now()->format('Y-m-d') . '_' . Str::random(8);
            $fileName = $importId . '.csv';

            // Store file
            $filePath = $file->storeAs("imports/{$entityName}", $fileName, 'local');

            // Dispatch import job
            $jobClass = $this->getImportJobClass();
            $jobClass::dispatch($filePath, auth()->id(), $importId, $originalName);

            return response()->json([
                'message' => ucfirst($entityName) . ' import has been started. You will be notified when the process is complete.',
                'import_id' => $importId,
                'file_name' => $originalName,
                'estimated_processing_time' => 'Processing typically takes 1-5 minutes depending on file size.'
            ], 202);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Import failed',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get data for export (must be implemented by controller)
     *
     * @param Request $request
     * @return \Illuminate\Support\Collection
     */
    abstract protected function getExportData(Request $request): \Illuminate\Support\Collection;

    /**
     * Transform model to CSV row (must be implemented by controller)
     *
     * @param mixed $item Model instance
     * @return array Row data matching CSV headers
     */
    abstract protected function transformToRow($item): array;
}
