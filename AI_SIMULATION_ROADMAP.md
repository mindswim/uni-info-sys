# AI University Simulation Roadmap

> Transform this university management system into an autonomous AI-driven simulation where agents act as students, professors, and staff.

## Vision

A living university simulation where:
- **Student agents** attend classes, complete assignments, take exams, and make academic decisions
- **Professor agents** create coursework, grade submissions, hold office hours, and adjust teaching
- **Admin agents** process applications, handle exceptions, and manage operations
- **Emergent behaviors** arise from agent interactions within the system's rules

---

## Current State Assessment

### What's Complete (80% of core)

| Feature | Status | Notes |
|---------|--------|-------|
| Enrollment System | Done | Waitlist, prerequisites, conflicts, capacity |
| Grade Submission | Done | Deadlines, change requests, GPA calc |
| Billing System | Done | Tuition, payments, refunds |
| Admissions Workflow | Done | Full application lifecycle |
| Attendance Tracking | Done | Per enrollment per date |
| RBAC | Done | Roles and permissions |
| API Coverage | Done | 100+ endpoints |

### What's Missing (Required for Simulation)

| Feature | Priority | Status | Why Needed |
|---------|----------|--------|------------|
| Class Sessions | Critical | **Done** | Discrete events for agents to attend |
| Assignments | Critical | **Done** | Work for students to complete |
| Submissions | Critical | **Done** | Student work artifacts |
| Gradebook | High | **Done** | Assignment grades -> final grades |
| Course Materials | Medium | **Done** | Content for "learning" |
| Announcements | Medium | **Done** | Professor-student communication |
| Messages | Low | Pending | Agent-to-agent communication |

---

## Phase 1: Complete Academic Core

### 1.1 Class Sessions

Individual class meetings within a course section.

**Database: `class_sessions`**
```
id                  - bigint, primary key
course_section_id   - foreign key -> course_sections
session_number      - integer (1, 2, 3... for the term)
session_date        - date
start_time          - time
end_time            - time
title               - string (optional topic)
description         - text (what was covered)
status              - enum: scheduled, completed, cancelled
location_override   - string (if different from section's room)
created_at          - timestamp
updated_at          - timestamp
```

**Model Relationships:**
- BelongsTo: CourseSection
- HasMany: AttendanceRecords (update existing to link here)

**API Endpoints:**
- `GET /v1/course-sections/{id}/sessions` - List sessions for section
- `POST /v1/course-sections/{id}/sessions` - Create session
- `GET /v1/class-sessions/{id}` - Get session details
- `PUT /v1/class-sessions/{id}` - Update session
- `DELETE /v1/class-sessions/{id}` - Delete session
- `POST /v1/course-sections/{id}/sessions/generate` - Auto-generate from schedule
- `GET /v1/students/{id}/sessions/today` - Student's sessions for today

**Service: ClassSessionService**
- `generateSessionsForSection(section, term)` - Create all sessions from schedule pattern
- `getSessionsForDate(date)` - All sessions on a date
- `markSessionComplete(session, notes)` - Complete with summary
- `cancelSession(session, reason)` - Cancel with notification

**Tasks:**
- [x] Create migration (`2025_01_24_000001_create_class_sessions_table.php`)
- [x] Create model with relationships (`app/Models/ClassSession.php`)
- [x] Create controller (`app/Http/Controllers/Api/V1/ClassSessionController.php`)
- [x] Create service (`app/Services/ClassSessionService.php`)
- [x] Create API routes (added to `routes/api.php`)
- [x] Update AttendanceRecord to optionally link to class_session
- [x] Write tests (`tests/Feature/ClassSessionTest.php`)
- [x] Create factory (`database/factories/ClassSessionFactory.php`)
- [ ] Update API documentation (Swagger annotations)

---

### 1.2 Assignments

Coursework that students must complete.

