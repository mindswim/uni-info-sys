# Multi-Agent Simulation Design for University SIS

## Distributed Agent System vs Multi-Agent System

These terms are often conflated, but they solve different problems:

| Aspect | Distributed Agent System | Multi-Agent System |
|--------|-------------------------|-------------------|
| **Primary goal** | Parallelize work across workers | Simulate autonomous entities interacting |
| **Agent identity** | Interchangeable workers | Unique personas with goals |
| **State** | Stateless (task in, result out) | Stateful (memory, relationships, history) |
| **Coordination** | Central orchestrator assigns work | Emergent from agent interactions |
| **Time model** | Task completion driven | Simulation clock / real-time |
| **Example** | 10 workers processing a queue | 100 students living campus life |

**Distributed Agent System** (task orchestration):
```
Task Queue -> Worker Pool -> Results
"Here's work, whoever's free, do it"
```

**Multi-Agent System** (what a simulated university needs):
```
Agents with Goals + Environment + Time -> Emergent Behavior
"Each agent decides what to do based on their situation"
```

The key distinction: In a distributed system, the *system* decides what agents do. In a multi-agent system, *agents* decide what they do. A university simulation needs the latter - Professor Martinez doesn't get assigned "grade papers" from a queue; she decides to grade them because her syllabus says grades are due Friday.

---

## Person-Centric Multi-Agent Simulation

### Core Concept: Simulated People, Not Task Workers

```
Time flows -> People wake up -> They have goals ->
They take actions -> Actions affect the world ->
World state changes -> New day begins
```

Every entity is a **Person** with:
- **Identity**: Name, role, background
- **Goals**: What they're trying to achieve
- **State**: Current situation, stress, workload
- **Agency**: They decide their own actions

### The Three Types of People

```
STUDENTS                FACULTY                STAFF
--------                -------                -----
"I want to graduate     "I want my students    "I want to
 with a good GPA and     to learn and my       help students
 enjoy college life"     research to succeed"  navigate the
                                               system"

Actions:                Actions:               Actions:
- Go to class           - Teach class          - Advise
- Study                 - Grade work           - Process
- Do assignments        - Create assignments     requests
- Socialize             - Office hours         - Enforce
- Sleep/rest            - Research               policy
- Register for courses  - Meetings
```

### How It Works: A Day in the Life

```
MONDAY, SEPTEMBER 15, 8:00 AM

Alex Chen (Student Agent) wakes up

Current State:
- Energy: 85%
- Stress: 40%
- Has CALC101 at 9am
- Has CS201 assignment due tomorrow
- Motivation: 0.7 (moderately motivated)

Agent thinks: "What should I do?"

LLM Decision: "I should go to Calculus, then work on my
CS assignment in the library. Maybe grab lunch with friends
around noon."

Actions scheduled:
- 9:00 - Attend CALC101 (attendance recorded)
- 10:30 - Walk to library
- 11:00 - Work on CS201 assignment
- 12:30 - Lunch break
- 2:00 - Continue assignment work
- 4:00 - Submit assignment (submission created in DB)
```

---

## Architecture

### The Simulation Loop

```python
class UniversitySimulation:
    def __init__(self):
        self.clock = SimulationClock(start=datetime(2024, 8, 26))  # Fall semester
        self.people: list[Person] = []  # All students, faculty, staff

    async def run_day(self):
        """Simulate one day at the university"""

        # Morning: Everyone plans their day
        for person in self.people:
            await person.plan_day(self.clock.current_date)

        # Hour by hour: Execute plans, handle events
        for hour in range(7, 23):  # 7am to 11pm
            self.clock.set_hour(hour)

            # Scheduled events (classes, meetings, deadlines)
            events = self.get_events_at(hour)
            for event in events:
                await self.handle_event(event)

            # Each person acts based on their plan
            for person in self.people:
                action = person.get_action_for_hour(hour)
                if action:
                    await person.execute_action(action)

        # End of day: Update states
        for person in self.people:
            await person.end_of_day()
```

### Person Model

