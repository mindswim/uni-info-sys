<?php

namespace Database\Seeders;

use App\Models\ActionItem;
use App\Models\Hold;
use App\Models\Student;
use App\Models\User;
use Illuminate\Database\Seeder;

class HoldsAndActionItemsSeeder extends Seeder
{
    public function run(): void
    {
        // Get demo students
        $maria = Student::whereHas('user', fn($q) => $q->where('email', 'maria@demo.com'))->first();
        $david = Student::whereHas('user', fn($q) => $q->where('email', 'david@demo.com'))->first();
        $sophie = Student::whereHas('user', fn($q) => $q->where('email', 'sophie@demo.com'))->first();

        // Get admin user for placing holds
        $admin = User::where('email', 'admin@demo.com')->first();

        if (!$admin) {
            $admin = User::whereHas('roles', fn($q) => $q->where('name', 'admin'))->first();
        }

        // Create holds for demo students
        if ($maria) {
            // Maria has a financial aid document hold
            Hold::create([
                'student_id' => $maria->id,
                'type' => Hold::TYPE_FINANCIAL,
                'reason' => 'Missing verification documents',
                'description' => 'Please submit your 2024 tax return and W-2 forms to the Financial Aid office.',
                'severity' => Hold::SEVERITY_WARNING,
                'prevents_registration' => true,
                'prevents_transcript' => false,
                'prevents_graduation' => false,
                'placed_by' => $admin?->id,
                'department' => 'Financial Aid',
                'placed_at' => now()->subDays(5),
            ]);

            // Action items for Maria
            ActionItem::create([
                'student_id' => $maria->id,
                'type' => ActionItem::TYPE_FINANCIAL_AID,
                'title' => 'Submit FAFSA for 2025-26',
                'description' => 'Complete your Free Application for Federal Student Aid for the upcoming academic year.',
                'priority' => ActionItem::PRIORITY_HIGH,
                'action_url' => '/student/financial-aid',
                'action_label' => 'Start FAFSA',
                'due_date' => now()->addDays(14),
                'source' => 'financial_aid_system',
            ]);

            ActionItem::create([
                'student_id' => $maria->id,
                'type' => ActionItem::TYPE_DOCUMENT,
                'title' => 'Upload verification documents',
                'description' => 'Submit your 2024 tax return and W-2 forms to complete financial aid verification.',
                'priority' => ActionItem::PRIORITY_URGENT,
                'action_url' => '/student/financial-aid',
                'action_label' => 'Upload Documents',
                'due_date' => now()->addDays(7),
                'source' => 'financial_aid_system',
            ]);

            ActionItem::create([
                'student_id' => $maria->id,
                'type' => ActionItem::TYPE_REGISTRATION,
                'title' => 'Register for Spring 2025',
                'description' => 'Course registration for Spring 2025 is now open. Select your classes before they fill up.',
                'priority' => ActionItem::PRIORITY_NORMAL,
                'action_url' => '/student/registration',
                'action_label' => 'Register Now',
                'due_date' => now()->addDays(21),
                'source' => 'registration_system',
            ]);
        }

        if ($david) {
            // David has an immunization hold
            Hold::create([
                'student_id' => $david->id,
                'type' => Hold::TYPE_IMMUNIZATION,
                'reason' => 'Missing immunization records',
                'description' => 'Please submit proof of MMR vaccination or a waiver form to Student Health Services.',
                'severity' => Hold::SEVERITY_WARNING,
                'prevents_registration' => true,
                'prevents_transcript' => false,
                'prevents_graduation' => false,
                'placed_by' => $admin?->id,
                'department' => 'Student Health Services',
                'placed_at' => now()->subDays(10),
            ]);

            // Action items for David
            ActionItem::create([
                'student_id' => $david->id,
                'type' => ActionItem::TYPE_IMMUNIZATION,
                'title' => 'Submit immunization records',
                'description' => 'Upload your MMR vaccination records or complete a waiver form.',
                'priority' => ActionItem::PRIORITY_HIGH,
                'action_url' => '/student/holds',
                'action_label' => 'Upload Records',
                'due_date' => now()->addDays(5),
                'source' => 'health_services',
            ]);

            ActionItem::create([
                'student_id' => $david->id,
                'type' => ActionItem::TYPE_COURSE_EVAL,
                'title' => 'Complete course evaluations',
                'description' => 'Please complete evaluations for your Fall 2024 courses. Your feedback helps improve teaching.',
                'priority' => ActionItem::PRIORITY_NORMAL,
                'action_url' => '/student/course-evaluations',
                'action_label' => 'Start Evaluations',
                'due_date' => now()->addDays(3),
                'source' => 'academic_system',
            ]);

            ActionItem::create([
                'student_id' => $david->id,
                'type' => ActionItem::TYPE_ADVISING,
                'title' => 'Schedule advising appointment',
                'description' => 'Meet with your academic advisor before registering for next semester.',
                'priority' => ActionItem::PRIORITY_NORMAL,
                'action_url' => '/student/advisor',
                'action_label' => 'Schedule Meeting',
                'due_date' => now()->addDays(10),
                'source' => 'advising_system',
            ]);

            // Completed item
            ActionItem::create([
                'student_id' => $david->id,
                'type' => ActionItem::TYPE_PAYMENT,
                'title' => 'Pay tuition balance',
                'description' => 'Fall 2024 tuition payment was received.',
                'priority' => ActionItem::PRIORITY_NORMAL,
                'status' => ActionItem::STATUS_COMPLETED,
                'completed_at' => now()->subDays(15),
                'source' => 'billing_system',
            ]);
        }

        if ($sophie) {
            // Sophie has no holds but has action items
            ActionItem::create([
                'student_id' => $sophie->id,
                'type' => ActionItem::TYPE_REGISTRATION,
                'title' => 'Review waitlist status',
                'description' => 'You are on the waitlist for CS 401. Check your status and consider alternatives.',
                'priority' => ActionItem::PRIORITY_NORMAL,
                'action_url' => '/student/registration',
                'action_label' => 'View Waitlist',
                'due_date' => now()->addDays(2),
                'source' => 'registration_system',
            ]);

            ActionItem::create([
                'student_id' => $sophie->id,
                'type' => ActionItem::TYPE_GRADUATION,
                'title' => 'Apply for graduation',
                'description' => 'If you plan to graduate in Spring 2025, submit your graduation application.',
                'priority' => ActionItem::PRIORITY_HIGH,
                'action_url' => '/student/graduation',
                'action_label' => 'Apply Now',
                'due_date' => now()->addDays(30),
                'source' => 'registrar_system',
            ]);

            ActionItem::create([
                'student_id' => $sophie->id,
                'type' => ActionItem::TYPE_FINANCIAL_AID,
                'title' => 'Accept financial aid award',
                'description' => 'Review and accept your Spring 2025 financial aid package.',
                'priority' => ActionItem::PRIORITY_HIGH,
                'action_url' => '/student/financial-aid',
                'action_label' => 'View Award',
                'due_date' => now()->addDays(7),
                'source' => 'financial_aid_system',
            ]);
        }

        // Create some holds and action items for random students
        $randomStudents = Student::whereNotIn('id', array_filter([
            $maria?->id,
            $david?->id,
            $sophie?->id,
        ]))->inRandomOrder()->take(10)->get();

        foreach ($randomStudents as $student) {
            // 30% chance of having a hold
            if (rand(1, 100) <= 30) {
                $holdType = fake()->randomElement(Hold::TYPES);
                Hold::create([
                    'student_id' => $student->id,
                    'type' => $holdType,
                    'reason' => $this->getHoldReason($holdType),
                    'severity' => fake()->randomElement(Hold::SEVERITIES),
                    'prevents_registration' => $holdType !== Hold::TYPE_LIBRARY,
                    'placed_by' => $admin?->id,
                    'department' => $this->getHoldDepartment($holdType),
                    'placed_at' => now()->subDays(rand(1, 30)),
                ]);
            }

            // Everyone gets 1-3 action items
            $numItems = rand(1, 3);
            for ($i = 0; $i < $numItems; $i++) {
                $type = fake()->randomElement(ActionItem::TYPES);
                ActionItem::create([
                    'student_id' => $student->id,
                    'type' => $type,
                    'title' => $this->getActionItemTitle($type),
                    'description' => $this->getActionItemDescription($type),
                    'priority' => fake()->randomElement(ActionItem::PRIORITIES),
                    'due_date' => now()->addDays(rand(1, 30)),
                    'source' => 'system',
                ]);
            }
        }
    }

