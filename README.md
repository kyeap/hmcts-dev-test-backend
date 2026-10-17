# HMCTS Dev Test Backend (Node)

Backend API for the [HMCTS DTS developer challenge](https://github.com/hmcts/dts-developer-challenge): a task-tracking
service that lets caseworkers create, view, update and delete tasks.

Built with **Express 5 + TypeScript** to match the tooling of
[hmcts-dev-test-frontend](https://github.com/hmcts/hmcts-dev-test-frontend). Data is stored in **SQLite** via
`better-sqlite3`, validation uses **Zod**, and the API is documented with **OpenAPI 3** and served through Swagger UI.

## Getting started

Requires Node 20+ (see `.nvmrc`).

```bash
npm install
npm run start:dev        # dev server with reload on http://localhost:4000
# or
npm run build && npm start
```

| Variable  | Default         | Description          |
| --------- | --------------- | -------------------- |
| `PORT`    | `4000`          | HTTP port            |
| `DB_PATH` | `data/tasks.db` | SQLite database file |

The database file and its schema are created on first start.

## API

Interactive docs: **http://localhost:4000/api-docs**. The raw spec is at `/openapi.json`, with its source in
[`src/main/openapi.yaml`](src/main/openapi.yaml).

| Method   | Path                 | Description                  | Success |
| -------- | -------------------- | ---------------------------- | ------- |
| `POST`   | `/tasks`             | Create a task                | 201     |
| `GET`    | `/tasks`             | List all tasks (by due date) | 200     |
| `GET`    | `/tasks/{id}`        | Get a task by ID             | 200     |
| `PATCH`  | `/tasks/{id}/status` | Update a task's status       | 200     |
| `DELETE` | `/tasks/{id}`        | Delete a task                | 204     |
| `GET`    | `/health`            | Health check                 | 200     |

### Task

```json
{
  "id": 1,
  "title": "Review case bundle",
  "description": "Check exhibits for case ABC12345",
  "status": "TODO",
  "dueDateTime": "2026-11-01T09:00:00.000Z",
  "createdAt": "2026-10-16T09:00:00.000Z",
  "updatedAt": "2026-10-16T09:00:00.000Z"
}
```

- `title`: required, 1–200 characters (trimmed)
- `description`: optional, up to 2000 characters
- `status`: one of `TODO`, `IN_PROGRESS` or `DONE`; defaults to `TODO`
- `dueDateTime`: required ISO 8601 date-time with a timezone (`Z` or `+01:00`); stored in UTC

Unknown fields are rejected.

### Example

```bash
curl -X POST localhost:4000/tasks -H 'Content-Type: application/json' \
  -d '{"title":"Review case bundle","dueDateTime":"2026-11-01T09:00:00Z"}'

curl -X PATCH localhost:4000/tasks/1/status -H 'Content-Type: application/json' -d '{"status":"DONE"}'
```

### Errors

Every error returns a consistent JSON body:

```json
{
  "status": 400,
  "error": "Bad Request",
  "message": "Validation failed",
  "details": [{ "field": "title", "message": "title is required" }]
}
```

| Status | When                                                       |
| ------ | ---------------------------------------------------------- |
| 400    | Validation failure, invalid ID or malformed JSON           |
| 404    | Task or route not found                                    |
| 500    | Unexpected error (logged server-side, no internals leaked) |

## Project structure

```
src/main
  app.ts                 Express app factory (repository injected, so tests can use an in-memory DB)
  server.ts              Entry point: opens the DB, starts the server, shuts down gracefully
  openapi.yaml           API documentation
  models/task.ts         Task types and Zod validation schemas
  repositories/          TaskRepository interface + SQLite implementation
  services/TaskService   Business logic: validation and not-found handling
  routes/                HTTP layer (thin controllers)
  middleware/            Error and 404 handlers
src/test
  unit/                  Service tests (mocked repository) and repository tests (in-memory SQLite)
  routes/                Full HTTP tests with supertest
```

## Scripts

| Script                  | Purpose                       |
| ----------------------- | ----------------------------- |
| `npm test`              | Run all tests                 |
| `npm run test:unit`     | Unit tests only               |
| `npm run test:routes`   | HTTP route tests only         |
| `npm run test:coverage` | Tests with coverage report    |
| `npm run lint`          | ESLint + Prettier check       |
| `npm run build`         | Compile TypeScript to `dist/` |

CI (GitHub Actions) runs lint, build and tests with coverage on every push and PR to `main`.

## Design notes

- **SQLite** keeps setup to `npm install`, with no database server needed. Data access sits behind the
  `TaskRepository` interface, so swapping in Postgres means adding one class, not changing the service or routes.
- **Status update** is a dedicated `PATCH /tasks/{id}/status` endpoint, as the brief only asks for status changes.
- Possible next steps: pagination and filtering on `GET /tasks`, Postgres with migrations, auth, structured logging.
