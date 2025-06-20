# University Admissions System: Developer's Guide

This document is a comprehensive guide to the University Admissions System backend. Its purpose is to serve as a single source of truth for understanding the project's architecture, technology stack, and file structure.

## Table of Contents
1. [Project Overview](#project-overview)
2. [Quick Start (with Docker)](#quick-start-with-docker)
3. [Laravel Framework Overview](#laravel-framework-overview)
4. [Technology Stack & Development Environment](#technology-stack--development-environment)
5. [Root Directory File Structure](#root-directory-file-structure)
6. [Core Application Directories](#core-application-directories)

---

## Project Overview

This robust API serves as the central data and business logic layer for managing the entire student and academic lifecycle, from initial applications and document uploads to course enrollment and academic administration.

### Key Architectural Features
- **RESTful API**: A clean, versioned API for all backend operations.
- **Role-Based Access Control (RBAC)**: Granular permissions for different user roles (Admin, Student, Faculty).
- **Service-Oriented Architecture**: Complex business logic is encapsulated in dedicated Service classes.
- **Dockerized Environment**: A consistent and portable development environment managed by Laravel Sail.
- **Comprehensive Test Suite**: High test coverage with both Feature and Unit tests.

---

## Quick Start (with Docker)

1.  Ensure you have Docker Desktop installed and running.
2.  Clone this repository: `git clone <repository-url>`
3.  Navigate into the project directory: `cd university-admissions`
4.  Copy the environment file: `cp .env.example .env`
5.  Start the Docker containers: `./vendor/bin/sail up -d`
6.  Run database migrations: `./vendor/bin/sail artisan migrate --seed`
7.  The application is now running at `http://localhost`.

---

## Laravel Framework Overview

Laravel is a web application framework with an expressive, elegant syntax. It provides a structure and starting point for creating your application, allowing you to focus on creating something amazing while we sweat the details. Here are the core concepts relevant to this project:

-   **Routing**: Defined in the `routes/` directory, routing is how Laravel maps incoming URLs (like `/api/v1/students`) to specific controller methods that handle the request. This is the entry point for all web requests.

-   **Controllers**: Located in `app/Http/Controllers/`, controllers are responsible for processing incoming requests, interacting with the application's business logic, and returning a response (like a JSON object for an API).

-   **Eloquent ORM (Models)**: Located in `app/Models/`, Eloquent is Laravel's Object-Relational Mapper. It provides a beautiful, simple way to interact with your database. Each database table has a corresponding "Model" which is used to query, insert, and update data in that table (e.g., the `Student` model maps to the `students` table).

-   **Middleware**: Located in `app/Http/Middleware/`, middleware provides a mechanism for inspecting and filtering HTTP requests entering your application. For example, Laravel uses middleware to verify a user is authenticated before they can access certain routes.

-   **Service Container & Dependency Injection**: This is a powerful tool for managing class dependencies. Instead of creating classes manually inside another class, you can "type-hint" them in a controller's method or constructor, and Laravel's service container will automatically create and "inject" them for you. This makes your code more flexible and easier to test.

-   **Artisan CLI**: The `artisan` file in the root directory is the command-line interface for Laravel. It provides dozens of commands to help you build your application, such as creating new controllers (`make:controller`), running database migrations (`migrate`), and running tests (`test`).

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
| `.`                   | A reference to the current directory itself. A universal concept in most operating systems.                                                                         |
| `..`                  | A reference to the parent directory. A universal concept in most operating systems.                                                                                 |
| `.editorconfig`       | Ensures code consistency for teams. It tells code editors (like VS Code) how to format files (e.g., use tabs vs. spaces, indentation size) to keep everyone's style the same. |
| `.env`                | **Ignored by Git.** Stores your local, machine-specific "environment variables". This includes sensitive data like database passwords and API keys. It allows each developer to have different local settings without changing the main codebase. |
| `.env.example`        | A blueprint for the `.env` file. When you or another developer joins the project, you copy this to `.env` and fill in the specific values. It serves as a list of all the variables the application needs to run. |
| `.git`                | The hidden directory where the Git version control system stores all of its internal tracking data, history, and configuration for your project. You almost never touch this directly. |
| `.gitattributes`      | A Git configuration file that defines attributes per file path. It's often used to enforce consistent line endings across different operating systems (Windows vs. Mac/Linux), preventing common version control issues. |
| `.gitignore`          | A crucial file that tells Git which files and directories to intentionally ignore. This is used to keep the repository clean and prevent committing large vendor folders, log files, or sensitive `.env` files. |
| **Framework & Code**  |                                                                                                                                                                     |
| `README.md`           | The "front door" of the project. It provides a high-level summary and directs visitors to the more detailed documentation. It's often the first file a new person reads. |
| `app/`                | The heart of your application. Contains all your core PHP code, organized into subdirectories like `Http` (Controllers, Requests), `Models`, `Policies`, and `Services`. This is where most of your development work happens. |
| `artisan`             | The command-line interface included with Laravel. It provides a huge number of helpful commands (e.g., `php artisan make:controller`) that automate common tasks and speed up development significantly. |
| `bootstrap/`          | Contains files that "bootstrap" or start up the framework on every request. It also contains a `cache` directory where Laravel stores optimized files for better performance. |
| `composer.json`       | Your project's manifest for PHP dependencies. It lists all the third-party packages your project needs to function. Think of it like a shopping list. |
| `composer.lock`       | Records the exact versions of dependencies that were actually installed from `composer.json`. This ensures every developer uses the identical versions of packages, preventing "it works on my machine" issues. You don't edit this file manually. |
| `config/`             | Contains all of your application's configuration files (e.g., `database.php`, `auth.php`). These files allow you to easily change settings that are accessed throughout the application using the `config()` helper function. |
| `database/`           | Holds everything related to your database structure and data. It's organized into `migrations` (for schema versions), `factories` (for creating test data), and `seeders` (for populating the database with initial data). |
| `docker-compose.yml`  | The recipe for **Laravel Sail**, your Docker-based local development environment. This single file defines all the services your app needs (PHP, MySQL, Redis) and how they connect. Its main benefit is creating a consistent, portable environment that works the same for every developer, eliminating the need to install PHP or MySQL directly on your machine. |
| `docs/`               | A conventional place for project documentation. It's where this guide and your other planning documents live, keeping them separate from the application's source code but still part of the project. |
| `phpunit.xml`         | The configuration file for PHPUnit, the testing framework used by Laravel. It defines your test suites and allows you to set up environment variables specifically for when your tests are running. |
| `public/`             | The web server's document root and the only publicly accessible directory. It contains the `index.php` file, which is the single entry point for all HTTP requests into your application, ensuring a secure and consistent request flow. |
| `resources/`          | Contains your un-compiled assets (like JavaScript and CSS), which will be processed by a build tool like Vite. It also holds language files for translations and view files (if you were building a traditional web app). |
| `routes/`             | Contains all of the route definitions for your application. `api.php` is for stateless, token-based API routes, while `web.php` would be for stateful, browser-based routes that use sessions and cookies. |
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