```python
class Person:
    """Base class for all simulated people"""

    # Identity (immutable)
    id: int
    name: str
    role: Literal["student", "faculty", "staff"]

    # Personality (shapes decisions)
    traits: PersonalityTraits

    # Goals (what they're working toward)
    goals: list[Goal]

    # Current state (changes constantly)
    state: PersonState

    # Memory (past experiences affect future)
    memory: AgentMemory

    # Relationships (affects interactions)
    relationships: dict[int, Relationship]

    async def decide(self, context: Context) -> Action:
        """LLM-powered decision making"""
        prompt = self.build_decision_prompt(context)
        response = await llm.generate(prompt)
        return self.parse_action(response)


class PersonalityTraits:
    """Stable characteristics that affect behavior"""
    conscientiousness: float  # 0-1: How organized/disciplined
    openness: float           # 0-1: Curiosity, creativity
    extraversion: float       # 0-1: Social energy
    agreeableness: float      # 0-1: Cooperation, empathy
    neuroticism: float        # 0-1: Stress sensitivity

    # Domain-specific
    academic_motivation: float
    procrastination_tendency: float


class PersonState:
    """Dynamic state that changes throughout simulation"""
    energy: float           # 0-1: Physical/mental energy
    stress: float           # 0-1: Current stress level
    mood: float             # -1 to 1: Negative to positive
    location: str           # Where they are right now
    current_activity: str   # What they're doing

    # For students
    courses_enrolled: list[int]
    assignments_pending: list[Assignment]
    gpa: float

    # For faculty
    sections_teaching: list[int]
    grading_queue: list[Submission]
    research_progress: float


class Goal:
    """Something the person is trying to achieve"""
    description: str
    priority: float
    deadline: Optional[datetime]
    progress: float
```

### Action System

```python
class ActionType(Enum):
    # Student actions
    ATTEND_CLASS = "attend_class"
    STUDY = "study"
    DO_ASSIGNMENT = "do_assignment"
    SUBMIT_ASSIGNMENT = "submit_assignment"
    REGISTER_FOR_COURSE = "register_for_course"
    DROP_COURSE = "drop_course"
    VISIT_OFFICE_HOURS = "visit_office_hours"
    SOCIALIZE = "socialize"
    EAT = "eat"
    SLEEP = "sleep"

    # Faculty actions
    TEACH_CLASS = "teach_class"
    GRADE_WORK = "grade_work"
    CREATE_ASSIGNMENT = "create_assignment"
    HOLD_OFFICE_HOURS = "hold_office_hours"
    RESPOND_TO_STUDENT = "respond_to_student"
    RESEARCH = "research"
    ATTEND_MEETING = "attend_meeting"

    # Staff actions
    ADVISE_STUDENT = "advise_student"
    PROCESS_REQUEST = "process_request"
    REVIEW_APPLICATION = "review_application"
```

### Interaction Model

```
Student Alex                        Professor Kim
     |                                    |
     |  "I don't understand problem 3"    |
     | ----------------------------------> |
     |                                    |
     |                    [Kim decides    |
     |                     how to help    |
     |                     based on her   |
     |                     personality    |
     |                     and workload]  |
     |                                    |
     |  "Let me explain it this way..."   |
     | <---------------------------------- |
     |                                    |
[Alex's understanding                     |
 improves, stress                         |
 decreases, relationship                  |
 with Kim strengthens]                    |
```

---

## System Architecture Diagram

