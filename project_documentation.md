# University Admissions System - Project Documentation

## 1. Project Overview

This project, named `university-admissions`, is a comprehensive system designed to manage the student admissions and academic lifecycle within a university setting. It is built using the Laravel PHP framework and exposes a RESTful API for interaction. The system covers functionalities from student application and enrollment to course management, academic record keeping, and user role/permission management.

## 2. Technology Stack

*   **Backend Framework:** Laravel 11.9 (PHP 8.2+)
*   **Database:** MySQL (schema defined in `database/schema/mysql-schema.sql`)
*   **API Documentation:** L5-Swagger (for OpenAPI/Swagger generation)
*   **Authentication:** Laravel Sanctum (token-based API authentication)
*   **Auditing:** OwenIt/Laravel-Auditing (for tracking model changes)
*   **Metrics:** Prometheus (via `promphp/prometheus_client_php`)
*   **Frontend Integration (Implied):** Inertia.js (via `inertiajs/inertia-laravel`) and Ziggy (for Laravel routes in JavaScript).
*   **Development Environment:** Docker (via `docker-compose.yml` and Laravel Sail)
*   **Testing:** PHPUnit
*   **Code Style:** Laravel Pint

## 3. Core Functionalities & Architecture

### 3.1. Database Schema

The database schema is well-structured and covers the following key domains:

*   **User Management:** `users`, `students`, `staff` (linking to a central `users` table).
*   **Academic Hierarchy:** `faculties`, `departments`, `programs`.
*   **Course & Enrollment:** `courses`, `course_prerequisites`, `terms`, `course_sections`, `enrollments`.
*   **Admissions Process:** `admission_applications`, `program_choices`, `academic_records`, `documents`.
*   **Infrastructure:** `buildings`, `rooms`.
*   **Security:** `roles`, `permissions`, and pivot tables for many-to-many relationships.
*   **System:** Standard Laravel tables for caching, jobs, notifications, etc., and an `audits` table for change tracking.

### 3.2. API Endpoints (`routes/api.php`)

The application provides a comprehensive RESTful API, versioned under `/v1`. Key characteristics include:

*   **Resource-Oriented:** Extensive use of `apiResource` for standard CRUD operations on entities like `faculties`, `departments`, `programs`, `students`, `enrollments`, etc.
*   **Authentication & Authorization:** Most endpoints are protected by `auth:sanctum`. Role-Based Access Control (RBAC) is implemented, allowing fine-grained control over permissions.
*   **Custom Business Logic Endpoints:** Specific actions like `enrollments/{enrollment}/withdraw`, `enrollments/swap`, and import functionalities (`imports/courses`, `course-sections/{courseSection}/import-grades`) are exposed.
*   **Monitoring Endpoints:** Unauthenticated `/health` and `/metrics` endpoints are available for system health checks and Prometheus metric scraping, respectively.
*   **Soft Deletes:** Endpoints for restoring and force-deleting soft-deleted resources (e.g., students, documents, courses, admission applications) are provided.

### 3.3. Models (`app/Models`)

Laravel Eloquent models form the data layer, encapsulating data and relationships:

*   **Eloquent Features:** Utilizes `HasFactory`, `SoftDeletes`, and `Auditable` traits extensively.
*   **Relationships:** Clearly defines `hasMany`, `belongsTo`, `belongsToMany` relationships between entities, mirroring the database schema.
*   **Encapsulated Logic:** Some models contain business logic directly related to their data, such as `Student::calculateGPA()` and `Term::isWithinAddDropPeriod()`, promoting data integrity and reusability.

### 3.4. Services (`app/Services`)

The `app/Services` directory centralizes complex business logic, ensuring a clean separation of concerns:

*   **`AdmissionService`:** Manages the creation and status updates of admission applications, including asynchronous notifications.
*   **`EnrollmentService`:** A critical service handling student enrollment with robust validations (student activity, course section availability, duplicate enrollments, prerequisites, schedule conflicts), transaction management, waitlist promotion, and withdrawal logic. It throws specific custom exceptions for business rule violations.
*   **`MetricsService`:** Responsible for collecting and exposing application metrics for monitoring purposes.

## 4. Development & Operations

*   **Containerization:** The project is set up for Docker-based development using `docker-compose.yml` and Laravel Sail, simplifying environment setup.
*   **Testing:** PHPUnit is used for unit and feature testing, indicating a commitment to code quality.
*   **Code Standards:** Laravel Pint is used for enforcing consistent code style.
*   **Asynchronous Processing:** The use of Jobs (e.g., `SendApplicationStatusNotification`, `ProcessWaitlistPromotion`) suggests that the application leverages Laravel's queue system for background tasks, improving responsiveness.

## 5. Key Takeaways

This `university-admissions` system is a robust, well-architected Laravel application. It demonstrates a strong adherence to modern PHP and Laravel best practices, including clear separation of concerns, comprehensive API design, robust data modeling, and a focus on testability and observability. The project is designed to handle the complexities of a university admissions and academic management system efficiently and reliably.
