<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Role;
use App\Models\Student;
use App\Models\Program;
use App\Models\Term;
use App\Models\AdmissionApplication;
use App\Models\ProgramChoice;
use App\Models\Document;
use App\Models\AcademicRecord;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;

class AdmissionsSeeder extends Seeder
{
    /**
     * Realistic high schools with locations
     */
    private array $highSchools = [
        ['name' => 'Thomas Jefferson High School for Science and Technology', 'city' => 'Alexandria', 'state' => 'VA', 'tier' => 'elite'],
        ['name' => 'Stuyvesant High School', 'city' => 'New York', 'state' => 'NY', 'tier' => 'elite'],
        ['name' => 'Phillips Academy Andover', 'city' => 'Andover', 'state' => 'MA', 'tier' => 'elite'],
        ['name' => 'Bronx High School of Science', 'city' => 'Bronx', 'state' => 'NY', 'tier' => 'elite'],
        ['name' => 'Whitney M. Young Magnet High School', 'city' => 'Chicago', 'state' => 'IL', 'tier' => 'strong'],
        ['name' => 'Lowell High School', 'city' => 'San Francisco', 'state' => 'CA', 'tier' => 'strong'],
        ['name' => 'Boston Latin School', 'city' => 'Boston', 'state' => 'MA', 'tier' => 'strong'],
        ['name' => 'Lakeside School', 'city' => 'Seattle', 'state' => 'WA', 'tier' => 'strong'],
        ['name' => 'Central High School', 'city' => 'Philadelphia', 'state' => 'PA', 'tier' => 'good'],
        ['name' => 'Westview High School', 'city' => 'San Diego', 'state' => 'CA', 'tier' => 'good'],
        ['name' => 'Mountain View High School', 'city' => 'Mountain View', 'state' => 'CA', 'tier' => 'good'],
        ['name' => 'Lincoln High School', 'city' => 'Portland', 'state' => 'OR', 'tier' => 'good'],
        ['name' => 'Franklin High School', 'city' => 'Seattle', 'state' => 'WA', 'tier' => 'average'],
        ['name' => 'Roosevelt High School', 'city' => 'Los Angeles', 'state' => 'CA', 'tier' => 'average'],
        ['name' => 'Jefferson High School', 'city' => 'Denver', 'state' => 'CO', 'tier' => 'average'],
        ['name' => 'Madison High School', 'city' => 'Houston', 'state' => 'TX', 'tier' => 'average'],
        ['name' => 'Washington High School', 'city' => 'Phoenix', 'state' => 'AZ', 'tier' => 'average'],
        ['name' => 'Adams High School', 'city' => 'Miami', 'state' => 'FL', 'tier' => 'average'],
        // International schools
        ['name' => 'Seoul International School', 'city' => 'Seoul', 'state' => 'South Korea', 'tier' => 'strong', 'international' => true],
        ['name' => 'British International School', 'city' => 'Shanghai', 'state' => 'China', 'tier' => 'strong', 'international' => true],
        ['name' => 'Deutsche Schule', 'city' => 'Mexico City', 'state' => 'Mexico', 'tier' => 'good', 'international' => true],
        ['name' => 'Lycee Francais', 'city' => 'Lagos', 'state' => 'Nigeria', 'tier' => 'good', 'international' => true],
        ['name' => 'American School of Mumbai', 'city' => 'Mumbai', 'state' => 'India', 'tier' => 'good', 'international' => true],
    ];

