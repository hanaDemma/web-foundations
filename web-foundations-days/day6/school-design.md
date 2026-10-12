# School Database Design

## 1. Overview

The school database stores information about students, courses, and student enrolments. It uses a relational database to organize data and maintain relationships between tables.

## 2. Tables

### Students

The `students` table stores student information.

- `student_id`: Primary key that uniquely identifies each student.
- `name`: Student's full name, which is required.
- `email`: Student's email address, which is required and must be unique.

### Courses

The `courses` table stores information about courses offered by the school.

- `course_id`: Primary key that uniquely identifies each course.
- `course_name`: Name of the course, which is required and unique.
- `instructor`: Name of the instructor, which is required.



### Enrolments

The `enrolments` table records which students are enrolled in which courses and stores their grades.

- `enrolment_id`: Primary key that uniquely identifies each enrolment.
- `student_id`: Foreign key referencing `students(student_id)`, with `ON DELETE CASCADE`. When a student is deleted, all their enrolment records are automatically deleted.
- `course_id`: Foreign key referencing `courses(course_id)`, with `ON DELETE CASCADE`. When a course is deleted, all enrolment records associated with that course are automatically deleted.
- `grade`: Stores the student's grade for the course.

The combination of `student_id` and `course_id` must be unique to prevent the same student from enrolling in the same course twice.

**Referential integrity:** The `ON DELETE CASCADE` clauses prevent orphaned enrolment records when a student or course is removed. SQLite foreign-key enforcement must be enabled using `PRAGMA foreign_keys = ON;`.



## 3. Relationships

### One-to-many relationship

A student can have many enrolments, but each enrolment belongs to one student. Similarly, a course can have many enrolments, but each enrolment belongs to one course.

These relationships are implemented using foreign keys in the enrolments table.

### Many-to-many relationship

Students and courses have a many-to-many relationship because one student can take several courses, and one course can have several students.

The `enrolments` table acts as a join table connecting students and courses. It is necessary to represent this relationship and store additional information, such as each student's grade.

## 4. Index

I would add an index on `enrolments.course_id` to improve queries that retrieve students enrolled in a particular course and queries that group enrolments by course.

An index can make data retrieval faster, although it requires additional storage and can add overhead to insertions and updates. The unique constraint on `(student_id, course_id)` also creates an index in SQLite.

## 5. SQL or NoSQL?

I would choose SQL for this school system because students, courses, and enrolments have clear relationships. A relational database supports primary keys, foreign keys, unique constraints, and structured queries using JOIN and GROUP BY. These features help maintain accurate enrolment records and prevent duplicate enrolments. SQL is also suitable for generating reports, such as counting students per course and tracking grades. A NoSQL database could be useful for flexible or unstructured data, but a relational database such as SQLite is a better fit for this assignment and its requirements.
