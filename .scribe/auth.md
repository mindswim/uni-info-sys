# Authenticating requests

To authenticate requests, include a **`Authorization`** header with the value **`"Bearer {YOUR_AUTH_KEY}"`**.

All authenticated endpoints are marked with a `requires authentication` badge in the documentation below.

You can retrieve your token by making a POST request to `/api/v1/tokens/create`.
