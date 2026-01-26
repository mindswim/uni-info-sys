# University Multi-Agent Simulation Design

## Overview

A minimal, token-efficient simulation layer that brings the SIS to life with AI agents representing students, faculty, and staff. Agents interact with the existing Laravel API, creating real database records.

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    SIMULATION LAYER (Python)                     │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                   SIMULATION CLOCK                        │  │
│  │   Advances time, triggers scheduled events                │  │
│  └────────────────────────┬─────────────────────────────────┘  │
│                           │                                      │
│                           ▼                                      │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                    PERSON ENGINE                          │  │
│  │                                                           │  │
│  │   ┌─────────┐   ┌─────────┐   ┌─────────┐               │  │
│  │   │ Students│   │ Faculty │   │  Staff  │               │  │
│  │   └────┬────┘   └────┬────┘   └────┬────┘               │  │
│  │        │             │             │                     │  │
│  │        └─────────────┼─────────────┘                     │  │
│  │                      │                                    │  │
│  │                      ▼                                    │  │
│  │              ┌───────────────┐                           │  │
│  │              │ LLM Decision  │                           │  │
│  │              │    Engine     │                           │  │
│  │              └───────────────┘                           │  │
│  │                                                           │  │
│  └────────────────────────┬─────────────────────────────────┘  │
│                           │                                      │
│                           │ Actions                              │
│                           ▼                                      │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                  SIS INTEGRATION                          │  │
│  │   Translates agent actions → API calls → Database         │  │
│  └────────────────────────┬─────────────────────────────────┘  │
│                           │                                      │
└───────────────────────────┼──────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│              EXISTING SIS (university-admissions)                │
│                                                                  │
│   Laravel API ─── MySQL ─── React Frontend                      │
│                                                                  │
│   All agent actions become real records:                         │
│   • Enrollments    • Submissions    • Grades                    │
│   • Attendance     • Messages       • etc.                      │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Minimal Proof of Concept

### The Cast (4 Agents Total)

```
┌─────────────────────────────────────────────────────────────┐
│                    MINIMAL CAST                              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  STUDENT: Alex Chen          INSTRUCTOR: Dr. Kim            │
│  ───────────────────         ──────────────────             │
│  Enrolled in CS201           Teaches CS201                  │
│  Motivation: 0.7             Grading style: Fair            │
│  Procrastinates slightly     Gives detailed feedback        │
│                                                              │
│  ADVISOR: Ms. Martinez       (Optional) PEER: Jordan Lee    │
│  ──────────────────          ────────────────────           │
│  Alex's academic advisor     Another CS201 student          │
│  Helps with registration     For interaction demos          │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### The Scenario: 2-Week Mini-Semester

```
Week 1
──────
Day 1: Semester starts, Alex attends CS201
Day 2: Dr. Kim posts Assignment 1 (due Day 7)
Day 3: Alex decides when to start working
Day 4: Alex works on assignment (or procrastinates)
Day 5: Alex visits office hours (optional interaction)
Day 7: Alex submits assignment

Week 2
──────
Day 8: Dr. Kim grades submission, posts feedback
Day 9: Alex sees grade, reacts (stress/relief)
Day 10: Dr. Kim posts Assignment 2
Day 12: Alex meets with Advisor about next semester
Day 14: End of simulation - show summary
```

---

## Token-Efficient Design

Instead of LLM calls for every decision, use a hybrid approach:

```python
class StudentAgent:
    async def decide_action(self, context: Context) -> Action:
        # CHEAP: Rule-based for routine decisions
        if context.has_class_now():
            return Action.ATTEND_CLASS  # No LLM needed

        if context.assignment_due_tomorrow() and not self.started_assignment:
            return Action.DO_ASSIGNMENT  # No LLM needed

        # EXPENSIVE: LLM only for interesting decisions
        if context.has_conflict() or context.needs_judgment():
            return await self.llm_decide(context)  # ~500 tokens

        # CHEAP: Default behavior based on traits
        return self.default_action_for_time(context.hour)
```

### Estimated Token Usage

| Event | LLM Calls | Tokens |
|-------|-----------|--------|
| Alex plans day (x14 days) | 14 | ~7,000 |
| Alex writes assignment content | 2 | ~2,000 |
| Dr. Kim writes feedback | 2 | ~1,500 |
| Office hours conversation | 1 | ~1,000 |
| Advisor meeting | 1 | ~1,000 |
| **Total** | ~20 calls | **~12,500 tokens** |

**Cost estimate: ~$0.15-0.50** (depending on model)

---

## Detailed Flow

### Day 1: Semester Start

```
8:00 AM - Simulation starts