```
+-------------------------------------------------------------------+
|                    UNIVERSITY SIMULATION                            |
|                                                                    |
|  +--------------------------------------------------------------+ |
|  |                   SIMULATION CLOCK                            | |
|  |   Advances time, triggers scheduled events                    | |
|  +-----------------------------+--------------------------------+ |
|                                |                                   |
|                                v                                   |
|  +--------------------------------------------------------------+ |
|  |                    PERSON ENGINE                              | |
|  |                                                               | |
|  |   +---------+   +---------+   +---------+                    | |
|  |   | Students|   | Faculty |   |  Staff  |                    | |
|  |   |  (103)  |   |  (26)   |   |  (var)  |                    | |
|  |   +----+----+   +----+----+   +----+----+                    | |
|  |        |             |             |                          | |
|  |        +-------------+-------------+                          | |
|  |                      |                                        | |
|  |                      v                                        | |
|  |              +---------------+                                | |
|  |              | LLM Decision  |                                | |
|  |              |    Engine     |                                | |
|  |              +---------------+                                | |
|  |                                                               | |
|  +-----------------------------+--------------------------------+ |
|                                |                                   |
|                                | Actions                           |
|                                v                                   |
|  +--------------------------------------------------------------+ |
|  |                  SIS INTEGRATION                              | |
|  |   Translates agent actions -> API calls -> Database           | |
|  +-----------------------------+--------------------------------+ |
|                                |                                   |
+--------------------------------+-----------------------------------+
                                 |
                                 v
+-------------------------------------------------------------------+
|              EXISTING SIS (university-admissions)                   |
|                                                                    |
|   Laravel API --- PostgreSQL --- Next.js Dashboards               |
|                                                                    |
|   All agent actions become real records:                           |
|   - Enrollments    - Submissions    - Grades                      |
|   - Attendance     - Messages       - etc.                        |
|                                                                    |
+-------------------------------------------------------------------+
```

### Environment (The Campus)

```
Locations where people can be:
- Classrooms (classes happen here)
- Library (studying, research)
- Dorms (rest, socializing)
- Dining halls (meals, socializing)
- Offices (faculty work, meetings)
- Labs (research, project work)

Each location has:
- Capacity
- Current occupants
- Available activities
```

### SIS Integration Layer

```python
class SISIntegration:
    """Bridges simulation actions to real database records"""

    async def record_attendance(self, student_id: int, section_id: int):
        await self.api.post("/api/v1/attendance/bulk", {...})

    async def submit_assignment(self, student_id, assignment_id, content):
        await self.api.post("/api/v1/submissions/submit", {...})

    async def record_grade(self, submission_id, grade, feedback):
        await self.api.post(f"/api/v1/submissions/{submission_id}/grade", {...})

    async def create_enrollment(self, student_id, section_id):
        await self.api.post("/api/v1/enrollments", {...})
```

The SIS database becomes the "world state." When Alex submits an assignment, a real AssignmentSubmission record is created. When Professor Kim grades it, the real grade is stored. The simulation generates behavior; the SIS records reality.

---

## What Needs to Be Built

### 1. Person Engine (Core)
- Identity Store
- State Manager
- Memory System
- Decision Engine (LLM)
- Goal Tracker
- Relationship Graph

### 2. Simulation Clock
- Time advancement with configurable speed
- Event scheduling (priority queue)
- Calendar awareness (class schedules, deadlines)

### 3. Environment Model
- Campus locations with capacity
- Activity availability per location
- People tracking (who is where)

### 4. Action System
- Action definitions per role
- Action execution with SIS API integration
- Energy/stress effects

### 5. Integration Layer
- Maps agent actions to SIS API calls
- All behavior creates real database records
- Existing dashboards show agent activity

---

## Implementation Phases

### Phase 1: Foundation
- SimulationClock with time advancement
- Base Person class with persistent state
- Link agents to existing Student/Staff models

### Phase 2: Student Agents
- StudentAgent with personality traits
- Decision-making for: course registration, assignment work, attendance
- LLM integration for natural behavior

### Phase 3: Faculty Agents
- InstructorAgent for grading, feedback, assignments
- Realistic grading patterns
- Office hours scheduling

### Phase 4: Staff Agents
- AdvisorAgent for course recommendations
- RegistrarAgent for exception handling
- FinancialAidAgent for aid decisions

### Phase 5: Observability
- Real-time dashboard showing agent activity
- Analytics on agent behavior patterns
- Simulation controls (pause, speed, inspect)

---

## Key Insight: The Fundamental Shift

Instead of "what tasks need to be done and who should do them," this models "what do these people want, and what will they do to get it?"

| Distributed Agents (Task Orchestration) | Multi-Agent Simulation (University) |
|-----------------------------------------|-------------------------------------|
| Workers wait for tasks | People have their own goals |
| Orchestrator controls everything | People decide for themselves |
| Tasks are the unit of work | Days/hours are the unit of time |
| Stateless execution | Persistent personas with memory |
| Homogeneous pools | Unique individuals |
| Workflow completion is the goal | Emergent campus life is the goal |
