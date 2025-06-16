# University Admissions API Documentation

This documentation provides comprehensive information about the University Admissions System API endpoints.

## Authentication

All API endpoints (except token creation) require authentication using Bearer tokens. Obtain your token by making a POST request to `/api/v1/tokens/create` with your credentials.

## Missing Documentation

**Note:** The following endpoints are functional but excluded from this auto-generated documentation due to technical limitations:

- `PUT /api/v1/terms/{term}` - Update term information
- `PUT /api/v1/buildings/{building}` - Update building information  
- `PUT /api/v1/rooms/{room}` - Update room information

These endpoints follow the same patterns as other update endpoints in their respective resource groups.

## Getting Started

Use the "Try it out" feature in each endpoint section to test the API directly from this documentation.

# Introduction



<aside>
    <strong>Base URL</strong>: <code>http://localhost</code>
</aside>

    This documentation aims to provide all the information you need to work with our API.

    <aside>As you scroll, you'll see code examples for working with the API in different programming languages in the dark area to the right (or as part of the content on mobile).
    You can switch the language used with the tabs at the top right (or from the nav menu at the top left on mobile).</aside>

