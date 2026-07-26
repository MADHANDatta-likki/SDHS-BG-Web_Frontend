# Authentication Feature

This directory owns authentication-related React Web code.

- `components/` contains authentication pages, forms, and route wrappers.
- `hooks/` contains authentication-specific React hooks.
- `services/` contains authentication service boundaries and future API integration.
- `types/` contains authentication request, response, user, and token contracts.

The existing Spring Boot API is the source of truth for authentication contracts. Authentication requests, token persistence, session state, authorization checks, redirects, and error handling belong inside this feature.

`AuthService` uses the existing `/api/v1/auth/login` endpoint. `AuthProvider` owns the current user and token state, while `ProtectedRoute` restricts authenticated routes. Refresh-token behavior is intentionally not implemented because the backend does not expose a refresh endpoint.
