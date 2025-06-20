# Collaborative Development Task Framework

This document outlines the structured, human-in-the-loop workflow for converting a high-level plan (like a roadmap) into a series of discrete, implemented, and verified development tasks. The process ensures quality and maintainability by scoping work into logical increments and requiring human approval at key checkpoints.

## Phase 1: Task Derivation from Source Document

**Input**: A high-level source document (e.g., `roadmap.md`, `project_plan.md`) outlining project goals, features, or phases.

**Process**:
1.  The AI assistant will analyze the source document to understand the overall objectives.
2.  The AI will break down the high-level goals into a granular list of development tasks.
3.  Each task will be scoped to represent a logical, self-contained unit of work that is appropriate for a single commit or pull request, following industry best practices for incremental development. The result is a comprehensive implementation plan.

## Phase 2: Task Execution & Verification Cycle

Each task from the derived implementation plan follows this iterative execution cycle. The AI will handle one task at a time.

---

### **Task [Number]: [Concise Task Title]**

**Goal**: A brief, one-sentence description of what this task aims to achieve and why it is important for the project.

**Implementation Steps**:
A numbered list of precise, step-by-step instructions required to complete the task. This section must be detailed enough for clear execution and review.

1.  **Code Generation/Modification**: Clearly state which files to create, edit, or delete.
2.  **Commands**: Specify any necessary terminal commands (e.g., a command to generate a component, install a dependency, or run database migrations).
3.  **Code Snippets**: Provide the exact code to be added or changed. Use code blocks with the correct language and provide sufficient surrounding context to avoid ambiguity.
4.  **Architectural Context**: Briefly explain how the changes fit into the existing application structure (e.g., "This new Service class will encapsulate business logic, decoupling it from the controller/view layer").

**Testing & Verification**:
A clear set of instructions to validate that the implementation was successful and did not introduce regressions.

1.  **Automated Tests**: Provide instructions for running specific unit or feature tests (e.g., `[test_runner_command] --filter=[TestName]`). The expected outcome is that all new and existing tests pass.
2.  **Manual Verification**: If automated tests are not feasible or sufficient, provide explicit steps for manual verification. This could involve running the local server and making an API request or using a UI testing tool to check a component's behavior (e.g., "Make a POST request to `/api/v1/endpoint` with a specific JSON body and assert that the response is a `201 Created` with the expected data structure").

**Checkpoint & Human Approval (Mandatory Stop)**:
This is a critical step to ensure quality and maintain human oversight before permanently recording changes.

1.  **AI Statement of Completion**: The AI will explicitly state: "Task [Number] is complete. The implementation has been verified, and all associated tests are passing."
2.  **AI Request for Approval to Commit**: The AI will then stop and ask for permission to use version control: "**Awaiting your approval to proceed with `git add .`, `git commit`, and `git push`.**"
3.  **Human Action**: The user reviews the completed work and provides explicit approval (e.g., "approved", "looks good, proceed").
4.  **AI Action & Confirmation**:
    *   Upon approval, the AI executes the Git commands.
    *   The AI confirms the actions were successful: "The changes for Task [Number] have been committed and pushed."
5.  **AI Request to Proceed**: The AI will then ask for permission to begin the next task: "**Ready to proceed to Task [Number+1]. Please confirm.**"
6.  **Human Action**: The user gives the green light to start the next cycle.

---

This cycle repeats for every task defined in the implementation plan, ensuring a steady, verifiable, and high-quality development pace. 