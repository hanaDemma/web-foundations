// ---------- Elements ----------
const noteForm = document.querySelector("#note-form");
const noteInput = document.querySelector("#note-input");
const noteCategory = document.querySelector("#note-category");
const searchInput = document.querySelector("#search-input");
const notesList = document.querySelector("#notes-list");
const noteCount = document.querySelector("#note-count");
const errorMessage = document.querySelector("#error-message");
const clearAllBtn = document.querySelector("#clear-all-btn");

const STORAGE_KEY = "quicknotes-app-notes";

// ---------- Notes data ----------
let notes = loadNotes();


// ---------- Local storage ----------
function saveNotes() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
}

function loadNotes() {
  const savedNotes = localStorage.getItem(STORAGE_KEY);

  if (savedNotes === null) {
    return [];
  }

  try {
    return JSON.parse(savedNotes);
  } catch (error) {
    console.error("Could not load saved notes.", error);
    return [];
  }
}


// ---------- Count ----------
function updateCount() {
  if (notes.length === 0) {
    noteCount.textContent = "You have no notes yet.";
  } else if (notes.length === 1) {
    noteCount.textContent = "You have 1 note.";
  } else {
    noteCount.textContent = `You have ${notes.length} notes.`;
  }
}


// ---------- Render ----------
function render() {
  notesList.replaceChildren();

  const searchTerm = searchInput.value.trim().toLowerCase();

  const filteredNotes = notes.filter(note =>
    note.text.toLowerCase().includes(searchTerm)
  );

  if (filteredNotes.length === 0) {
    if (searchTerm !== "") {
      const emptyMessage = document.createElement("li");
      emptyMessage.textContent = "No notes match your search.";
      notesList.appendChild(emptyMessage);
    }

    updateCount();
    return;
  }

  filteredNotes.forEach(note => {
    const listItem = document.createElement("li");
    listItem.classList.add(
      "note-card",
      `category-${note.category}`
    );

    const categoryLabel = document.createElement("span");
    categoryLabel.classList.add("note-category");
    categoryLabel.textContent = note.category;

    const noteText = document.createElement("p");
    noteText.classList.add("note-text");
    noteText.textContent = note.text;

    const noteDate = document.createElement("p");
    noteDate.classList.add("note-date");
    noteDate.textContent = note.createdAt;

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.classList.add("delete-btn");
    deleteButton.textContent = "Delete";

    deleteButton.addEventListener("click", () => {
      deleteNote(note.id);
    });

    listItem.appendChild(categoryLabel);
    listItem.appendChild(noteText);
    listItem.appendChild(noteDate);
    listItem.appendChild(deleteButton);

    notesList.appendChild(listItem);
  });

  updateCount();
}


// ---------- Add note ----------
noteForm.addEventListener("submit", event => {
  event.preventDefault();

  const text = noteInput.value.trim();
  const category = noteCategory.value;

  errorMessage.textContent = "";

  if (text === "") {
    errorMessage.textContent = "Please type a note first.";
    return;
  }

  if (text.length > 200) {
    errorMessage.textContent =
      "Notes must be 200 characters or fewer.";
    return;
  }

  const newNote = {
    id: Date.now() + Math.random(),
    text: text,
    category: category,
    createdAt: new Date().toLocaleString()
  };

  notes.push(newNote);

  saveNotes();
  render();

  noteInput.value = "";
  errorMessage.textContent = "";
  noteInput.focus();
});


// ---------- Delete note ----------
function deleteNote(id) {
  notes = notes.filter(note => note.id !== id);

  saveNotes();
  render();
}


// ---------- Search ----------
searchInput.addEventListener("input", () => {
  render();
});


// ---------- Clear all ----------
clearAllBtn.addEventListener("click", () => {
  if (notes.length === 0) {
    return;
  }

  const confirmed = confirm("Delete all notes?");

  if (confirmed) {
    notes = [];
    saveNotes();
    render();
  }
});


// ---------- Initial render ----------
render();