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
| `README.md`           | The "front door" of your project. It should give a high-level overview of the project and instructions on how to set it up.                                          |
| `app/`                | The heart of your application. Contains all your core PHP code: Models, Controllers, Services, Policies, etc.                                                       |
| `artisan`             | The command-line interface included with Laravel. It provides a huge number of helpful commands for developing your application.                                    |
| `bootstrap/`          | Contains the `app.php` file which "boots up" the framework. Also holds a cache folder for framework performance optimization.                                       |
| `composer.json`       | The manifest for your PHP dependencies. It lists all the external packages your project requires.                                                                   |
| `composer.lock`       | Records the exact versions of dependencies that were installed. This ensures that every developer on the team uses the same package versions.                         |
| `config/`             | Contains all of your application's configuration files. A great place to store settings for your services.                                                         |
| `database/`           | Holds your database migrations, model factories, and seeders. This is where you define and manage your application's data structure.                               |
| `docker-compose.yml`  | The configuration file for Docker. It defines the services (MySQL, Redis, etc.) that make up your Laravel Sail development environment.                               |
| `docs/`               | The directory where all project documentation, including this guide and your task plans, is stored.                                                                 |
| `phpunit.xml`         | The configuration file for PHPUnit, the testing framework used by Laravel. It defines your test suites and testing environment.                                       |
| `public/`             | The web server's document root. It contains the `index.php` file, which is the single entry point for all HTTP requests to your application.                         |
| `resources/`          | Contains your un-compiled assets like CSS or JavaScript files, language files, and any "views" (if you weren't building a pure API).                                |
| `routes/`             | Contains all of the route definitions for your application (`api.php`, `web.php`). These map URLs to your controllers.                                              |
| `storage/`            | Holds compiled Blade templates (not used in this project), file-based sessions, caches, logs, and any other files generated by the framework.                        |
| `tests/`              | Contains your automated tests. Laravel provides a structure for both "Feature" tests (testing endpoints) and "Unit" tests (testing small pieces of code).          |
| `vendor/`             | **Ignored by Git.** The directory where Composer installs all of your third-party PHP dependencies.                                                                   |

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