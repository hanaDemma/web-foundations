
# Library Books REST API Design

## Overview

This API manages books in a library using RESTful principles. The resource is `books`, and the API uses standard HTTP methods to create, retrieve, update, and delete books.

**Base URL:** `https://api.example.com`

### 1. List all books

- **Method:** `GET`
- **Path:** `/books`
- **Description:** Retrieves a list of all books.
- **Example request body:** None.
- **Success status:** `200 OK`

### 2. Get one book

- **Method:** `GET`
- **Path:** `/books/{id}`
- **Description:** Retrieves a specific book using its ID.
- **Example request body:** None.
- **Success status:** `200 OK`

Example: `GET /books/42`

### 3. Create a book

- **Method:** `POST`
- **Path:** `/books`
- **Description:** Creates a new book in the library.
- **Example request body:**

```json
{
  "title": "Introduction to Artificial Intelligence",
  "author": "Hana Demma",
  "publishedYear": 2026
}
```

- **Success status:** `201 Created`

### 4. Update a book

- **Method:** `PUT`
- **Path:** `/books/{id}`
- **Description:** Replaces the details of an existing book.
- **Example request body:**

```json
{
  "title": "Advanced Artificial Intelligence",
  "author": "Hana Demma",
  "publishedYear": 2026
}
```

- **Success status:** `200 OK`

### 5. Delete a book

- **Method:** `DELETE`
- **Path:** `/books/{id}`
- **Description:** Deletes a book with the specified ID.
- **Example request body:** None.
- **Success status:** `204 No Content`

Example: `DELETE /books/42`

### 6. List books by author

- **Method:** `GET`
- **Path:** `/books?author={authorName}`
- **Description:** Retrieves books written by the specified author.
- **Example request body:** None.
- **Success status:** `200 OK`

Example: `GET /books?author=Hana%20Demma`

## Error Responses

### 400 Bad Request

- **Description:** The request contains invalid data or parameters.
- **Example:** Creating a book without a required title or sending an invalid publication year.

### 404 Not Found

- **Description:** The requested resource does not exist.
- **Example:** Requesting `GET /books/9999` when book ID `9999` is not present.

## REST API Design Principles

- Use nouns such as `/books` to identify resources.
- Use HTTP methods to describe actions.
- Use resource IDs to identify individual books.
- Use query parameters to filter collections.
- Return appropriate HTTP status codes.
- Use JSON for request bodies when creating or updating books.