    /**
     * Personal essay templates - these will be customized per student
     */
    private array $essayTemplates = [
        'overcoming_challenge' => [
            'The summer before junior year, my family faced an unexpected financial crisis when my father lost his job. What could have been devastating became a defining moment. I took on a part-time job at a local tutoring center, not just to help with expenses, but to discover my passion for teaching. Working with struggling students, I learned that true understanding comes from patience and creative problem-solving. When a student I had worked with for months finally grasped calculus, her joy mirrored my own discovery: that adversity can reveal purpose. This experience shaped my desire to study {program} - I want to develop tools that make complex concepts accessible to everyone.',

            'Growing up with dyslexia, I spent years believing I was simply "bad at school." Reading took me three times longer than my peers, and standardized tests felt like insurmountable obstacles. But in ninth grade, I discovered audiobooks and text-to-speech technology. These tools did not make learning easy, but they made it possible. My GPA rose from 2.8 to 3.7 in two years. More importantly, I became fascinated by how technology could bridge cognitive differences. I began coding accessibility features for school projects and volunteering with students who, like me, learned differently. {program} will give me the skills to build technology that empowers rather than excludes.',
        ],

        'intellectual_curiosity' => [
            'My obsession with {field} began with a broken radio. At twelve, I dismantled it expecting to find tiny people inside (I was not a bright twelve-year-old). Instead, I found circuits, capacitors, and questions that led me down a rabbit hole I have yet to escape. I taught myself basic electronics from YouTube, built my first robot from salvaged parts, and crashed my school\'s network trying to automate the attendance system. That last one earned me a week of detention and a meeting with the IT department - who then offered me an internship. I have since led our school\'s robotics team to state finals and published a paper on efficient pathfinding algorithms. I do not just want to study {program}; I want to push its boundaries.',

            'The question that keeps me awake is deceptively simple: why do some ideas spread while others die? This curiosity led me to spend three years analyzing viral content, from medieval plague pamphlets to modern memes. I built a database of 10,000 viral phenomena across history, coded analysis tools in Python, and discovered patterns that challenge conventional wisdom about information spread. My findings suggested that emotional complexity, not simplicity, predicts virality - contradicting most marketing literature. I presented this research at our state science fair and was invited to discuss it with researchers at {university}. Studying {program} will help me understand not just how ideas spread, but how we can spread better ones.',
        ],

        'community_impact' => [
            'In my neighborhood, the nearest grocery store is a 45-minute bus ride away. This "food desert" means my neighbors rely on corner stores selling overpriced, processed food. Last year, I started a community garden in an abandoned lot, navigating city permits, recruiting volunteers, and learning urban agriculture from YouTube and library books. What began as twelve tomato plants now feeds forty families and employs six teenagers from our community. We have reduced participating families\' grocery bills by an average of $200 monthly. But the numbers do not capture the grandmother who taught me to grow collard greens, or the kids who now know where vegetables come from. {program} will teach me to scale solutions like this.',

            'When my grandmother was diagnosed with Alzheimer\'s, I watched her world shrink. Simple tasks became impossible, and isolation became her constant companion. I began visiting her nursing home daily, and what I saw changed me: residents sitting alone, staff too overwhelmed to provide meaningful interaction. I started "Story Bridge," a program connecting high school students with dementia patients through recorded family histories. We have now trained 200 student volunteers across five nursing homes. Watching a patient recognize her own wedding photo because of a story we preserved - that is why I want to study {program}. Technology should preserve human connection, not replace it.',
        ],

        'identity_background' => [
            'I am the daughter of a Vietnamese refugee and a Mexican immigrant. Growing up, I was the family translator, advocate, and cultural bridge. At eight, I explained tax forms to my parents. At twelve, I negotiated my grandmother\'s medical bills. By sixteen, I had helped three families navigate the citizenship process. This constant code-switching taught me that communication is never just about language - it is about power, context, and trust. I founded our school\'s first Multicultural Student Alliance, creating space for students who, like me, exist between worlds. {program} will help me build systems that serve communities too often overlooked.',

            'My name is spelled differently on my birth certificate, social security card, and school records - a consequence of being named in Arabic but documented in English. This small bureaucratic chaos mirrors my larger experience as a first-generation Yemeni-American. I am neither fully here nor fully there, carrying traditions my American friends find strange and perspectives my Yemeni relatives find too Western. Rather than seeing this as displacement, I have learned to see it as dual citizenship in different ways of understanding the world. This perspective drives my interest in {program}: I want to build bridges between communities that rarely communicate.',
        ],

        'future_vision' => [
            'In 2050, three billion people will lack access to clean water. This is not a distant crisis but an urgent engineering challenge. My interest in {program} stems from a week I spent in rural Honduras, where I watched women walk hours for water that would make them sick. I returned home and spent a year designing a low-cost water filtration system using locally available materials. The prototype cost $12 and removed 94% of bacterial contaminants. But a prototype is not a solution. I need to understand materials science, fluid dynamics, and sustainable design. I need {program} to turn a garage project into something that can scale to serve millions.',

            'My generation will face challenges that do not yet have names. Climate change, artificial intelligence, genetic engineering - these forces will reshape human life in ways we cannot predict. I do not know exactly what problems I will solve, but I know I want to be prepared to solve them. My preparation has included everything from leading our debate team (state champions, 2024) to building neural networks that compose music to volunteering at a crisis hotline. Each experience has taught me something about how complex systems work and how humans navigate them. {program} will give me tools versatile enough for problems that have not been invented yet.',
        ],
    ];

