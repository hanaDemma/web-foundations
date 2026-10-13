
# QuickNotes REST API Design

Base URL: `https://api.quicknotes.example/v1`. All bodies are JSON. Authenticated endpoints need `Authorization: Bearer <token>`.

## Endpoints

| # | Method | Path                         | Description                                                                | Success status |
| - | ------ | ---------------------------- | -------------------------------------------------------------------------- | -------------- |
| 1 | POST   | `/auth/login`              | Exchange email and password for an access token                            | 200 OK         |
| 2 | GET    | `/notes`                   | List the current user's notes (supports`?page=`, `?limit=`, `?tag=`) | 200 OK         |
| 3 | POST   | `/notes`                   | Create a note                                                              | 201 Created    |
| 4 | GET    | `/notes/{id}`              | Get one note                                                               | 200 OK         |
| 5 | PUT    | `/notes/{id}`              | Replace a note (title, body, tags)                                         | 200 OK         |
| 6 | DELETE | `/notes/{id}`              | Delete a note                                                              | 204 No Content |
| 7 | GET    | `/tags`                    | List the current user's tags                                               | 200 OK         |
| 8 | PUT    | `/notes/{id}/tags/{tagId}` | Attach a tag to a note (idempotent)                                        | 204 No Content |

Design choices: nouns in plural form, HTTP verbs carry the action, `201` with a `Location` header on creation, `204` for empty responses, pagination on every list endpoint.

## Create a note

`POST /notes`

Request:

```json
{
  "title": "Buy groceries",
  "body": "Teff flour, berbere, eggs",
  "tags": ["personal", "shopping"]
}
```

Response `201 Created` (`Location: /v1/notes/42`):

```json
{
  "id": 42,
  "title": "Buy groceries",
  "body": "Teff flour, berbere, eggs",
  "tags": ["personal", "shopping"],
  "user_id": 7,
  "created_at": "2026-10-13T08:30:00Z",
  "updated_at": "2026-10-13T08:30:00Z"
}
```

## List notes

`GET /notes?page=1&limit=2`

Response `200 OK`:

```json
{
  "data": [
    {
      "id": 42,
      "title": "Buy groceries",
      "body": "Teff flour, berbere, eggs",
      "tags": ["personal", "shopping"],
      "created_at": "2026-10-13T08:30:00Z"
    },
    {
      "id": 41,
      "title": "Meeting notes",
      "body": "Review sprint goals",
      "tags": ["work"],
      "created_at": "2026-10-12T14:05:00Z"
    }
  ],
  "page": 1,
  "limit": 2,
  "total": 57
}
```

## Error codes

| Status                    | Meaning                       | When it happens                                          |
| ------------------------- | ----------------------------- | -------------------------------------------------------- |
| 400 Bad Request           | Invalid input                 | Missing title, title over 100 characters, malformed JSON |
| 401 Unauthorized          | Not authenticated             | Missing, expired or invalid token                        |
| 403 Forbidden             | Authenticated but not allowed | Accessing another user's note                            |
| 404 Not Found             | Resource missing              | Note or tag id does not exist                            |
| 429 Too Many Requests     | Rate limit hit                | Too many requests per minute                             |
| 500 Internal Server Error | Server fault                  | Unhandled exception, database down                       |

Error body (same shape for every error):

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Title is required and must be at most 100 characters.",
    "status": 400,
    "details": [{ "field": "title", "issue": "required" }]
  }
}
```