9:00 AM - CS201 class begins
  └─ Alex.decide() → ATTEND_CLASS (rule-based, no LLM)
  └─ API: POST /attendance {student: alex, section: cs201}
  └─ Dr. Kim teaches (no LLM needed, just state update)

10:00 AM - Class ends
  └─ Alex.decide() → STUDY (default behavior)

Database after Day 1:
  ✓ AttendanceRecord created
  ✓ Alex.energy decreased slightly
```

### Day 2: Assignment Posted

```
Dr. Kim creates Assignment 1:
  └─ LLM generates assignment prompt (~300 tokens)
  └─ API: POST /assignments
     {
       section_id: cs201,
       title: "Implement Binary Search",
       due_date: "Day 7",
       description: [LLM-generated]
     }

Alex receives notification:
  └─ Alex.pending_assignments.append(assignment_1)
  └─ Alex.stress += 0.1
```

### Day 5: Office Hours (Interesting Interaction)

```
Alex.decide() → VISIT_OFFICE_HOURS
  └─ LLM decision: "I'm stuck on edge cases" (~400 tokens)

Interaction (LLM conversation ~800 tokens total):

Alex: "Dr. Kim, I'm not sure how to handle empty arrays"
Dr. Kim: "Good question. Think about the base case..."
Alex: "Oh, I should check length first?"
Dr. Kim: "Exactly. Return -1 for empty input."

After interaction:
  └─ Alex.understanding += 0.2
  └─ Alex.stress -= 0.1
  └─ Alex.relationship[dr_kim] += 0.1
  └─ API: POST /messages (conversation logged)
```

### Day 7: Submission

```
Alex completes and submits:
  └─ LLM generates submission content (~500 tokens)
     "Here's my implementation of binary search..."

  └─ API: POST /submissions
     {
       assignment_id: 1,
       student_id: alex,
       content: [LLM-generated code + explanation],
       submitted_at: "Day 7, 11:45 PM"  // slightly late
     }

Alex state after:
  └─ stress: 0.5 → 0.2 (relief!)
  └─ pending_assignments.remove(assignment_1)
```

### Day 8: Grading

```
Dr. Kim grades Alex's submission:
  └─ LLM evaluates + generates feedback (~600 tokens)

  └─ API: PUT /submissions/1/grade
     {
       grade: 87,
       feedback: "Good implementation! Edge cases handled
                  well after our office hours discussion.
                  Consider adding more comments."
     }

Alex sees grade:
  └─ mood: 0.5 → 0.7 (happy with B+)
  └─ motivation += 0.1 (positive reinforcement)
```

---

## Code Structure

```
simulation/
├── agents/
│   ├── base.py           # 50 lines - Base agent class
│   ├── student.py        # 100 lines - StudentAgent
│   └── faculty.py        # 80 lines - FacultyAgent
├── core/
│   ├── clock.py          # 40 lines - Simple day/hour tracker
│   └── engine.py         # 60 lines - Main loop
├── integration/
│   └── sis.py            # 50 lines - API client
└── run.py                # 30 lines - Entry point

Total: ~400 lines of Python
```

---

## Agent Models

### PersonalityTraits

```python
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
```

### PersonState

```python
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
```

### Actions

```python
class ActionType(Enum):
    # Student actions
    ATTEND_CLASS = "attend_class"
    STUDY = "study"
    DO_ASSIGNMENT = "do_assignment"
    SUBMIT_ASSIGNMENT = "submit_assignment"
    VISIT_OFFICE_HOURS = "visit_office_hours"

    # Faculty actions
    TEACH_CLASS = "teach_class"
    GRADE_WORK = "grade_work"
    CREATE_ASSIGNMENT = "create_assignment"
    HOLD_OFFICE_HOURS = "hold_office_hours"

    # Staff actions
    ADVISE_STUDENT = "advise_student"
    PROCESS_REQUEST = "process_request"
```

---

## What This Demonstrates

| Feature | Demonstrated |
|---------|--------------|
| Agent autonomy | Alex decides when to work based on traits |
| LLM decisions | Interesting moments use AI judgment |
| API integration | All actions create real DB records |
| Emergent behavior | Late submission, stress patterns |
| Multi-agent interaction | Office hours conversation |
| State persistence | Relationships, energy, progress |

---

## Future Expansion

Once the minimal POC works, expand by adding:

1. **More students** - Different personality types, competition for grades
2. **More courses** - Schedule conflicts, workload balancing
3. **More interactions** - Study groups, peer tutoring
4. **More staff** - Financial aid processing, hold management
5. **Full semester** - 16 weeks with midterms, finals, registration

---

## Key Insight

The SIS becomes "ground truth" - the simulation generates behavior, but all actions create real database records visible in existing dashboards. You can pause the simulation, look at the React frontend, and see exactly what "happened" - because it did happen in the database.

---

*Design document created: January 2026*