**Database: `assignments`**
```
id                  - bigint, primary key
course_section_id   - foreign key -> course_sections
title               - string
description         - text (instructions)
type                - enum: homework, quiz, exam, project, paper, participation, other
due_date            - datetime
available_from      - datetime (when students can see/start)
max_points          - decimal(8,2)
weight              - decimal(5,2) (percentage of final grade, nullable)
passing_score       - decimal(8,2) (optional minimum to pass)
allows_late         - boolean, default true
late_penalty_per_day - decimal(5,2) (percentage, e.g., 10.00 = 10%)
max_late_days       - integer (nullable, null = unlimited)
instructions_file   - string (path to attached file, optional)
is_published        - boolean, default false
created_at          - timestamp
updated_at          - timestamp
```

**Model Relationships:**
- BelongsTo: CourseSection
- HasMany: AssignmentSubmissions

**API Endpoints:**
- `GET /v1/course-sections/{id}/assignments` - List assignments
- `POST /v1/course-sections/{id}/assignments` - Create assignment
- `GET /v1/assignments/{id}` - Get assignment details
- `PUT /v1/assignments/{id}` - Update assignment
- `DELETE /v1/assignments/{id}` - Delete assignment
- `POST /v1/assignments/{id}/publish` - Make visible to students
- `GET /v1/students/{id}/assignments` - Student's all assignments
- `GET /v1/students/{id}/assignments/pending` - Unsubmitted assignments

**Tasks:**
- [x] Create migration (`2025_11_10_000002_create_assignments_table.php`)
- [x] Create model with relationships (`app/Models/Assignment.php`)
- [x] Create controller (`app/Http/Controllers/Api/V1/AssignmentController.php`)
- [x] Create API routes (added to `routes/api.php`)
- [x] Create factory (`database/factories/AssignmentFactory.php`)
- [x] Write tests (`tests/Feature/AssignmentTest.php` - 16 passing)
- [x] Create AssignmentSubmission stub model for forward compatibility
- [ ] Update API documentation (Swagger annotations)

---

### 1.3 Assignment Submissions

Student work submitted for assignments.

**Database: `assignment_submissions`**
```
id                  - bigint, primary key
assignment_id       - foreign key -> assignments
enrollment_id       - foreign key -> enrollments
submitted_at        - datetime (nullable until submitted)
content             - text (for text-based submissions)
file_path           - string (for file uploads)
file_name           - string (original filename)
status              - enum: not_started, in_progress, submitted, late, graded, returned
score               - decimal(8,2) (nullable until graded)
feedback            - text (instructor comments)
graded_at           - datetime
graded_by           - foreign key -> staff (nullable)
late_days           - integer, default 0
late_penalty_applied - decimal(8,2), default 0
final_score         - decimal(8,2) (score after penalty)
attempt_number      - integer, default 1 (for resubmissions)
created_at          - timestamp
updated_at          - timestamp

unique: [assignment_id, enrollment_id, attempt_number]
```

**Model Relationships:**
- BelongsTo: Assignment, Enrollment, Staff (grader)
- Enrollment -> HasMany Submissions

**API Endpoints:**
- `GET /v1/assignments/{id}/submissions` - All submissions for assignment
- `POST /v1/assignments/{id}/submissions` - Submit work (student)
- `GET /v1/submissions/{id}` - Get submission details
- `PUT /v1/submissions/{id}` - Update submission (before graded)
- `POST /v1/submissions/{id}/grade` - Grade submission (instructor)
- `POST /v1/submissions/{id}/return` - Return for revision
- `GET /v1/enrollments/{id}/submissions` - Student's submissions for course
- `POST /v1/assignments/{id}/submissions/bulk-grade` - Grade multiple

**Service: AssignmentService**
- `submit(enrollment, assignment, content/file)` - Handle submission with late calc
- `grade(submission, score, feedback, grader)` - Grade with final score calc
- `calculateLatePenalty(submission)` - Compute penalty from days late
- `getGradingProgress(assignment)` - Stats on graded vs pending
- `bulkGrade(assignment, grades[])` - Batch grading

