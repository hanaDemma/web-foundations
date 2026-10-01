# web-foundations-days

Assignments for **Web Foundations Days**. Each day has its own folder and builds on the previous one. The project is **QuickNotes**, a simple app for capturing ideas, reminders and to-dos.

## Project structure

```
web-foundations-days/
├── day1/
│   ├── index.html
│   └── about.html
└── day2/
    ├── index.html
    ├── about.html
    └── style.css
```

## Day 1: HTML structure

A two-page static website written in semantic HTML5 only (no CSS or JavaScript).

| File                | Description                                                                                         |
| ------------------- | --------------------------------------------------------------------------------------------------- |
| `day1/index.html` | Home page: the QuickNotes skeleton from the lab, with a navigation bar in the header                |
| `day1/about.html` | About page: introduction, how-to steps, features list, keyboard shortcuts table and a feedback form |

Both pages share the same `<header>` (title, tagline and `<nav>` with **Home** and **About** links) and `<footer>`.

`about.html` contains:

- An `<h2>` heading and a short introduction to QuickNotes
- **How to use QuickNotes**: an ordered list of steps
- **Features**: an unordered list
- **Keyboard shortcuts**: a table with `Shortcut` and `Action` columns
- **Send feedback**: a form with labelled, required name (`text`), email (`email`) and message (`textarea`) fields, plus a submit button

## Day 2: Styling with CSS

The Day 1 pages, copied into `day2/` and styled with one shared stylesheet.

| File                | Description                                                                                                            |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| `day2/index.html` | Home page, linked to`style.css`                                                                                      |
| `day2/about.html` | About page, linked to`style.css`, with `class="features"` on the features list and placeholders on the form fields |
| `day2/style.css`  | Shared stylesheet for both pages                                                                                       |

`style.css` includes:

- A `box-sizing: border-box` reset and base body styles
- A styled header
- Navigation links laid out in a centred row with **Flexbox** (16px gap, white text, no underline, hover effect)
- A centred `<main>` with a maximum width, and white card-style sections
- The features list as a responsive card grid with **CSS Grid** (`repeat(auto-fit, minmax(180px, 1fr))`)
- A bordered, padded shortcuts table
- Full-width feedback form fields stacked vertically
- Smooth hover **transitions** on buttons and navigation links
- A `@media (max-width: 600px)` rule that reduces header size and padding on small screens

## How to run

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd web-foundations-days
   ```
2. Open the folder in VS Code.
3. Right-click `index.html` in `day1/` or `day2/` and choose **Open with Live Server** (or open the file in a browser).
4. Use the **Home** and **About** links to move between the pages.
5. For Day 2, press `F12` and toggle the device toolbar (`Ctrl + Shift + M`) to check the layout at phone width.

## Validation

Pages are checked with the [W3C Markup Validator](https://validator.w3.org/) and should show no errors.

## Tech

- Day 1: HTML5
- Day 2: HTML5 and CSS3 (Flexbox, Grid, transitions, media queries)

## Author

Hana