    /**
     * Extracurricular activities by category
     */
    private array $activities = [
        'leadership' => [
            'Student Body President',
            'Class President',
            'National Honor Society President',
            'Model UN Secretary General',
            'Debate Team Captain',
            'Yearbook Editor-in-Chief',
        ],
        'stem' => [
            'Robotics Team Captain',
            'Math Olympiad Competitor',
            'Science Fair State Finalist',
            'Coding Club Founder',
            'Research Intern at University Lab',
            'Physics Olympics Team',
        ],
        'arts' => [
            'Orchestra Concertmaster',
            'Lead in School Musical',
            'Art Portfolio Award Winner',
            'Jazz Band Director',
            'Film Club President',
            'Creative Writing Published Author',
        ],
        'athletics' => [
            'Varsity Soccer Captain',
            'Cross Country All-State',
            'Swim Team MVP',
            'Basketball Team Captain',
            'Track & Field State Qualifier',
            'Tennis Singles Champion',
        ],
        'service' => [
            'Habitat for Humanity Coordinator',
            'Hospital Volunteer (500+ hours)',
            'Tutoring Center Founder',
            'Food Bank Organizer',
            'Environmental Club President',
            'Peer Counselor',
        ],
    ];

    /**
     * Applicant profiles with varied backgrounds
     */
    private array $applicantProfiles = [
        // High achievers
        ['first_name' => 'Emma', 'last_name' => 'Chen', 'gender' => 'female', 'nationality' => 'American', 'profile' => 'high_achiever'],
        ['first_name' => 'James', 'last_name' => 'Okonkwo', 'gender' => 'male', 'nationality' => 'Nigerian-American', 'profile' => 'high_achiever'],
        ['first_name' => 'Sophia', 'last_name' => 'Patel', 'gender' => 'female', 'nationality' => 'Indian-American', 'profile' => 'high_achiever'],
        ['first_name' => 'Alexander', 'last_name' => 'Kim', 'gender' => 'male', 'nationality' => 'Korean-American', 'profile' => 'high_achiever'],
        ['first_name' => 'Olivia', 'last_name' => 'Martinez', 'gender' => 'female', 'nationality' => 'Mexican-American', 'profile' => 'high_achiever'],

        // Strong applicants
        ['first_name' => 'Ethan', 'last_name' => 'Williams', 'gender' => 'male', 'nationality' => 'American', 'profile' => 'strong'],
        ['first_name' => 'Ava', 'last_name' => 'Johnson', 'gender' => 'female', 'nationality' => 'American', 'profile' => 'strong'],
        ['first_name' => 'Muhammad', 'last_name' => 'Hassan', 'gender' => 'male', 'nationality' => 'Pakistani-American', 'profile' => 'strong'],
        ['first_name' => 'Isabella', 'last_name' => 'Rossi', 'gender' => 'female', 'nationality' => 'Italian-American', 'profile' => 'strong'],
        ['first_name' => 'Lucas', 'last_name' => 'Nguyen', 'gender' => 'male', 'nationality' => 'Vietnamese-American', 'profile' => 'strong'],
        ['first_name' => 'Mia', 'last_name' => 'Davis', 'gender' => 'female', 'nationality' => 'American', 'profile' => 'strong'],
        ['first_name' => 'Benjamin', 'last_name' => 'Garcia', 'gender' => 'male', 'nationality' => 'American', 'profile' => 'strong'],

        // Good applicants
        ['first_name' => 'Charlotte', 'last_name' => 'Brown', 'gender' => 'female', 'nationality' => 'American', 'profile' => 'good'],
        ['first_name' => 'Daniel', 'last_name' => 'Lee', 'gender' => 'male', 'nationality' => 'Chinese-American', 'profile' => 'good'],
        ['first_name' => 'Amelia', 'last_name' => 'Taylor', 'gender' => 'female', 'nationality' => 'American', 'profile' => 'good'],
        ['first_name' => 'Henry', 'last_name' => 'Anderson', 'gender' => 'male', 'nationality' => 'American', 'profile' => 'good'],
        ['first_name' => 'Harper', 'last_name' => 'Thomas', 'gender' => 'female', 'nationality' => 'American', 'profile' => 'good'],
        ['first_name' => 'Sebastian', 'last_name' => 'Jackson', 'gender' => 'male', 'nationality' => 'African-American', 'profile' => 'good'],

        // Average applicants
        ['first_name' => 'Evelyn', 'last_name' => 'White', 'gender' => 'female', 'nationality' => 'American', 'profile' => 'average'],
        ['first_name' => 'Jack', 'last_name' => 'Harris', 'gender' => 'male', 'nationality' => 'American', 'profile' => 'average'],
        ['first_name' => 'Abigail', 'last_name' => 'Martin', 'gender' => 'female', 'nationality' => 'American', 'profile' => 'average'],
        ['first_name' => 'Owen', 'last_name' => 'Thompson', 'gender' => 'male', 'nationality' => 'American', 'profile' => 'average'],

        // International students
        ['first_name' => 'Yuki', 'last_name' => 'Tanaka', 'gender' => 'female', 'nationality' => 'Japanese', 'profile' => 'international_strong'],
        ['first_name' => 'Wei', 'last_name' => 'Zhang', 'gender' => 'male', 'nationality' => 'Chinese', 'profile' => 'international_strong'],
        ['first_name' => 'Priya', 'last_name' => 'Sharma', 'gender' => 'female', 'nationality' => 'Indian', 'profile' => 'international_strong'],
        ['first_name' => 'Carlos', 'last_name' => 'Rodriguez', 'gender' => 'male', 'nationality' => 'Mexican', 'profile' => 'international_good'],
        ['first_name' => 'Fatima', 'last_name' => 'Al-Hassan', 'gender' => 'female', 'nationality' => 'Saudi Arabian', 'profile' => 'international_good'],
        ['first_name' => 'Kofi', 'last_name' => 'Mensah', 'gender' => 'male', 'nationality' => 'Ghanaian', 'profile' => 'international_good'],
    ];

