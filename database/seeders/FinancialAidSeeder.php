<?php

namespace Database\Seeders;

use App\Models\Student;
use App\Models\Term;
use App\Models\Department;
use App\Models\Program;
use App\Models\Scholarship;
use App\Models\FinancialAidPackage;
use App\Models\AidAward;
use App\Models\AidDisbursement;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Log;

class FinancialAidSeeder extends Seeder
{
    // University cost of attendance components (annual)
    private const TUITION_IN_STATE = 12500;
    private const TUITION_OUT_OF_STATE = 32000;
    private const FEES = 1800;
    private const ROOM_BOARD = 14500;
    private const BOOKS_SUPPLIES = 1200;
    private const TRANSPORTATION = 1500;
    private const PERSONAL = 2000;

    // Federal loan limits (annual, first-year dependent)
    private const SUBSIDIZED_LOAN_LIMIT = 3500;
    private const UNSUBSIDIZED_LOAN_LIMIT = 2000;

    // Federal rates
    private const SUBSIDIZED_RATE = 5.50;
    private const UNSUBSIDIZED_RATE = 5.50;
    private const PLUS_RATE = 8.05;
    private const SUB_ORIGINATION_FEE = 1.057;
    private const UNSUB_ORIGINATION_FEE = 1.057;
    private const PLUS_ORIGINATION_FEE = 4.228;

    private array $scholarships = [];

    public function run(): void
    {
        Log::info('Seeding financial aid data...');

        $this->createScholarships();
        $this->createFinancialAidPackages();

        Log::info('Financial aid data seeded successfully!');
    }

