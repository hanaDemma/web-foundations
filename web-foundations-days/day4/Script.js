const noteText = document.getElementById("note-text");
const charCount = document.getElementById("char-count");
const wordCount = document.getElementById("word-count");
const clearBtn = document.getElementById("clear-btn");
const themeToggle = document.getElementById("theme-toggle");

const DRAFT_KEY = "day4-note-draft";
const THEME_KEY = "day4-theme";


// Update character and word counts
function updateCounts() {
  const text = noteText.value;
  const characterTotal = text.length;

  const words = text.trim() === ""
    ? 0
    : text.trim().split(/\s+/).length;

  charCount.textContent = `${characterTotal} / 200 characters`;
  wordCount.textContent = `${words} words`;

  // Remove previous warning classes
  charCount.classList.remove("warning", "over");

  // Add warning when over 180 characters
  if (characterTotal > 180 && characterTotal <= 200) {
    charCount.classList.add("warning");
  }

  // Add over class when over 200 characters
  if (characterTotal > 200) {
    charCount.classList.add("over");
  }
}


// Save draft and update counters whenever text changes
noteText.addEventListener("input", function () {
  updateCounts();
  localStorage.setItem(DRAFT_KEY, noteText.value);
});


// Clear the note
function clearNote() {
  noteText.value = "";
  updateCounts();
  localStorage.removeItem(DRAFT_KEY);
}


// Clear button
clearBtn.addEventListener("click", clearNote);


// Press Escape inside textarea to clear
noteText.addEventListener("keydown", function (event) {
  if (event.key === "Escape") {
    clearNote();
  }
});


// Update theme button label
function updateThemeButton() {
  if (document.body.classList.contains("dark")) {
    themeToggle.textContent = "Light mode";
  } else {
    themeToggle.textContent = "Dark mode";
  }
}


// Toggle dark mode
themeToggle.addEventListener("click", function () {
  document.body.classList.toggle("dark");

  const isDark = document.body.classList.contains("dark");

  localStorage.setItem(THEME_KEY, isDark ? "dark" : "light");

  updateThemeButton();
});


// Restore saved data when the page loads
const savedDraft = localStorage.getItem(DRAFT_KEY);

if (savedDraft !== null) {
  noteText.value = savedDraft;
}

const savedTheme = localStorage.getItem(THEME_KEY);

if (savedTheme === "dark") {
  document.body.classList.add("dark");
}

updateCounts();
updateThemeButton();