
const loadButton = document.getElementById("load-users");
const filterInput = document.getElementById("filter-input");
const statusMessage = document.getElementById("status");
const usersList = document.getElementById("users-list");

const API_URL = "https://jsonplaceholder.typicode.com/users";

let users = [];

// Display any list of users on the page.
function renderUsers(list) {
    usersList.replaceChildren();

    if (list.length === 0) {
        statusMessage.textContent = "No users match your filter.";
        return;
    }

    list.forEach((user) => {
        const listItem = document.createElement("li");
        const name = document.createElement("h2");
        const email = document.createElement("p");
        const city = document.createElement("p");
        const company = document.createElement("p");

        name.textContent = user.name;
        email.textContent = `Email: ${user.email}`;
        city.textContent = `City: ${user.address.city}`;
        company.textContent = `Company: ${user.company.name}`;

        listItem.append(name, email, city, company);
        usersList.appendChild(listItem);
    });

    statusMessage.textContent = `Showing ${list.length} user(s).`;
}

// Fetch users from the API.
async function loadUsers() {
    loadButton.disabled = true;
    statusMessage.textContent = "Loading users...";
    usersList.replaceChildren();

    try {
        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error(`HTTP error: ${response.status}`);
        }

        users = await response.json();

        // Apply the current filter after loading.
        filterUsers();

        if (users.length > 0) {
            statusMessage.textContent =
                `Successfully loaded ${users.length} users.`;
        }
    } catch (error) {
        users = [];
        usersList.replaceChildren();
        statusMessage.textContent =
            "Failed to load users. Please try again.";
        console.error("Error loading users:", error);
    } finally {
        loadButton.disabled = false;
    }
}

// Filter the stored users without making another request.
function filterUsers() {
    const searchText = filterInput.value.trim().toLowerCase();

    const filteredUsers = users.filter((user) =>
        user.name.toLowerCase().includes(searchText)
    );

    renderUsers(filteredUsers);
}

// Event listeners.
loadButton.addEventListener("click", loadUsers);
filterInput.addEventListener("input", filterUsers);
