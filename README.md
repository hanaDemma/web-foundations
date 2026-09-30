# web-foundations-days


# QuickNotes: Day 1

Day 1 assignment for **Web Foundations Days**. This folder contains a two-page static website for QuickNotes, a simple app for capturing ideas, reminders and to-dos.

## Files

| File           | Description                                                                                         |
| -------------- | --------------------------------------------------------------------------------------------------- |
| `index.html` | Home page: the QuickNotes skeleton from the Day 1 lab, with a navigation bar in the header          |
| `about.html` | About page: introduction, how-to steps, features list, keyboard shortcuts table and a feedback form |

## What's inside

Both pages share the same `<header>` (title, tagline and `<nav>` with **Home** and **About** links) and `<footer>`.

`about.html` contains:

- An `<h2>` heading and a short introduction to QuickNotes
- **How to use QuickNotes**: an ordered list of steps
- **Features**: an unordered list
- **Keyboard shortcuts**: a table with `Shortcut` and `Action` columns
- **Send feedback**: a form with labelled, required name (`text`), email (`email`) and message (`textarea`) fields, plus a submit button

## How to run

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd web-foundations-days/day1
   ```
2. Open the folder in VS Code.
3. Right-click `index.html` and choose **Open with Live Server** (or simply open the file in a browser).
4. Use the **Home** and **About** links to move between the pages.

## Validation

Both pages were checked with the [W3C Markup Validator](https://validator.w3.org/) and pass with no errors.

## Tech

- HTML5 only (no CSS or JavaScript yet)

## Author

<!-- Add your name here -->