**Tasks:**
- [x] Create migration (`2025_11_10_000003_create_assignment_submissions_table.php`)
- [x] Create model with relationships (`app/Models/AssignmentSubmission.php`)
- [x] Create controller (`app/Http/Controllers/Api/V1/AssignmentSubmissionController.php`)
- [x] Create AssignmentSubmissionService (`app/Services/AssignmentSubmissionService.php`)
- [x] Create API routes (added to `routes/api.php`)
- [x] Create factory (`database/factories/AssignmentSubmissionFactory.php`)
- [x] Write tests (`tests/Feature/AssignmentSubmissionTest.php` - 17 passing)
- [ ] Update API documentation (Swagger annotations)

---

### 1.4 Gradebook Service

Calculate final grades from weighted assignments.

**Service: GradebookService**

```php
class GradebookService
{
    // Get student's current grade in a course
    public function calculateCurrentGrade(Enrollment $enrollment): array

    // Get all grades for a student in a section
    public function getStudentGradebook(Enrollment $enrollment): array

    // Get grade breakdown by category
    public function getGradesByCategory(Enrollment $enrollment): array

    // Calculate what grade student needs on remaining work
    public function calculateNeededScore(Enrollment $enrollment, string $targetGrade): float

    // Finalize grades for a section (end of term)
    public function finalizeGrades(CourseSection $section): void

    // Get class grade distribution
    public function getClassGradebook(CourseSection $section): array
}
```

**API Endpoints:**
- `GET /v1/enrollments/{id}/gradebook` - Student's gradebook for course
- `GET /v1/course-sections/{id}/gradebook` - Full section gradebook (instructor)
- `GET /v1/course-sections/{id}/gradebook/export` - Export as CSV
- `POST /v1/course-sections/{id}/finalize-grades` - Calculate final grades

**Tasks:**
- [x] Create GradebookService (`app/Services/GradebookService.php`)
- [x] Create GradebookController (`app/Http/Controllers/Api/V1/GradebookController.php`)
- [x] Create API routes (added to `routes/api.php`)
- [x] Write tests (`tests/Feature/GradebookTest.php` - 14 passing)
- [ ] Update API documentation (Swagger annotations)

---

### 1.5 Course Materials

Content for courses (syllabus, readings, notes).

**Database: `course_materials`**
```
id                  - bigint, primary key
course_section_id   - foreign key -> course_sections
class_session_id    - foreign key -> class_sessions (nullable)
title               - string
description         - text (optional)
type                - enum: syllabus, reading, lecture_notes, video, link, file, other
content             - text (for inline content)
file_path           - string (for uploaded files)
url                 - string (for external links)
order               - integer, default 0
is_published        - boolean, default true
available_from      - datetime (nullable)
created_at          - timestamp
updated_at          - timestamp
```

**Tasks:**
- [x] Create migration (`2025_11_10_000004_create_course_materials_table.php`)
- [x] Create model (`app/Models/CourseMaterial.php`)
- [x] Create controller with CRUD (`app/Http/Controllers/Api/V1/CourseMaterialController.php`)
- [x] Create API routes (added to `routes/api.php`)
- [x] Create factory (`database/factories/CourseMaterialFactory.php`)
- [x] Write tests (`tests/Feature/CourseMaterialTest.php` - 17 passing)
- [ ] Update API documentation (Swagger annotations)

---

### 1.6 Announcements

Communication from instructors/admin to students.

**Database: `announcements`**
```
id                  - bigint, primary key
announceable_type   - string (CourseSection, Department, or null for university-wide)
announceable_id     - bigint (nullable)
author_id           - foreign key -> staff
title               - string
content             - text
priority            - enum: normal, important, urgent
is_published        - boolean, default true
published_at        - datetime
expires_at          - datetime (nullable)
created_at          - timestamp
updated_at          - timestamp
```

**Tasks:**
- [x] Create migration (`2025_11_10_000005_create_announcements_table.php`)
- [x] Create model with polymorphic relationship (`app/Models/Announcement.php`)
- [x] Create controller (`app/Http/Controllers/Api/V1/AnnouncementController.php`)
- [x] Create API routes (added to `routes/api.php`)
- [x] Create factory (`database/factories/AnnouncementFactory.php`)
- [x] Write tests (`tests/Feature/AnnouncementTest.php` - 16 passing)
- [ ] Update API documentation (Swagger annotations)