    private function getHoldReason(string $type): string
    {
        return match ($type) {
            Hold::TYPE_FINANCIAL => fake()->randomElement([
                'Outstanding balance',
                'Payment plan default',
                'Missing financial documents',
            ]),
            Hold::TYPE_ACADEMIC => fake()->randomElement([
                'Academic probation',
                'GPA below minimum requirement',
                'Incomplete coursework',
            ]),
            Hold::TYPE_IMMUNIZATION => 'Missing immunization records',
            Hold::TYPE_LIBRARY => 'Overdue library materials',
            Hold::TYPE_PARKING => 'Unpaid parking fines',
            default => 'Administrative review required',
        };
    }

    private function getHoldDepartment(string $type): string
    {
        return match ($type) {
            Hold::TYPE_FINANCIAL => 'Student Accounts',
            Hold::TYPE_ACADEMIC => 'Academic Affairs',
            Hold::TYPE_IMMUNIZATION => 'Student Health Services',
            Hold::TYPE_LIBRARY => 'University Library',
            Hold::TYPE_PARKING => 'Parking Services',
            default => 'Registrar',
        };
    }

    private function getActionItemTitle(string $type): string
    {
        return match ($type) {
            ActionItem::TYPE_REGISTRATION => 'Complete course registration',
            ActionItem::TYPE_FINANCIAL_AID => 'Review financial aid status',
            ActionItem::TYPE_PAYMENT => 'Make tuition payment',
            ActionItem::TYPE_DOCUMENT => 'Submit required documents',
            ActionItem::TYPE_ADVISING => 'Schedule advisor meeting',
            ActionItem::TYPE_COURSE_EVAL => 'Complete course evaluations',
            ActionItem::TYPE_IMMUNIZATION => 'Update health records',
            ActionItem::TYPE_ORIENTATION => 'Complete orientation modules',
            ActionItem::TYPE_GRADUATION => 'Submit graduation application',
            default => 'Complete required action',
        };
    }

    private function getActionItemDescription(string $type): string
    {
        return match ($type) {
            ActionItem::TYPE_REGISTRATION => 'Register for your courses before the deadline.',
            ActionItem::TYPE_FINANCIAL_AID => 'Review your financial aid package and complete any required steps.',
            ActionItem::TYPE_PAYMENT => 'Pay your outstanding balance to avoid late fees.',
            ActionItem::TYPE_DOCUMENT => 'Upload the required documents to your student portal.',
            ActionItem::TYPE_ADVISING => 'Meet with your academic advisor to discuss your academic plan.',
            ActionItem::TYPE_COURSE_EVAL => 'Your feedback helps improve the quality of instruction.',
            ActionItem::TYPE_IMMUNIZATION => 'Ensure your immunization records are up to date.',
            ActionItem::TYPE_ORIENTATION => 'Complete all required orientation activities.',
            ActionItem::TYPE_GRADUATION => 'Apply for graduation if you plan to complete your degree.',
            default => 'Please complete this required action.',
        };
    }
}