    public function run(): void
    {
        Log::info('Starting comprehensive admissions seeding...');

        $studentRole = Role::where('name', 'student')->first();
        $programs = Program::all();
        $admissionTerm = Term::where('name', 'Fall 2025')->first()
            ?? Term::create([
                'name' => 'Fall 2025',
                'academic_year' => 2025,
                'semester' => 'Fall',
                'start_date' => '2025-08-25',
                'end_date' => '2025-12-15',
                'registration_start' => '2025-04-01',
                'registration_end' => '2025-08-01',
                'add_drop_deadline' => '2025-09-08',
                'withdrawal_deadline' => '2025-11-01',
                'is_current' => true,
            ]);

        $applicants = [];

        foreach ($this->applicantProfiles as $index => $profile) {
            $applicant = $this->createApplicant($profile, $index, $studentRole, $programs, $admissionTerm);
            $applicants[] = $applicant;
        }

        Log::info('Created ' . count($applicants) . ' prospective students with applications');

        // Create application statistics summary
        $this->logApplicationStats();
    }

    private function createApplicant(array $profile, int $index, Role $studentRole, $programs, Term $term): array
    {
        // Generate academic stats based on profile
        $stats = $this->generateAcademicStats($profile['profile']);
        $highSchool = $this->selectHighSchool($profile['profile']);

        // Create user
        $email = strtolower($profile['first_name'] . '.' . $profile['last_name'] . ($index > 0 ? $index : '') . '@applicant.edu');

        $user = User::create([
            'name' => $profile['first_name'] . ' ' . $profile['last_name'],
            'email' => $email,
            'password' => Hash::make('password'),
            'email_verified_at' => now(),
        ]);
        $user->roles()->attach($studentRole);

        // Create student record (prospective)
        $student = Student::create([
            'user_id' => $user->id,
            'student_number' => 'APP' . date('Y') . str_pad($index + 1, 4, '0', STR_PAD_LEFT),
            'first_name' => $profile['first_name'],
            'last_name' => $profile['last_name'],
            'date_of_birth' => fake()->dateTimeBetween('-19 years', '-17 years')->format('Y-m-d'),
            'gender' => $profile['gender'],
            'nationality' => $profile['nationality'],
            'address' => fake()->streetAddress(),
            'city' => $highSchool['city'],
            'state' => $highSchool['state'],
            'postal_code' => fake()->postcode(),
            'country' => str_contains($profile['nationality'], '-') ? 'United States' : $profile['nationality'],
            'phone' => fake()->phoneNumber(),
            'emergency_contact_name' => fake()->name(),
            'emergency_contact_phone' => fake()->phoneNumber(),
            'high_school' => $highSchool['name'],
            'high_school_graduation_year' => 2025,
            'sat_score' => $stats['sat'],
            'act_score' => $stats['act'],
            'gpa' => $stats['gpa'],
            'enrollment_status' => 'prospective',
            'class_standing' => 'freshman',
        ]);

        // Create high school academic record
        AcademicRecord::create([
            'student_id' => $student->id,
            'institution_name' => $highSchool['name'],
            'qualification_type' => 'High School Diploma',
            'gpa' => $stats['gpa'],
            'start_date' => '2021-08-15',
            'end_date' => '2025-05-30',
            'verified' => false,
        ]);

        // Determine application status based on profile
        $status = $this->determineApplicationStatus($profile['profile'], $stats);

        // Create admission application
        $application = AdmissionApplication::create([
            'student_id' => $student->id,
            'term_id' => $term->id,
            'status' => $status,
            'application_date' => fake()->dateTimeBetween('-3 months', '-1 week'),
            'decision_date' => in_array($status, ['accepted', 'rejected', 'waitlisted']) ? fake()->dateTimeBetween('-1 week', 'now') : null,
            'comments' => $this->generatePersonalStatement($profile, $programs->random()),
        ]);

        // Create program choices (1-3 programs)
        $numChoices = rand(1, 3);
        $selectedPrograms = $programs->random($numChoices);

        foreach ($selectedPrograms as $order => $program) {
            $choiceStatus = 'pending';
            if ($status === 'accepted' && $order === 0) {
                $choiceStatus = 'accepted';
            } elseif ($status === 'rejected') {
                $choiceStatus = 'rejected';
            }

            ProgramChoice::create([
                'application_id' => $application->id,
                'program_id' => $program->id,
                'preference_order' => $order + 1,
                'status' => $choiceStatus,
            ]);
        }

        // Create documents
        $this->createApplicantDocuments($student, $stats);

        return [
            'student' => $student,
            'application' => $application,
            'stats' => $stats,
            'status' => $status,
        ];
    }