---

## Phase 2: Simulation Infrastructure

### 2.1 Simulation Clock

Controls the passage of simulated time.

**Database: `simulation_state`**
```
id                  - bigint, primary key
current_date        - date
current_time        - time
speed_multiplier    - decimal (1.0 = realtime, 60.0 = 1 min = 1 hour)
status              - enum: stopped, running, paused
started_at          - datetime
last_tick_at        - datetime
created_at          - timestamp
updated_at          - timestamp
```

**Components:**
- SimulationClock service
- Tick event dispatcher
- Speed control API

**Tasks:**
- [ ] Create simulation_state migration
- [ ] Create SimulationClock service
- [ ] Create clock control API endpoints
- [ ] Create tick event system

---

### 2.2 Agent Registry

Track all simulation agents.

**Database: `simulation_agents`**
```
id                  - bigint, primary key
agent_type          - enum: student, professor, admin
entity_type         - string (Student, Staff)
entity_id           - bigint
personality_profile - json (traits, behaviors)
status              - enum: active, paused, inactive
last_action_at      - datetime
action_count        - integer
created_at          - timestamp
updated_at          - timestamp
```

**Database: `agent_actions`** (audit trail)
```
id                  - bigint, primary key
simulation_agent_id - foreign key
action_type         - string (attend_class, submit_assignment, etc.)
action_data         - json (parameters, context)
result              - json (outcome, any errors)
simulated_at        - datetime (simulation time)
created_at          - timestamp (real time)
```

**Tasks:**
- [ ] Create migrations
- [ ] Create models
- [ ] Create AgentRegistry service
- [ ] Create agent CRUD API

---

### 2.3 Event Queue

Schedule future simulation events.

**Database: `simulation_events`**
```
id                  - bigint, primary key
event_type          - string (class_start, assignment_due, etc.)
scheduled_at        - datetime (simulation time)
payload             - json
status              - enum: pending, processing, completed, failed
processed_at        - datetime
result              - json
created_at          - timestamp
updated_at          - timestamp
```

**Tasks:**
- [ ] Create migration
- [ ] Create model
- [ ] Create SimulationEventService
- [ ] Create event processor job

---

### 2.4 Basic Agent Behaviors (Rule-Based)

Simple deterministic behaviors before adding LLM.

**StudentAgentBehavior:**
```php
class StudentAgentBehavior
{
    // Decide whether to attend a class
    public function shouldAttendClass(Student $student, ClassSession $session): bool

    // Work on an assignment (returns progress amount)
    public function workOnAssignment(Student $student, Assignment $assignment): float

    // Generate submission content (placeholder)
    public function generateSubmission(Student $student, Assignment $assignment): string

    // Decide course registration
    public function selectCourses(Student $student, Term $term): array
}
```

**ProfessorAgentBehavior:**
```php
class ProfessorAgentBehavior
{
    // Grade a submission (returns score 0-100)
    public function gradeSubmission(Staff $professor, AssignmentSubmission $submission): array

    // Generate assignment for week N
    public function createWeeklyAssignment(Staff $professor, CourseSection $section, int $week): array

    // Create class session notes
    public function generateSessionNotes(Staff $professor, ClassSession $session): string
}
```

**Tasks:**
- [ ] Create StudentAgentBehavior service
- [ ] Create ProfessorAgentBehavior service
- [ ] Create AdminAgentBehavior service
- [ ] Write behavior tests

---

## Phase 3: LLM-Powered Agents

### 3.1 Agent Service Architecture

Separate service (likely Python) for LLM-based decision making.

```
university-admissions/
├── [existing Laravel app]
└── agent-service/
    ├── agents/
    │   ├── base_agent.py
    │   ├── student_agent.py
    │   ├── professor_agent.py
    │   └── admin_agent.py
    ├── orchestrator/
    │   ├── simulation_runner.py
    │   ├── event_processor.py
    │   └── clock.py
    ├── api_client/
    │   └── university_api.py
    ├── personalities/
    │   └── profiles.yaml
    ├── config.py
    ├── requirements.txt
    └── main.py
```

