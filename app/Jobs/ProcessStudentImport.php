<?php

namespace App\Jobs;

use App\Models\Program;
use App\Models\Student;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * Process Student CSV Import
 *
 * Imports students from CSV with the following columns:
 * - first_name, last_name, email, date_of_birth, gender
 * - nationality, phone, address, city, state, postal_code, country
 * - program_code (for major_program_id lookup)
 * - enrollment_status, class_standing
 */
class ProcessStudentImport extends AbstractCsvImportJob
{
    protected function getEntityName(): string
    {
        return 'Students';
    }

    protected function getRequiredHeaders(): array
    {
        return [
            'first_name',
            'last_name',
            'email',
            'date_of_birth',
        ];
    }

    protected function getOptionalHeaders(): array
    {
        return [
            'gender',
            'nationality',
            'phone',
            'address',
            'city',
            'state',
            'postal_code',
            'country',
            'program_code', // Lookup major program
            'enrollment_status',
            'class_standing',
            'emergency_contact_name',
            'emergency_contact_phone',
            'high_school',
            'high_school_graduation_year',
            'sat_score',
            'act_score',
        ];
    }

    protected function getValidationRules(array $data): array
    {
        return [
            'first_name' => 'required|string|max:100',
            'last_name' => 'required|string|max:100',
            'email' => 'required|email|max:255',
            'date_of_birth' => 'required|date|before:today',
            'gender' => 'nullable|string|in:Male,Female,Other,Prefer not to say',
            'nationality' => 'nullable|string|max:100',
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string|max:255',
            'city' => 'nullable|string|max:100',
            'state' => 'nullable|string|max:100',
            'postal_code' => 'nullable|string|max:20',
            'country' => 'nullable|string|max:100',
            'program_code' => 'nullable|string|exists:programs,code',
            'enrollment_status' => 'nullable|string|in:Enrolled,Leave of Absence,Withdrawn,Graduated',
            'class_standing' => 'nullable|string|in:Freshman,Sophomore,Junior,Senior,Graduate',
            'emergency_contact_name' => 'nullable|string|max:255',
            'emergency_contact_phone' => 'nullable|string|max:20',
            'high_school' => 'nullable|string|max:255',
            'high_school_graduation_year' => 'nullable|integer|min:1900|max:'.(date('Y') + 10),
            'sat_score' => 'nullable|integer|min:400|max:1600',
            'act_score' => 'nullable|integer|min:1|max:36',
        ];
    }

    protected function getValidationMessages(): array
    {
        return [
            'first_name.required' => 'First name is required',
            'last_name.required' => 'Last name is required',
            'email.required' => 'Email is required',
            'email.email' => 'Email must be a valid email address',
            'date_of_birth.required' => 'Date of birth is required',
            'date_of_birth.date' => 'Date of birth must be a valid date',
            'date_of_birth.before' => 'Date of birth must be in the past',
            'gender.in' => 'Gender must be one of: Male, Female, Other, Prefer not to say',
            'program_code.exists' => 'Program code does not exist in the system',
            'enrollment_status.in' => 'Invalid enrollment status',
            'class_standing.in' => 'Invalid class standing',
        ];
    }

    protected function processRow(array $data, int $rowNumber, array &$stats): void
    {
        // Check if user exists by email
        $existingUser = User::where('email', $data['email'])->first();
        $isUpdate = $existingUser !== null;

        // Find program if provided
        $programId = null;
        if (! empty($data['program_code'])) {
            $program = Program::where('code', $data['program_code'])->first();
            if ($program) {
                $programId = $program->id;
            }
        }

        // Create or update user account
        $userAttributes = [
            'name' => trim($data['first_name'].' '.$data['last_name']),
            'email' => $data['email'],
        ];

        if (! $isUpdate) {
            // Generate password for new users (they should reset it)
            $userAttributes['password'] = Hash::make(Str::random(16));
        }

        $user = User::updateOrCreate(
            ['email' => $data['email']],
            $userAttributes
        );

        // Assign Student role if not already assigned
        if (! $user->hasRole('Student')) {
            $studentRole = \App\Models\Role::where('name', 'Student')->first();
            if ($studentRole) {
                $user->roles()->syncWithoutDetaching([$studentRole->id]);
            }
        }

        // Generate student number if creating new student
        $studentData = Student::where('user_id', $user->id)->first();
        $studentNumber = $studentData?->student_number ?? $this->generateStudentNumber();

        // Prepare student attributes
        $studentAttributes = [
            'student_number' => $studentNumber,
            'first_name' => $data['first_name'],
            'last_name' => $data['last_name'],
            'date_of_birth' => $data['date_of_birth'],
            'gender' => $data['gender'] ?? null,
            'nationality' => $data['nationality'] ?? null,
            'phone' => $data['phone'] ?? null,
            'address' => $data['address'] ?? null,
            'city' => $data['city'] ?? null,
            'state' => $data['state'] ?? null,
            'postal_code' => $data['postal_code'] ?? null,
            'country' => $data['country'] ?? null,
            'major_program_id' => $programId,
            'enrollment_status' => $data['enrollment_status'] ?? 'Enrolled',
            'class_standing' => $data['class_standing'] ?? 'Freshman',
            'emergency_contact_name' => $data['emergency_contact_name'] ?? null,
            'emergency_contact_phone' => $data['emergency_contact_phone'] ?? null,
            'high_school' => $data['high_school'] ?? null,
            'high_school_graduation_year' => $data['high_school_graduation_year'] ?? null,
            'sat_score' => $data['sat_score'] ?? null,
            'act_score' => $data['act_score'] ?? null,
        ];

        // Create or update student record
        $student = Student::updateOrCreate(
            ['user_id' => $user->id],
            $studentAttributes
        );

        if ($isUpdate) {
            $stats['updated']++;
        } else {
            $stats['created']++;
        }

        $stats['successful']++;
    }

    /**
     * Generate unique student number
     */
    private function generateStudentNumber(): string
    {
        $year = date('y');
        $randomPart = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);
        $studentNumber = "S{$year}{$randomPart}";

        // Ensure uniqueness
        while (Student::where('student_number', $studentNumber)->exists()) {
            $randomPart = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);
            $studentNumber = "S{$year}{$randomPart}";
        }

        return $studentNumber;
    }
}