    private function generateAcademicStats(string $profile): array
    {
        switch ($profile) {
            case 'high_achiever':
                return [
                    'gpa' => round(fake()->randomFloat(2, 3.85, 4.0), 2),
                    'sat' => rand(1480, 1600),
                    'act' => rand(33, 36),
                ];
            case 'strong':
            case 'international_strong':
                return [
                    'gpa' => round(fake()->randomFloat(2, 3.6, 3.9), 2),
                    'sat' => rand(1350, 1500),
                    'act' => rand(29, 34),
                ];
            case 'good':
            case 'international_good':
                return [
                    'gpa' => round(fake()->randomFloat(2, 3.3, 3.7), 2),
                    'sat' => rand(1200, 1400),
                    'act' => rand(25, 30),
                ];
            case 'average':
            default:
                return [
                    'gpa' => round(fake()->randomFloat(2, 2.8, 3.4), 2),
                    'sat' => rand(1000, 1250),
                    'act' => rand(20, 26),
                ];
        }
    }

    private function selectHighSchool(string $profile): array
    {
        $eligibleSchools = match ($profile) {
            'high_achiever' => array_filter($this->highSchools, fn($s) => $s['tier'] === 'elite'),
            'strong' => array_filter($this->highSchools, fn($s) => in_array($s['tier'], ['elite', 'strong'])),
            'international_strong', 'international_good' => array_filter($this->highSchools, fn($s) => isset($s['international'])),
            'good' => array_filter($this->highSchools, fn($s) => in_array($s['tier'], ['strong', 'good'])),
            default => array_filter($this->highSchools, fn($s) => in_array($s['tier'], ['good', 'average'])),
        };

        return $eligibleSchools[array_rand($eligibleSchools)];
    }

    private function determineApplicationStatus(string $profile, array $stats): string
    {
        // Some applications still in progress
        if (rand(1, 10) <= 2) {
            return fake()->randomElement(['draft', 'submitted', 'under_review']);
        }

        // Decision based on profile and stats
        $acceptanceChance = match ($profile) {
            'high_achiever' => 90,
            'strong', 'international_strong' => 70,
            'good', 'international_good' => 50,
            'average' => 30,
            default => 40,
        };

        // Adjust by GPA
        if ($stats['gpa'] >= 3.8) $acceptanceChance += 10;
        elseif ($stats['gpa'] < 3.0) $acceptanceChance -= 20;

        // Adjust by SAT
        if ($stats['sat'] >= 1450) $acceptanceChance += 10;
        elseif ($stats['sat'] < 1100) $acceptanceChance -= 15;

        $roll = rand(1, 100);

        if ($roll <= $acceptanceChance) {
            return 'accepted';
        } elseif ($roll <= $acceptanceChance + 15) {
            return 'waitlisted';
        } else {
            return 'rejected';
        }
    }

