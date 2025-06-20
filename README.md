# University Admissions System - Backend

This repository contains the backend RESTful API for a comprehensive University Admissions and Management System, built with Laravel 11 and PHP 8.4.

## Overview

This robust API serves as the central data and business logic layer for managing the entire student and academic lifecycle, from initial applications and document uploads to course enrollment and academic administration.

### Key Architectural Features
- **RESTful API**: A clean, versioned API for all backend operations.
- **Role-Based Access Control (RBAC)**: Granular permissions for different user roles (Admin, Student, Faculty).
- **Service-Oriented Architecture**: Complex business logic is encapsulated in dedicated Service classes.
- **Dockerized Environment**: A consistent and portable development environment managed by Laravel Sail.
- **Comprehensive Test Suite**: High test coverage with both Feature and Unit tests.

## Full Project Documentation

For a complete and detailed breakdown of the project's architecture, technology stack, file structure, API documentation, and setup instructions, please see the **[Developer's Guide](./docs/00-project-overview-and-guide.md)**.

## Quick Start (with Docker)

1.  Ensure you have Docker Desktop installed and running.
2.  Clone this repository: `git clone <repository-url>`
3.  Navigate into the project directory: `cd university-admissions`
4.  Copy the environment file: `cp .env.example .env`
5.  Start the Docker containers: `./vendor/bin/sail up -d`
6.  Run database migrations: `./vendor/bin/sail artisan migrate --seed`
7.  The application is now running at `http://localhost`.
