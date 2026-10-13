
# QuickNotes Data Model

## Entities

### users

| Column        | Type         | Key / constraint        |
| ------------- | ------------ | ----------------------- |
| id            | BIGSERIAL    | PRIMARY KEY             |
| email         | VARCHAR(255) | UNIQUE, NOT NULL        |
| password_hash | VARCHAR(255) | NOT NULL                |
| display_name  | VARCHAR(100) | NOT NULL                |
| created_at    | TIMESTAMPTZ  | NOT NULL, default now() |

### notes

| Column     | Type         | Key / constraint                   |
| ---------- | ------------ | ---------------------------------- |
| id         | BIGSERIAL    | PRIMARY KEY                        |
| user_id    | BIGINT       | FOREIGN KEY -> users(id), NOT NULL |
| title      | VARCHAR(100) | NOT NULL                           |
| body       | TEXT         | NOT NULL, default ''               |
| created_at | TIMESTAMPTZ  | NOT NULL, default now()            |
| updated_at | TIMESTAMPTZ  | NOT NULL, default now()            |

### tags

| Column  | Type        | Key / constraint                   |
| ------- | ----------- | ---------------------------------- |
| id      | BIGSERIAL   | PRIMARY KEY                        |
| user_id | BIGINT      | FOREIGN KEY -> users(id), NOT NULL |
| name    | VARCHAR(50) | NOT NULL, UNIQUE per user          |

### note_tags (join table)

| Column  | Type   | Key / constraint                                               |
| ------- | ------ | -------------------------------------------------------------- |
| note_id | BIGINT | PRIMARY KEY (part), FOREIGN KEY -> notes(id) ON DELETE CASCADE |
| tag_id  | BIGINT | PRIMARY KEY (part), FOREIGN KEY -> tags(id) ON DELETE CASCADE  |

## Relationships

- **One-to-many:** one user has many notes (`notes.user_id`), and one user has many tags (`tags.user_id`). Each note and tag belongs to exactly one user.
- **Many-to-many:** a note can have many tags and a tag can label many notes. A relational database cannot store this directly, so the join table `note_tags` holds one row per (note, tag) pair, with a composite primary key that prevents duplicates.

## CREATE TABLE statements (PostgreSQL)

```sql
CREATE TABLE users (
  id            BIGSERIAL PRIMARY KEY,
  email         VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  display_name  VARCHAR(100) NOT NULL,
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE TABLE notes (
  id         BIGSERIAL PRIMARY KEY,
  user_id    BIGINT       NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title      VARCHAR(100) NOT NULL,
  body       TEXT         NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ  NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE TABLE tags (
  id      BIGSERIAL PRIMARY KEY,
  user_id BIGINT      NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name    VARCHAR(50) NOT NULL,
  UNIQUE (user_id, name)
);

CREATE TABLE note_tags (
  note_id BIGINT NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
  tag_id  BIGINT NOT NULL REFERENCES tags(id)  ON DELETE CASCADE,
  PRIMARY KEY (note_id, tag_id)
);

CREATE INDEX idx_notes_user_created ON notes (user_id, created_at DESC);
CREATE INDEX idx_note_tags_tag ON note_tags (tag_id);
```

## Example queries

```sql
-- 1. Latest 10 notes of a user (uses idx_notes_user_created)
SELECT id, title, created_at
FROM notes
WHERE user_id = 7
ORDER BY created_at DESC
LIMIT 10;

-- 2. JOIN: all notes with a given tag name
SELECT n.id, n.title, t.name AS tag
FROM notes n
JOIN note_tags nt ON nt.note_id = n.id
JOIN tags t       ON t.id = nt.tag_id
WHERE n.user_id = 7 AND t.name = 'work';

-- 3. Number of notes per tag for a user
SELECT t.name, COUNT(nt.note_id) AS note_count
FROM tags t
LEFT JOIN note_tags nt ON nt.tag_id = t.id
WHERE t.user_id = 7
GROUP BY t.name
ORDER BY note_count DESC;

-- 4. Update a note
UPDATE notes SET title = 'Buy groceries today', updated_at = now()
WHERE id = 42 AND user_id = 7;
```

## Index and reason

`idx_notes_user_created ON notes (user_id, created_at DESC)` supports the most frequent query, "show my newest notes". Without it the database scans the whole notes table (hundreds of millions of rows at scale). With it the database jumps to the user's rows, already sorted, and stops after the page limit. The secondary index on `note_tags(tag_id)` speeds up "notes by tag" lookups, since the composite primary key only helps lookups starting with `note_id`.

## SQL or NoSQL?

I chose **SQL (PostgreSQL)**. The data is clearly relational (users, notes, tags, many-to-many links) and benefits from foreign keys, unique constraints and transactions, for example creating a note and its tags atomically. At the estimated scale (about 15 writes per second at peak and a few hundred GB per year) a single primary with read replicas is enough, so we do not need NoSQL's horizontal write scaling. If the volume grows far beyond that, notes can be sharded by `user_id`, since almost every query is scoped to one user.