**Tasks:**
- [ ] Set up Python project structure
- [ ] Create UniversityAPI client wrapper
- [ ] Create BaseAgent class
- [ ] Create StudentAgent implementation
- [ ] Create ProfessorAgent implementation
- [ ] Create SimulationRunner orchestrator
- [ ] Create personality profile system

---

### 3.2 Student Agent Personalities

Define personality traits that influence behavior.

```yaml
personality_traits:
  # Academic traits
  diligence: 0.0-1.0        # How consistently they do work
  intelligence: 0.0-1.0      # How well they perform
  curiosity: 0.0-1.0         # Interest in learning

  # Behavioral traits
  punctuality: 0.0-1.0       # Attendance/deadline adherence
  procrastination: 0.0-1.0   # Tendency to delay
  social: 0.0-1.0            # Group work preference

  # Goals
  gpa_target: 2.0-4.0        # What GPA they aim for
  workload_tolerance: 1-6    # Max courses they can handle

personality_archetypes:
  overachiever:
    diligence: 0.95
    intelligence: 0.85
    punctuality: 0.98
    procrastination: 0.05
    gpa_target: 4.0

  average_student:
    diligence: 0.6
    intelligence: 0.6
    punctuality: 0.7
    procrastination: 0.4
    gpa_target: 3.0

  struggling_student:
    diligence: 0.4
    intelligence: 0.5
    punctuality: 0.5
    procrastination: 0.7
    gpa_target: 2.5

  brilliant_slacker:
    diligence: 0.3
    intelligence: 0.95
    punctuality: 0.4
    procrastination: 0.8
    gpa_target: 3.0
```

**Tasks:**
- [ ] Define personality trait system
- [ ] Create personality archetypes
- [ ] Implement personality -> behavior mapping
- [ ] Add randomization/variation

---

### 3.3 LLM Decision Making

Use LLM for complex decisions.

```python
class StudentAgent(BaseAgent):
    async def decide_action(self, context: SimulationContext) -> Action:
        """Use LLM to decide next action."""

        state = await self.gather_state()

        prompt = self.build_prompt(state, context)

        response = await self.llm.complete(
            model="gpt-4o-mini",  # or claude-3-haiku for cost
            messages=[
                {"role": "system", "content": self.system_prompt},
                {"role": "user", "content": prompt}
            ],
            tools=self.available_tools
        )

        return self.parse_action(response)

    @property
    def available_tools(self):
        return [
            {"name": "attend_class", "params": {"session_id": "int"}},
            {"name": "skip_class", "params": {"session_id": "int", "reason": "str"}},
            {"name": "work_on_assignment", "params": {"assignment_id": "int", "hours": "float"}},
            {"name": "submit_assignment", "params": {"assignment_id": "int"}},
            {"name": "check_grades", "params": {}},
            {"name": "study", "params": {"course_id": "int", "hours": "float"}},
            {"name": "rest", "params": {}},
        ]
```

**Tasks:**
- [ ] Create LLM integration layer
- [ ] Define tool schemas for each agent type
- [ ] Implement prompt templates
- [ ] Add response parsing
- [ ] Handle API errors gracefully

---

### 3.4 Content Generation

LLM-generated academic content.

**For Professors:**
- Assignment descriptions and rubrics
- Lecture notes summaries
- Feedback on submissions
- Exam questions

**For Students:**
- Assignment submissions (essays, short answers)
- Discussion posts
- Study notes

**Tasks:**
- [ ] Create content generation prompts
- [ ] Implement quality variation based on traits
- [ ] Add plagiarism-like similarity for realism
- [ ] Create grading rubric matching

---

## Phase 4: Advanced Features

### 4.1 Simulation Dashboard

Real-time monitoring of the simulation.

**Metrics to Display:**
- Current simulation date/time
- Active agents count
- Actions per minute
- Current class sessions
- Pending assignments
- Grade distribution trends
- Attendance rates
- Agent decision patterns

