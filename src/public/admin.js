// public/admin.js
async function loginAdmin() {
    const email = document.getElementById('adminEmail').value;
    const password = document.getElementById('adminPassword').value;
    // Implement admin login logic here
    // If successful, call loadUsers()
}

async function loadUsers() {
    // Fetch users from the server and populate the table
    const response = await fetch('/api/users');
    const users = await response.json();
    const userList = document.getElementById('userList');
    userList.innerHTML = '';
    users.forEach(user => {
        userList.innerHTML += `
            <tr>
                <td>${user.id}</td>
                <td>${user.email}</td>
                <td id="credits-${user.id}">${user.credit_balance}</td>
                <td>
                    <input type="number" id="add-credits-${user.id}" min="0">
                    <button onclick="addCredits(${user.id})">✓</button>
                </td>
            </tr>
        `;
    });
}

async function addCredits(userId) {
    const creditsToAdd = document.getElementById(`add-credits-${userId}`).value;
    // Implement API call to add credits
    const response = await fetch(`/api/users/${userId}/add-credits`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ credits: creditsToAdd }),
    });
    const updatedUser = await response.json();
    // Update the displayed credit balance
    document.getElementById(`credits-${userId}`).textContent = updatedUser.credit_balance;
}

async function searchUsers() {
    const searchTerm = document.getElementById('searchInput').value;
    // Implement user search logic here
    // Update the table with search results
}

// Call loadUsers() after successful admin login
