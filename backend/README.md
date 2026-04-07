# CitizenConnect Backend (Spring Boot)

This folder contains a Spring Boot backend for the CitizenConnect frontend.

## Stack

- Spring Boot 3
- Spring Web
- Spring Data JPA
- Spring Validation
- Spring Security (open routes for now)
- H2 in-memory database

## Run

```bash
cd backend
mvn spring-boot:run
```

Server starts on `http://localhost:8080`.

## Health Check

```bash
curl http://localhost:8080/api/health
```

## Main Endpoints

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/issues`
- `GET /api/issues/mine?email=...`
- `POST /api/issues`
- `PATCH /api/issues/{issueId}/status`
- `POST /api/issues/{issueId}/upvote`
- `POST /api/issues/{issueId}/responses`
- `GET /api/announcements`
- `POST /api/announcements`
- `GET /api/feedback`
- `POST /api/feedback`
- `GET /api/admin/users`
- `PATCH /api/admin/users/{userId}/status`

## Example Requests

### Register

```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "role": "citizen"
  }'
```

### Login

```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123",
    "role": "citizen"
  }'
```

### Create Issue

```bash
curl -X POST http://localhost:8080/api/issues \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Water leakage near bus stop",
    "description": "Pipe has been leaking for 3 days.",
    "category": "Water & Utilities",
    "location": "Sector 8 Main Bus Stop",
    "reporterEmail": "john@example.com"
  }'
```

## Notes

- Authentication is currently simple email/password checks without JWT.
- Passwords are plain text in this first scaffold.
- Move to PostgreSQL + JWT + BCrypt before production.