**Tasks:**
- [ ] Create dashboard API endpoints
- [ ] Build React dashboard component
- [ ] Add real-time updates (WebSocket or polling)
- [ ] Create visualization charts

---

### 4.2 Scenario System

Pre-defined simulation scenarios.

**Example Scenarios:**
- "Normal semester" - Regular operation
- "Midterm week" - High stress, many exams
- "Drop deadline" - Decisions about withdrawing
- "New student orientation" - Fresh enrollment period
- "Grade dispute" - Test grade change workflow

**Tasks:**
- [ ] Define scenario schema
- [ ] Create scenario loader
- [ ] Build scenario editor
- [ ] Add scenario triggers

---

### 4.3 Analytics & Insights

Analyze simulation outcomes.

**Reports:**
- Student success predictors
- Course difficulty analysis
- Professor grading patterns
- Attendance impact on grades
- Procrastination effects
- Workload optimization

**Tasks:**
- [ ] Create analytics service
- [ ] Build report generators
- [ ] Add data export
- [ ] Create comparison tools

---

## Implementation Checklist

### Phase 1: Core Academic Features
- [x] **1.1 Class Sessions** - Migration, Model, Controller, Service, Tests (COMPLETED 2025-01-24)
- [x] **1.2 Assignments** - Migration, Model, Controller, Tests (COMPLETED 2025-01-24)
- [ ] **1.3 Submissions** - Migration, Model, Controller, Service, Tests
- [ ] **1.4 Gradebook** - Service, Controller, Tests
- [ ] **1.5 Materials** - Migration, Model, Controller, Tests
- [ ] **1.6 Announcements** - Migration, Model, Controller, Tests

### Phase 2: Simulation Infrastructure
- [ ] **2.1 Simulation Clock** - State table, Clock service, API
- [ ] **2.2 Agent Registry** - Tables, Models, Registry service
- [ ] **2.3 Event Queue** - Table, Model, Event processor
- [ ] **2.4 Basic Behaviors** - Rule-based agent behaviors

### Phase 3: LLM Agents
- [ ] **3.1 Agent Service** - Python project setup
- [ ] **3.2 Personalities** - Trait system, Archetypes
- [ ] **3.3 LLM Decisions** - Integration, Tools, Prompts
- [ ] **3.4 Content Gen** - Assignment/submission generation

### Phase 4: Advanced
- [ ] **4.1 Dashboard** - Real-time monitoring
- [ ] **4.2 Scenarios** - Pre-defined simulation configs
- [ ] **4.3 Analytics** - Outcome analysis

---

## Technical Decisions

### Agent Service Language
**Recommendation: Python**
- Better LLM library ecosystem (langchain, litellm, etc.)
- Easier async handling for many agents
- Can use FastAPI for agent control API

### LLM Provider
**Recommendation: Start with GPT-4o-mini or Claude 3 Haiku**
- Cost-effective for high volume
- Fast response times
- Upgrade to larger models for complex decisions

### Communication Pattern
**Recommendation: HTTP API calls**
- Agents call Laravel API directly
- Simple, debuggable, matches real-world usage
- Can add WebSocket for real-time events later

### Time Simulation
**Recommendation: Discrete event simulation**
- Jump from event to event, not continuous ticks
- More efficient for sparse activity periods
- Natural handling of scheduled events

---

## Open Questions

1. **How many agents can run simultaneously?**
   - LLM rate limits will be the bottleneck
   - May need agent batching or queueing

2. **How realistic should content be?**
   - Full essays vs. placeholder text
   - Cost vs. realism tradeoff

3. **Should agents have memory?**
   - Remember past interactions
   - Learn from outcomes
   - Adds complexity but increases realism

4. **Multi-term persistence?**
   - Do agents "remember" previous semesters?
   - GPA history influences current behavior?

---

## Next Steps

1. **Start with Phase 1.1-1.3** (Class Sessions, Assignments, Submissions)
2. Run existing demo through new features manually
3. Add Phase 1.4 (Gradebook) to calculate grades
4. Then move to Phase 2 for simulation infrastructure

Ready to begin with Class Sessions?