    private function createScholarships(): void
    {
        $csDepartment = Department::where('code', 'CS')->first();
        $eeDepartment = Department::where('code', 'EE')->first();
        $busDepartment = Department::where('code', 'BUS')->first();

        $scholarshipData = [
            // Merit-based scholarships
            [
                'name' => 'Presidential Scholarship',
                'code' => 'PRES-SCHOL',
                'description' => 'The highest honor awarded to incoming freshmen who demonstrate exceptional academic achievement, leadership, and community involvement.',
                'type' => 'merit',
                'amount' => 25000,
                'amount_type' => 'fixed',
                'renewable' => true,
                'max_semesters' => 8,
                'min_gpa_required' => 3.90,
                'min_sat_required' => 1500,
                'available_slots' => 10,
                'is_active' => true,
                'eligibility_criteria' => 'Minimum 3.9 GPA and 1500 SAT. Must maintain 3.5 GPA for renewal.',
            ],
            [
                'name' => 'Dean\'s Excellence Award',
                'code' => 'DEAN-EXCEL',
                'description' => 'Recognizes students with outstanding academic records and demonstrated leadership potential.',
                'type' => 'merit',
                'amount' => 15000,
                'amount_type' => 'fixed',
                'renewable' => true,
                'max_semesters' => 8,
                'min_gpa_required' => 3.70,
                'min_sat_required' => 1400,
                'available_slots' => 25,
                'is_active' => true,
                'eligibility_criteria' => 'Minimum 3.7 GPA and 1400 SAT. Must maintain 3.3 GPA for renewal.',
            ],
            [
                'name' => 'Academic Achievement Scholarship',
                'code' => 'ACAD-ACHV',
                'description' => 'Awards students who have demonstrated strong academic performance throughout high school.',
                'type' => 'merit',
                'amount' => 8000,
                'amount_type' => 'fixed',
                'renewable' => true,
                'max_semesters' => 8,
                'min_gpa_required' => 3.50,
                'min_sat_required' => 1300,
                'available_slots' => 50,
                'is_active' => true,
                'eligibility_criteria' => 'Minimum 3.5 GPA and 1300 SAT. Must maintain 3.0 GPA for renewal.',
            ],
            [
                'name' => 'Merit Recognition Award',
                'code' => 'MERIT-REC',
                'description' => 'Provides support to academically talented students.',
                'type' => 'merit',
                'amount' => 5000,
                'amount_type' => 'fixed',
                'renewable' => true,
                'max_semesters' => 8,
                'min_gpa_required' => 3.30,
                'min_sat_required' => 1200,
                'available_slots' => 100,
                'is_active' => true,
                'eligibility_criteria' => 'Minimum 3.3 GPA and 1200 SAT. Must maintain 2.8 GPA for renewal.',
            ],

            // Need-based scholarships
            [
                'name' => 'University Need-Based Grant',
                'code' => 'UNIV-NEED',
                'description' => 'Institutional grant for students with demonstrated financial need.',
                'type' => 'need',
                'amount' => 12000,
                'amount_type' => 'fixed',
                'renewable' => true,
                'max_semesters' => 8,
                'max_family_income' => 60000,
                'available_slots' => null, // unlimited based on need
                'is_active' => true,
                'eligibility_criteria' => 'Based on FAFSA results and demonstrated financial need. Family income below $60,000.',
            ],
            [
                'name' => 'Access Opportunity Grant',
                'code' => 'ACCESS-OPP',
                'description' => 'Supports first-generation college students from low-income backgrounds.',
                'type' => 'need',
                'amount' => 8000,
                'amount_type' => 'fixed',
                'renewable' => true,
                'max_semesters' => 8,
                'max_family_income' => 45000,
                'available_slots' => 75,
                'is_active' => true,
                'eligibility_criteria' => 'First-generation college student with family income below $45,000.',
            ],

            // Departmental scholarships
            [
                'name' => 'Computer Science Excellence Scholarship',
                'code' => 'CS-EXCEL',
                'description' => 'For outstanding students pursuing a degree in Computer Science.',
                'type' => 'departmental',
                'amount' => 6000,
                'amount_type' => 'fixed',
                'renewable' => true,
                'max_semesters' => 8,
                'min_gpa_required' => 3.50,
                'department_id' => $csDepartment?->id,
                'available_slots' => 15,
                'is_active' => true,
                'eligibility_criteria' => 'CS majors with 3.5+ GPA. Preference for students with programming experience.',
            ],
            [
                'name' => 'Engineering Innovation Award',
                'code' => 'ENG-INNOV',
                'description' => 'Supports innovative students in the Electrical Engineering program.',
                'type' => 'departmental',
                'amount' => 5000,
                'amount_type' => 'fixed',
                'renewable' => true,
                'max_semesters' => 8,
                'min_gpa_required' => 3.40,
                'department_id' => $eeDepartment?->id,
                'available_slots' => 12,
                'is_active' => true,
                'eligibility_criteria' => 'EE majors with demonstrated interest in research or innovation.',
            ],
            [
                'name' => 'Business Leaders Scholarship',
                'code' => 'BUS-LEAD',
                'description' => 'For aspiring business leaders with strong academic and leadership credentials.',
                'type' => 'departmental',
                'amount' => 5500,
                'amount_type' => 'fixed',
                'renewable' => true,
                'max_semesters' => 8,
                'min_gpa_required' => 3.40,
                'department_id' => $busDepartment?->id,
                'available_slots' => 20,
                'is_active' => true,
                'eligibility_criteria' => 'Business majors with leadership experience.',
            ],

            // Endowed scholarships
            [
                'name' => 'Johnson Family Endowed Scholarship',
                'code' => 'JOHNSON-END',
                'description' => 'Established by the Johnson family to support students from rural communities.',
                'type' => 'endowed',
                'amount' => 10000,
                'amount_type' => 'fixed',
                'renewable' => true,
                'max_semesters' => 8,
                'min_gpa_required' => 3.20,
                'available_slots' => 5,
                'is_active' => true,
                'eligibility_criteria' => 'Students from rural communities with strong academic record.',
            ],
            [
                'name' => 'Martinez STEM Scholarship',
                'code' => 'MARTINEZ-STEM',
                'description' => 'Honors Dr. Elena Martinez by supporting underrepresented students in STEM fields.',
                'type' => 'endowed',
                'amount' => 7500,
                'amount_type' => 'fixed',
                'renewable' => true,
                'max_semesters' => 8,
                'min_gpa_required' => 3.30,
                'available_slots' => 8,
                'is_active' => true,
                'eligibility_criteria' => 'Underrepresented students pursuing STEM degrees.',
            ],
            [
                'name' => 'Williams Memorial Scholarship',
                'code' => 'WILLIAMS-MEM',
                'description' => 'In memory of Robert Williams, supporting students who have overcome adversity.',
                'type' => 'endowed',
                'amount' => 6000,
                'amount_type' => 'fixed',
                'renewable' => true,
                'max_semesters' => 8,
                'available_slots' => 4,
                'is_active' => true,
                'eligibility_criteria' => 'Students who have demonstrated resilience in overcoming personal challenges.',
            ],

            // Athletic scholarships
            [
                'name' => 'Varsity Athletic Scholarship',
                'code' => 'VARSITY-ATH',
                'description' => 'Full athletic scholarship for recruited varsity athletes.',
                'type' => 'athletic',
                'amount' => 0,
                'amount_type' => 'full_tuition',
                'renewable' => true,
                'max_semesters' => 8,
                'min_gpa_required' => 2.50,
                'available_slots' => 30,
                'is_active' => true,
                'eligibility_criteria' => 'Recruited varsity athlete. Must maintain 2.5 GPA and athletic eligibility.',
            ],
            [
                'name' => 'Club Sports Achievement Award',
                'code' => 'CLUB-SPORTS',
                'description' => 'Recognizes outstanding club sport athletes.',
                'type' => 'athletic',
                'amount' => 3000,
                'amount_type' => 'fixed',
                'renewable' => true,
                'max_semesters' => 8,
                'min_gpa_required' => 2.80,
                'available_slots' => 20,
                'is_active' => true,
                'eligibility_criteria' => 'Active club sport participant with good academic standing.',
            ],
        ];

        foreach ($scholarshipData as $data) {
            $scholarship = Scholarship::create($data);
            $this->scholarships[$data['code']] = $scholarship;
        }

        Log::info('Created ' . count($scholarshipData) . ' scholarships');
    }

