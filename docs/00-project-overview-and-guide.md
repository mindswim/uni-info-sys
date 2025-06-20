# University Admissions System: Developer's Guide

This document is a comprehensive guide to the University Admissions System backend. Its purpose is to serve as a single source of truth for understanding the project's architecture, technology stack, and file structure.

## Table of Contents
1. [Technology Stack & Development Environment](#technology-stack--development-environment)
2. [Root Directory File Structure](#root-directory-file-structure)
3. [Core Application Directories](#core-application-directories)

---

## Technology Stack & Development Environment

This project uses **Laravel Sail** for its local development environment, which is defined in the `docker-compose.yml` file. Sail is Laravel's official, pre-packaged Docker environment, providing a consistent and robust setup.

Our configuration includes:
- **`laravel.test`**: The main application service running PHP 8.4.
- **`mysql`**: The database service, using MySQL 8.0. While Laravel supports many databases, MySQL is a very common and robust choice in the ecosystem.
- **`redis`**: An in-memory data store used for caching and managing background job queues to improve performance.
- **`mailpit`**: A local email testing tool that catches all outgoing emails from the application, allowing you to view them in a web interface without sending real emails.

---

## Root Directory File Structure

This is a breakdown of every file and folder in the project's root directory.

| File / Folder         | Purpose                                                                                                                                                             |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **System & Git**      |                                                                                                                                                                     |
| `.`                   | A reference to the current directory itself.                                                                                                                        |
| `..`                  | A reference to the parent directory.                                                                                                                                |
| `.editorconfig`       | Defines and maintains consistent coding styles (like indentation and character sets) between different editors and IDEs.                                            |
| `.env`                | **Ignored by Git.** Holds your local, machine-specific environment variables like database passwords and API keys. This is where you configure your local setup.      |
| `.env.example`        | A template for the `.env` file. When a new developer clones the project, they copy this to `.env` and fill in their own credentials.                                  |
| `.git`                | The hidden directory where Git stores all of its internal tracking data for your project's version history.                                                         |
| `.gitattributes`      | Defines attributes per path. For example, it can be used to tell Git how to handle line endings.                                                                    |
| `.gitignore`          | A crucial file that tells Git which files and directories to intentionally ignore and not track (e.g., `/vendor`, `/node_modules`, `.env`).                            |
| **Framework & Code**  |                                                                                                                                                                     |
| `README.md`           | The "front door" of the project. It provides a high-level summary and directs visitors to the more detailed documentation. It's often the first file a new person reads. |
| `app/`                | The heart of your application. Contains all your core PHP code, organized into subdirectories like `Http/Controllers` (business logic), `Models` (data representation), `Policies` (security), and `Services` (complex operations). This is where most of your development work happens. |
| `artisan`             | The command-line interface included with Laravel. It provides a huge number of helpful commands (e.g., `php artisan make:controller`) that automate common tasks and speed up development significantly. |
| `bootstrap/`          | Contains the `app.php` file which "boots up" the framework. Also holds a cache folder for framework performance optimization.                                       |
| `composer.json`       | The manifest for your PHP dependencies. It lists all the external packages your project requires.                                                                   |
| `composer.lock`       | Records the exact versions of dependencies that were installed. This ensures that every developer on the team uses the same package versions.                         |
| `config/`             | Contains all of your application's configuration files. A great place to store settings for your services.                                                         |
| `database/`           | Holds your database migrations, model factories, and seeders. This is where you define and manage your application's data structure.                               |
| `docker-compose.yml`  | The configuration file for Docker. It defines the services (MySQL, Redis, etc.) that make up your Laravel Sail development environment.                               |
| `docs/`               | The directory where all project documentation, including this guide and your task plans, is stored.                                                                 |
| `phpunit.xml`         | The configuration file for PHPUnit, the testing framework used by Laravel. It defines your test suites and testing environment.                                       |
| `public/`             | The web server's document root and the only publicly accessible directory. It contains the `index.php` file, which is the single entry point for all HTTP requests into your application, ensuring a secure and consistent request flow. |
| `resources/`          | Contains your un-compiled assets (like JavaScript and CSS), which will be processed by a build tool like Vite. It also holds language files for translations and view files (if you were building a traditional web app). |
| `routes/`             | Contains all of the **Route Definitions** for your application. A route is a rule that maps a specific URL and HTTP method (e.g., `GET /api/v1/students`) to a specific `Controller` method that should handle the request. This file acts as the primary "switchboard" for all incoming traffic. |
| `storage/`            | Holds files generated by the framework. This includes logs (`storage/logs`), caches (`storage/framework/cache`), and any files your application might upload and store (`storage/app`). |
| `tests/`              | Contains your automated tests. `Feature` tests are for testing larger pieces of functionality (like an API endpoint), while `Unit` tests are for testing small, isolated pieces of code (like a single method in a class). |
| `vendor/`             | **Ignored by Git.** The directory where Composer installs all of your project's third-party PHP dependencies. You should never edit files in this directory directly, as they are managed by Composer. |

## Core Application Directories

This section provides a detailed explanation of the core application directories and their purpose.

### `app/`

The `app/` directory contains all of your core PHP code. This includes:
- **Models**: These are classes that represent the data and logic of your application.
- **Controllers**: These are classes that handle incoming HTTP requests and return responses.
- **Services**: These are classes that perform specific tasks or operations.
- **Policies**: These are classes that define authorization rules for your application.

### `config/`

The `config/` directory contains all of your application's configuration files. This includes:
- **Services**: Settings for your services, such as database connections and API keys.
- **Framework**: Settings for the framework itself, such as cache settings and logging.

### `database/`

The `database/` directory contains your database migrations, model factories, and seeders. This is where you define and manage your application's data structure.

### `public/`

The `public/` directory contains the web server's document root. It includes the `index.php` file, which is the single entry point for all HTTP requests to your application.

### `resources/`

The `resources/` directory contains your un-compiled assets. This includes:
- **CSS**: Stylesheets for your application.
- **JavaScript**: JavaScript files for your application.
- **Language Files**: Translation files for your application.
- **Views**: Templates for your application.

### `routes/`

The `routes/` directory contains all of the route definitions for your application. These include:
- **API Routes**: These routes are defined in the `api.php` file and are used for API endpoints.
- **Web Routes**: These routes are defined in the `web.php` file and are used for web pages.

### `storage/`

The `storage/` directory holds compiled Blade templates (not used in this project), file-based sessions, caches, logs, and any other files generated by the framework.

### `tests/`

The `tests/` directory contains your automated tests. Laravel provides a structure for both "Feature" tests (testing endpoints) and "Unit" tests (testing small pieces of code). 

---

## Deep Dive: The `app` Directory Structure

The `app` directory is the heart of your application. While the other directories in the root are mostly for configuration and framework boilerplate, this is where your project's unique code lives. Laravel organizes the `app` directory by convention to keep different types of logic separate and predictable.

### Standard Laravel Directories

These directories are part of the standard Laravel framework. Even if they don't all exist when you start a new project, Laravel knows about them and will create them when you use `artisan` commands.

| Directory             | Laravel's Purpose (The "What")                                                                                                                                                                                                                                       | This Project's Use (The "How")                                                                                                                                                                                             |
| --------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Console/`            | Contains your custom `artisan` commands. This allows you to create your own command-line tasks for automation, scheduled jobs, or other utilities.                                                                                                                   | You have a `CheckWaitlists` command here, which is a perfect use case: a task to be run on a schedule to automatically check and promote students from course waitlists.                                                   |
| `Http/`               | Handles all logic related to the Hypertext Transfer Protocol (HTTP). It's subdivided into `Controllers`, `Middleware`, and `Requests`. A **Controller** is a class whose methods are the final destination for a route. It orchestrates the business logic for a request, calling on models, services, and other classes to fulfill it before returning a response. **Note:** The name refers to the protocol itself; the encryption that makes it **HTTPS** is handled at the web server level, not by this application code. | This is the most important directory for your API. It contains all your API controllers (in the `Api/V1` subfolder), form requests for validation, and middleware for security.                                          |
| `Jobs/`               | Houses "Jobs" that can be pushed onto a queue and processed in the background. This is essential for long-running tasks, as it allows your application to respond to a user instantly while the heavy work happens separately.                                     | You use this for bulk imports (`ProcessCourseImport`, `ProcessGradeImport`) and for processing waitlists. This is a best practice for improving API response times and ensuring reliability.                                 |
| `Models/`             | Contains all of your Eloquent model classes. Each model corresponds to a database table and allows you to interact with that table using an elegant, object-oriented syntax. Models are the core of your application's data layer.                                   | You have a very well-defined set of models here that map directly to your university's data structure (Student, Course, Enrollment, etc.). This is the backbone of your entire application.                                 |
| `Notifications/`      | Defines classes that represent notifications sent by your application. These can be sent via various "channels" like email, Slack, or, in your case, stored in the database to be displayed on a user's dashboard.                                                  | You have an `ApplicationStatusUpdated` notification. This allows you to reliably inform a student when the status of their admission application changes.                                                              |
| `Policies/`           | Holds authorization "policy" classes. Each policy corresponds to a model and defines the rules for who can perform actions (like `view`, `create`, `update`, `delete`) on that model's records. This is the foundation of your security and permissions system.  | You have a comprehensive set of policies, one for almost every model. This is critical for ensuring a student can only see their own data while an admin can manage everything. This is a sign of a very secure design. |
| `Providers/`          | Service Providers are the central place to configure and "boot" your application. They are where you register custom services, bind classes into the service container, register policies, and more.                                                              | Your `AuthServiceProvider` is used to register all your policies, and `RateLimitServiceProvider` configures your API rate limits. This is standard and correct usage.                                                      |

> **Note on Other Standard Directories:** Laravel also has conventions for other directories like `Mail` (for email templates), `Listeners` (for event-driven logic), and `Rules` (for complex custom validation rules). These directories don't exist in your project yet simply because you haven't needed to create those types of classes. The moment you run `php artisan make:mail WelcomeEmail`, Laravel will create the `app/Mail` directory for you.

### Custom Project Directories

These directories are not part of the standard Laravel framework but have been created to further organize the codebase according to best practices.

| Directory     | Purpose                                                                                                                                                                       | Why It's a Custom Directory                                                                                                                                                                                                                                                         |
| ------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Exceptions/` | Contains custom, application-specific PHP Exception classes.                                                                                                                    | Instead of throwing a generic `\Exception`, your code can throw a very specific `PrerequisiteNotMetException`. This makes your code more readable and allows for much cleaner, more precise error handling in your controllers or exception handler. It's a very professional practice. |
| `Filters/`    | Houses classes designed to filter Eloquent queries based on HTTP request parameters.                                                                                          | This prevents your controller `index` methods from becoming bloated with complex `if/else` statements for handling search and filter logic. By moving this into a dedicated `EnrollmentFilter` class, the controller stays clean and the filtering logic becomes reusable and testable. |

---

### Area for Investigation: Redundant Controllers

During the analysis of the `app/Http/Controllers` directory, a significant issue was identified that requires a deeper investigation before we proceed with cleanup.

*   **The Issue**: There appears to be a duplicate set of resource controllers. One set exists in the root `app/Http/Controllers` directory, and another, more complete set exists within `app/Http/Controllers/Api/V1`.
*   **Hypothesis**: The controllers in the root directory are likely obsolete artifacts from a previous version of the application that used a standard web/Inertia frontend. The controllers within `Api/V1` are the correct, modern ones that power your stateless JSON API.
*   **The Risk**: Keeping obsolete code creates ambiguity and increases the risk of "code rot." A future developer might mistakenly edited a controller in the root, leading to bugs that are difficult to trace because the changes have no effect on the live API.
*   **Next Step**: Before we delete these files, we must perform a careful review. We need to check the `routes/api.php` and `routes/web.php` files to confirm which controllers are actively being used. Once we verify that the root controllers are indeed unused, we can safely delete them. This will be a key task in our continued cleanup. 