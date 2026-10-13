
# QuickNotes System Design

A small notes app used to practise two skills: **consuming a REST API from the browser** (HTML, CSS, JavaScript with `fetch`) and **designing a backend system on paper** (REST API, SQL data model, scalable architecture).

## Description

The API client talks to [JSONPlaceholder](https://jsonplaceholder.typicode.com/posts). It loads 10 notes (GET), creates a note (POST) and deletes a note (DELETE), showing loading, success, error and empty states, validating input, and disabling buttons while requests run. JSONPlaceholder fakes writes (nothing is stored on the server), so the UI updates its local list after POST and DELETE.

The `docs/` folder describes how a real QuickNotes backend would be designed for 1 million users.

## How to run the API client

1. Clone the repository: `git clone https://github.com/<your-username>/quicknotes-system-design.git`
2. Open `index.html` in a browser (double-click it, or serve the folder with `python -m http.server 8000` and visit `http://localhost:8000`).
3. Click **Load notes** to fetch 10 notes, add a note with the form, or press **Delete** on any note.

An internet connection is required. To test the error state, go offline and click **Load notes**.

## Documents

- [API design](docs/api-design.md): REST endpoints, JSON examples, error codes
- [Data model](docs/data-model.md): tables, relationships, SQL, index, SQL vs NoSQL
- [Architecture](docs/architecture.md): requirements, load estimate, diagram, request flows, trade-offs

## What I learned

- A single reusable `request()` function that checks `response.ok` keeps error handling consistent, because `fetch` only rejects on network failures, not on HTTP errors like 404 or 500.
- Every request needs four visible states (loading, success, error, empty) and disabled buttons while it runs; otherwise users double-submit and cannot tell what happened.
- Inserting user text with `textContent` instead of `innerHTML` prevents XSS.
- Many-to-many relationships (notes and tags) need a join table with a composite primary key, and indexes should match the most common query, such as `(user_id, created_at DESC)`.
- Back-of-the-envelope estimates (about 140 reads/s at peak for 1M users) show what is really needed: a cache and a read replica, not a huge cluster.
- Every component in an architecture should answer "what problem does this solve?", and every trade-off (cache staleness, replica lag) should be stated explicitly.