    private function createFinancialAidPackages(): void
    {
        // Get accepted students (prospective students with accepted applications)
        $acceptedStudents = Student::whereHas('admissionApplications', function ($query) {
            $query->where('status', 'accepted');
        })->with(['admissionApplications' => function ($query) {
            $query->where('status', 'accepted');
        }])->get();

        $term = Term::where('name', 'Fall 2024')->first();
        if (!$term) {
            $term = Term::first();
        }

        if (!$term) {
            Log::warning('No term found for financial aid packages');
            return;
        }

        $packagesCreated = 0;
        $awardsCreated = 0;

        foreach ($acceptedStudents as $student) {
            $package = $this->createPackageForStudent($student, $term);
            if ($package) {
                $packagesCreated++;
                $awardsCreated += $package->aidAwards()->count();
            }
        }

        Log::info("Created {$packagesCreated} financial aid packages with {$awardsCreated} aid awards");
    }

    private function createPackageForStudent(Student $student, Term $term): ?FinancialAidPackage
    {
        // Determine if student is in-state (simplified: based on country)
        $isInState = $student->country === 'United States' && fake()->boolean(70);
        $tuition = $isInState ? self::TUITION_IN_STATE : self::TUITION_OUT_OF_STATE;

        // Generate EFC based on student profile
        $efc = $this->generateEFC($student);

        $package = FinancialAidPackage::create([
            'student_id' => $student->id,
            'term_id' => $term->id,
            'status' => 'offered',
            'tuition_cost' => $tuition,
            'fees_cost' => self::FEES,
            'room_board_cost' => self::ROOM_BOARD,
            'books_supplies_cost' => self::BOOKS_SUPPLIES,
            'transportation_cost' => self::TRANSPORTATION,
            'personal_cost' => self::PERSONAL,
            'expected_family_contribution' => $efc,
            'offer_date' => now()->subDays(rand(7, 30)),
            'response_deadline' => now()->addDays(rand(14, 45)),
        ]);

        // Calculate COA and demonstrated need
        $coa = $package->total_cost_of_attendance;
        $demonstratedNeed = max(0, $coa - $efc);

        // Award scholarships based on eligibility
        $this->awardScholarships($package, $student);

        // Award federal grants for high need
        if ($efc < 6000) {
            $this->awardPellGrant($package, $efc);
        }

        // Award federal loans
        $this->awardFederalLoans($package, $student, $demonstratedNeed);

        // Award work-study for some students
        if ($demonstratedNeed > 5000 && fake()->boolean(40)) {
            $this->awardWorkStudy($package);
        }

        // Recalculate totals
        $package->recalculateTotals();

        // Create disbursements
        $this->createDisbursements($package, $term);

        // Randomly accept some packages
        if (fake()->boolean(60)) {
            $package->status = 'accepted';
            $package->accepted_date = now()->subDays(rand(1, 14));
            $package->save();

            // Accept most awards in accepted packages
            foreach ($package->aidAwards as $award) {
                if (fake()->boolean(85)) {
                    $award->status = 'accepted';
                    $award->save();
                }
            }
        }

        return $package;
    }