    private function generatePersonalStatement(array $profile, Program $program): string
    {
        $categories = array_keys($this->essayTemplates);
        $category = $categories[array_rand($categories)];
        $templates = $this->essayTemplates[$category];
        $template = $templates[array_rand($templates)];

        // Determine field based on program
        $field = match (true) {
            str_contains($program->name, 'Computer') => 'computer science',
            str_contains($program->name, 'Engineering') => 'engineering',
            str_contains($program->name, 'Business') => 'business',
            str_contains($program->name, 'Math') => 'mathematics',
            default => 'my chosen field',
        };

        $essay = str_replace(
            ['{program}', '{field}', '{university}'],
            [$program->name, $field, 'State University'],
            $template
        );

        return $essay;
    }

    private function createApplicantDocuments(Student $student, array $stats): void
    {
        // High School Transcript
        Document::create([
            'student_id' => $student->id,
            'document_type' => 'transcript',
            'file_path' => 'documents/transcripts/' . $student->id . '_hs_transcript.pdf',
            'original_filename' => 'Official_High_School_Transcript.pdf',
            'mime_type' => 'application/pdf',
            'file_size' => rand(50000, 200000),
            'status' => fake()->randomElement(['pending', 'approved', 'approved']),
            'verified' => fake()->boolean(60),
            'version' => 1,
            'is_active' => true,
            'uploaded_at' => fake()->dateTimeBetween('-2 months', '-1 week'),
        ]);

        // SAT/ACT Score Report
        if ($stats['sat'] > 0) {
            Document::create([
                'student_id' => $student->id,
                'document_type' => 'test_scores',
                'file_path' => 'documents/scores/' . $student->id . '_sat_scores.pdf',
                'original_filename' => 'SAT_Score_Report.pdf',
                'mime_type' => 'application/pdf',
                'file_size' => rand(30000, 80000),
                'status' => fake()->randomElement(['pending', 'approved', 'approved']),
                'verified' => fake()->boolean(70),
                'version' => 1,
                'is_active' => true,
                'uploaded_at' => fake()->dateTimeBetween('-2 months', '-1 week'),
            ]);
        }

        // Letters of Recommendation (1-2)
        $numLetters = rand(1, 2);
        for ($i = 1; $i <= $numLetters; $i++) {
            $recommender = fake()->randomElement(['Teacher', 'Counselor', 'Coach', 'Mentor']);
            Document::create([
                'student_id' => $student->id,
                'document_type' => 'recommendation_letter',
                'file_path' => 'documents/recommendations/' . $student->id . '_rec_' . $i . '.pdf',
                'original_filename' => 'Recommendation_Letter_' . $recommender . '.pdf',
                'mime_type' => 'application/pdf',
                'file_size' => rand(20000, 60000),
                'status' => fake()->randomElement(['pending', 'approved']),
                'verified' => fake()->boolean(50),
                'version' => 1,
                'is_active' => true,
                'uploaded_at' => fake()->dateTimeBetween('-2 months', '-1 week'),
            ]);
        }

        // Personal Essay (stored as document)
        Document::create([
            'student_id' => $student->id,
            'document_type' => 'essay',
            'file_path' => 'documents/essays/' . $student->id . '_personal_essay.pdf',
            'original_filename' => 'Personal_Statement.pdf',
            'mime_type' => 'application/pdf',
            'file_size' => rand(15000, 40000),
            'status' => 'approved',
            'verified' => true,
            'version' => 1,
            'is_active' => true,
            'uploaded_at' => fake()->dateTimeBetween('-2 months', '-1 week'),
        ]);
    }

    private function logApplicationStats(): void
    {
        $stats = AdmissionApplication::selectRaw('status, COUNT(*) as count')
            ->groupBy('status')
            ->pluck('count', 'status')
            ->toArray();

        Log::info('Application Statistics:', $stats);

        $avgGpa = Student::where('enrollment_status', 'prospective')->avg('gpa');
        $avgSat = Student::where('enrollment_status', 'prospective')->avg('sat_score');

        Log::info("Average GPA: {$avgGpa}, Average SAT: {$avgSat}");
    }
}
