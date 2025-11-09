#!/bin/bash

# This script adds CSV Import/Export routes for all remaining entities
# Run from project root: bash add-csv-to-all-entities.sh

echo "Adding CSV routes to routes/api.php..."

# Add all CSV routes after the Faculties CSV routes
cat >> routes/api.php << 'EOF'

    // Departments with CSV
    Route::post('departments/csv/import', [DepartmentController::class, 'importCsv']);
    Route::get('departments/csv/export', [DepartmentController::class, 'exportCsv']);
    Route::get('departments/csv/template', [DepartmentController::class, 'downloadTemplate']);

    // Programs with CSV
    Route::post('programs/csv/import', [ProgramController::class, 'importCsv']);
    Route::get('programs/csv/export', [ProgramController::class, 'exportCsv']);
    Route::get('programs/csv/template', [ProgramController::class, 'downloadTemplate']);

    // Terms with CSV
    Route::post('terms/csv/import', [TermController::class, 'importCsv']);
    Route::get('terms/csv/export', [TermController::class, 'exportCsv']);
    Route::get('terms/csv/template', [TermController::class, 'downloadTemplate']);

    // Buildings with CSV
    Route::post('buildings/csv/import', [BuildingController::class, 'importCsv']);
    Route::get('buildings/csv/export', [BuildingController::class, 'exportCsv']);
    Route::get('buildings/csv/template', [BuildingController::class, 'downloadTemplate']);

    // Rooms with CSV
    Route::post('rooms/csv/import', [RoomController::class, 'importCsv']);
    Route::get('rooms/csv/export', [RoomController::class, 'exportCsv']);
    Route::get('rooms/csv/template', [RoomController::class, 'downloadTemplate']);

    // Staff with CSV
    Route::post('staff/csv/import', [StaffController::class, 'importCsv']);
    Route::get('staff/csv/export', [StaffController::class, 'exportCsv']);
    Route::get('staff/csv/template', [StaffController::class, 'downloadTemplate']);

    // Course Sections with CSV
    Route::post('course-sections/csv/import', [CourseSectionController::class, 'importCsv']);
    Route::get('course-sections/csv/export', [CourseSectionController::class, 'exportCsv']);
    Route::get('course-sections/csv/template', [CourseSectionController::class, 'downloadTemplate']);
EOF

echo "✅ CSV routes added to routes/api.php"
echo ""
echo "Next steps:"
echo "1. Add HandlesCsvImportExport trait to each controller"
echo "2. Implement the 5 required methods in each controller"
echo "3. Add CsvImportExport component to each frontend tab"
echo ""
echo "See the instructions below for each entity..."