    private function generateEFC(Student $student): float
    {
        // Generate EFC based on some heuristics
        // International students typically have higher EFC (no federal aid)
        if ($student->nationality !== 'American' && $student->country !== 'United States') {
            return fake()->randomFloat(2, 25000, 60000);
        }

        // Generate varied EFC distribution
        $rand = rand(1, 100);
        if ($rand <= 20) {
            return fake()->randomFloat(2, 0, 3000); // Very low income
        } elseif ($rand <= 40) {
            return fake()->randomFloat(2, 3000, 10000); // Low income
        } elseif ($rand <= 60) {
            return fake()->randomFloat(2, 10000, 25000); // Middle income
        } elseif ($rand <= 80) {
            return fake()->randomFloat(2, 25000, 45000); // Upper middle
        } else {
            return fake()->randomFloat(2, 45000, 75000); // High income
        }
    }

    private function awardScholarships(FinancialAidPackage $package, Student $student): void
    {
        $awardedAmount = 0;
        $maxScholarshipAid = $package->tuition_cost + $package->fees_cost;

        foreach ($this->scholarships as $scholarship) {
            // Check if already at max
            if ($awardedAmount >= $maxScholarshipAid * 0.8) {
                break;
            }

            // Check eligibility
            if (!$scholarship->isEligible($student)) {
                continue;
            }

            // Check availability
            if (!$scholarship->hasAvailableSlots()) {
                continue;
            }

            // Random chance to receive (simulates selection process)
            $chance = match($scholarship->type) {
                'merit' => $this->getMeritChance($student, $scholarship),
                'need' => $this->getNeedChance($package->expected_family_contribution, $scholarship),
                'departmental' => 30,
                'endowed' => 15,
                'athletic' => 5, // Very selective
                default => 20,
            };

            if (!fake()->boolean($chance)) {
                continue;
            }

            $amount = $scholarship->amount_type === 'full_tuition'
                ? $package->tuition_cost
                : $scholarship->amount;

            AidAward::create([
                'financial_aid_package_id' => $package->id,
                'scholarship_id' => $scholarship->id,
                'aid_type' => 'scholarship',
                'name' => $scholarship->name,
                'description' => $scholarship->description,
                'amount' => $amount,
                'disbursement_schedule' => 'per_semester',
                'status' => 'offered',
                'min_gpa_to_maintain' => $scholarship->min_gpa_required ? max(2.5, $scholarship->min_gpa_required - 0.5) : 2.5,
                'min_credits_to_maintain' => 12,
                'conditions' => $scholarship->eligibility_criteria,
            ]);

            $scholarship->increment('slots_awarded');
            $awardedAmount += $amount;
        }
    }

