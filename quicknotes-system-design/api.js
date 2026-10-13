// QuickNotes API client (JSONPlaceholder). Note: JSONPlaceholder fakes writes,
// so POST/DELETE succeed but are not persisted; the UI state is updated locally.
const API_URL = "https://jsonplaceholder.typicode.com/posts";
const MAX_TITLE = 100;

const loadBtn = document.getElementById("load-btn");
const statusEl = document.getElementById("status");
const form = document.getElementById("note-form");
const titleInput = document.getElementById("title-input");
const bodyInput = document.getElementById("body-input");
const submitBtn = document.getElementById("submit-btn");
const list = document.getElementById("notes-list");

let notes = [];
let busy = false;

/* ---------- reusable request helper ---------- */
async function request(url, options = {}) {
  const response = await fetch(url, {
    headers: { "Content-Type": "application/json; charset=UTF-8" },
    ...options,
  });
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status} ${response.statusText}`);
  }
  const text = await response.text();
  return text ? JSON.parse(text) : null;
}

/* ---------- API functions ---------- */
const getNotes = () => request(`${API_URL}?_limit=10`);
const createNote = (note) => request(API_URL, { method: "POST", body: JSON.stringify(note) });
const removeNote = (id) => request(`${API_URL}/${id}`, { method: "DELETE" });

/* ---------- UI helpers ---------- */
function setStatus(message, type) {
  statusEl.textContent = message; // textContent only
  statusEl.className = type || "";
}

function setBusy(value) {
  busy = value;
  loadBtn.disabled = value;
  submitBtn.disabled = value;
  list.querySelectorAll("button").forEach((b) => (b.disabled = value));
}

function render() {
  list.replaceChildren();
  if (notes.length === 0) {
    setStatus("No notes yet. Add one or load notes.", "empty");
    return;
  }
  notes.forEach((note) => {
    const li = document.createElement("li");
    const text = document.createElement("div");

    const title = document.createElement("p");
    title.className = "note-title";
    title.textContent = note.title;

    const body = document.createElement("p");
    body.className = "note-body";
    body.textContent = note.body;

    text.append(title, body);

    const del = document.createElement("button");
    del.type = "button";
    del.className = "delete-btn";
    del.textContent = "Delete";
    del.disabled = busy;
    del.addEventListener("click", () => handleDelete(note.id));

    li.append(text, del);
    list.appendChild(li);
  });
}

function validate(title) {
  if (!title.trim()) return "Title is required.";
  if (title.length > MAX_TITLE) return `Title must be at most ${MAX_TITLE} characters.`;
  return null;
}

/* ---------- handlers ---------- */
async function handleLoad() {
  setBusy(true);
  setStatus("Loading notes...", "loading");
  try {
    notes = await getNotes();
    render();
    if (notes.length > 0) setStatus(`Loaded ${notes.length} notes.`, "success");
  } catch (err) {
    setStatus(err.message || "Could not load notes.", "error");
  } finally {
    setBusy(false);
  }
}

async function handleSubmit(event) {
  event.preventDefault();
  const title = titleInput.value;
  const problem = validate(title);
  if (problem) {
    setStatus(problem, "error");
    return;
  }
  setBusy(true);
  setStatus("Saving note...", "loading");
  try {
    const created = await createNote({ title: title.trim(), body: bodyInput.value, userId: 1 });
    // JSONPlaceholder always returns id 101, so make local ids unique
    notes.unshift({ ...created, id: `local-${Date.now()}` });
    form.reset();
    render();
    setStatus("Note created.", "success");
  } catch (err) {
    setStatus(err.message || "Could not create note.", "error");
  } finally {
    setBusy(false);
  }
}

async function handleDelete(id) {
  setBusy(true);
  setStatus("Deleting note...", "loading");
  try {
    // local-only notes were never really stored, but we still exercise DELETE
    await removeNote(String(id).startsWith("local-") ? 1 : id);
    notes = notes.filter((n) => n.id !== id);
    render();
    if (notes.length > 0) setStatus("Note deleted.", "success");
  } catch (err) {
    setStatus(err.message || "Could not delete note.", "error");
  } finally {
    setBusy(false);
  }
}

loadBtn.addEventListener("click", handleLoad);
form.addEventListener("submit", handleSubmit);
render();