    private function getMeritChance(Student $student, Scholarship $scholarship): int
    {
        $gpa = $student->gpa ?? 3.0;
        $sat = $student->sat_score ?? 1200;

        // Higher stats = higher chance
        $gpaBonus = max(0, ($gpa - 3.5) * 30);
        $satBonus = max(0, ($sat - 1300) / 20);

        return min(80, 20 + $gpaBonus + $satBonus);
    }

    private function getNeedChance(float $efc, Scholarship $scholarship): int
    {
        if ($scholarship->max_family_income && $efc > $scholarship->max_family_income) {
            return 0;
        }

        // Lower EFC = higher chance
        if ($efc < 5000) return 70;
        if ($efc < 15000) return 50;
        if ($efc < 30000) return 30;
        return 15;
    }

    private function awardPellGrant(FinancialAidPackage $package, float $efc): void
    {
        // Pell Grant maximum for 2024-25 is $7,395
        // Amount decreases as EFC increases
        $maxPell = 7395;

        if ($efc <= 0) {
            $pellAmount = $maxPell;
        } elseif ($efc < 6000) {
            $pellAmount = max(750, $maxPell - ($efc * 1.1));
        } else {
            return; // No Pell eligibility
        }

        AidAward::create([
            'financial_aid_package_id' => $package->id,
            'aid_type' => 'grant',
            'name' => 'Federal Pell Grant',
            'description' => 'Federal grant program for undergraduate students with exceptional financial need.',
            'amount' => round($pellAmount, 2),
            'disbursement_schedule' => 'per_semester',
            'status' => 'offered',
            'min_credits_to_maintain' => 6,
            'conditions' => 'Must maintain satisfactory academic progress and be enrolled at least half-time.',
        ]);

        // Also award SEOG for very low EFC
        if ($efc < 2000 && fake()->boolean(50)) {
            AidAward::create([
                'financial_aid_package_id' => $package->id,
                'aid_type' => 'grant',
                'name' => 'Federal SEOG Grant',
                'description' => 'Federal Supplemental Educational Opportunity Grant for students with exceptional need.',
                'amount' => fake()->randomElement([500, 750, 1000, 1500, 2000]),
                'disbursement_schedule' => 'per_semester',
                'status' => 'offered',
                'conditions' => 'Priority given to Pell Grant recipients with lowest EFC.',
            ]);
        }
    }

    private function awardFederalLoans(FinancialAidPackage $package, Student $student, float $need): void
    {
        // Award subsidized loan (need-based)
        if ($need > 0) {
            $subAmount = min(self::SUBSIDIZED_LOAN_LIMIT, $need);
            AidAward::create([
                'financial_aid_package_id' => $package->id,
                'aid_type' => 'loan_subsidized',
                'name' => 'Federal Direct Subsidized Loan',
                'description' => 'Federal loan where the government pays interest while enrolled at least half-time.',
                'amount' => $subAmount,
                'disbursement_schedule' => 'per_semester',
                'status' => 'offered',
                'interest_rate' => self::SUBSIDIZED_RATE,
                'origination_fee' => self::SUB_ORIGINATION_FEE,
                'min_credits_to_maintain' => 6,
                'conditions' => 'Must complete entrance counseling and sign Master Promissory Note.',
            ]);
        }

        // Award unsubsidized loan (always available)
        AidAward::create([
            'financial_aid_package_id' => $package->id,
            'aid_type' => 'loan_unsubsidized',
            'name' => 'Federal Direct Unsubsidized Loan',
            'description' => 'Federal loan available regardless of financial need. Interest accrues during enrollment.',
            'amount' => self::UNSUBSIDIZED_LOAN_LIMIT,
            'disbursement_schedule' => 'per_semester',
            'status' => 'offered',
            'interest_rate' => self::UNSUBSIDIZED_RATE,
            'origination_fee' => self::UNSUB_ORIGINATION_FEE,
            'min_credits_to_maintain' => 6,
            'conditions' => 'Must complete entrance counseling and sign Master Promissory Note.',
        ]);

        // Offer Parent PLUS for remaining need (if significant)
        $totalGrantsAndLoans = $package->aidAwards()->sum('amount');
        $remainingNeed = $package->total_cost_of_attendance - $totalGrantsAndLoans;

        if ($remainingNeed > 5000 && fake()->boolean(40)) {
            AidAward::create([
                'financial_aid_package_id' => $package->id,
                'aid_type' => 'loan_plus',
                'name' => 'Federal Parent PLUS Loan',
                'description' => 'Federal loan for parents to help pay education expenses.',
                'amount' => min($remainingNeed, 15000),
                'disbursement_schedule' => 'per_semester',
                'status' => 'offered',
                'interest_rate' => self::PLUS_RATE,
                'origination_fee' => self::PLUS_ORIGINATION_FEE,
                'conditions' => 'Parent must pass credit check. Parent may request deferment while student is enrolled.',
            ]);
        }
    }

    private function awardWorkStudy(FinancialAidPackage $package): void
    {
        AidAward::create([
            'financial_aid_package_id' => $package->id,
            'aid_type' => 'work_study',
            'name' => 'Federal Work-Study',
            'description' => 'Part-time employment program for students with financial need.',
            'amount' => fake()->randomElement([2000, 2500, 3000, 3500]),
            'disbursement_schedule' => 'monthly',
            'status' => 'offered',
            'min_credits_to_maintain' => 6,
            'conditions' => 'Must secure work-study position. Earnings paid biweekly based on hours worked.',
        ]);
    }

    private function createDisbursements(FinancialAidPackage $package, Term $term): void
    {
        $fallTerm = $term;
        $springTerm = Term::where('name', 'Spring 2025')->first();

        foreach ($package->aidAwards as $award) {
            if ($award->disbursement_schedule === 'monthly') {
                // Work-study pays monthly, but we'll just create 2 summary disbursements
                AidDisbursement::create([
                    'aid_award_id' => $award->id,
                    'term_id' => $fallTerm->id,
                    'amount' => $award->amount / 2,
                    'scheduled_date' => $fallTerm->start_date->addDays(30),
                    'status' => 'scheduled',
                ]);
                if ($springTerm) {
                    AidDisbursement::create([
                        'aid_award_id' => $award->id,
                        'term_id' => $springTerm->id,
                        'amount' => $award->amount / 2,
                        'scheduled_date' => $springTerm->start_date->addDays(30),
                        'status' => 'scheduled',
                    ]);
                }
            } elseif ($award->disbursement_schedule === 'per_semester') {
                // Split between fall and spring
                AidDisbursement::create([
                    'aid_award_id' => $award->id,
                    'term_id' => $fallTerm->id,
                    'amount' => $award->amount / 2,
                    'scheduled_date' => $fallTerm->start_date,
                    'status' => 'scheduled',
                ]);
                if ($springTerm) {
                    AidDisbursement::create([
                        'aid_award_id' => $award->id,
                        'term_id' => $springTerm->id,
                        'amount' => $award->amount / 2,
                        'scheduled_date' => $springTerm->start_date,
                        'status' => 'scheduled',
                    ]);
                }
            } else {
                // One-time disbursement
                AidDisbursement::create([
                    'aid_award_id' => $award->id,
                    'term_id' => $fallTerm->id,
                    'amount' => $award->amount,
                    'scheduled_date' => $fallTerm->start_date,
                    'status' => 'scheduled',
                ]);
            }
        }
    }
}
