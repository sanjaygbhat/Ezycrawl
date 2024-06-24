let labels = []; // Initialize an empty array to store labels

function processUrl() {
    const url = document.getElementById('urlInput').value;
    const apiKey = prompt("Please enter your API key:");
    if (!url) {
        alert('Please enter a URL');
        return;
    }
    if (!apiKey) {
        alert('Please enter an API key');
        return;
    }

    fetch('/api/scrape', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ url, attributes: labels, apiKey })
    })
    .then(response => response.json())
    .then(data => {
        document.getElementById('apiResponse').textContent = JSON.stringify(data, null, 2);
    })
    .catch(error => {
        document.getElementById('apiResponse').textContent = 'Failed to process URL: ' + error.message;
    });
}

function handleWordInput(event) {
    if (event.key === 'Enter') {
        const wordInput = document.getElementById('wordInput');
        const wordsDisplay = document.getElementById('wordsDisplay');
        const word = wordInput.value.trim();

        if (word) {
            labels.push(word);
            const wordSpan = document.createElement('span');
            wordSpan.textContent = word;
            wordSpan.style.backgroundColor = getRandomColor();
            wordsDisplay.appendChild(wordSpan);
            wordInput.value = '';
        }

        event.preventDefault();
    }
}

function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

function displayError(message) {
    const errorDiv = document.getElementById('error');
    errorDiv.innerText = message;
    errorDiv.style.display = 'block';
}

function clearError() {
    const errorDiv = document.getElementById('error');
    errorDiv.innerText = '';
    errorDiv.style.display = 'none';
}

function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
}

function validatePassword(password) {
    return password.length >= 6;
}

function login() {
    clearError();
    const email = document.getElementById('authEmail').value;
    const password = document.getElementById('authPassword').value;

    if (!validateEmail(email)) {
        displayError('Invalid email format');
        return;
    }

    if (!validatePassword(password)) {
        displayError('Password must be at least 6 characters long');
        return;
    }

    fetch('/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            window.location.href = '/dashboard';
        } else {
            displayError('Login failed: ' + data.error);
        }
    })
    .catch((error) => {
        console.error('Error:', error);
        displayError('An unexpected error occurred');
    });
}

function signup() {
    clearError();
    const email = document.getElementById('authEmail').value;
    const password = document.getElementById('authPassword').value;

    if (!validateEmail(email)) {
        displayError('Invalid email format');
        return;
    }

    if (!validatePassword(password)) {
        displayError('Password must be at least 6 characters long');
        return;
    }

    fetch('/signup', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            window.location.href = '/dashboard';
        } else {
            displayError('Signup failed: ' + data.error);
        }
    })
    .catch((error) => {
        console.error('Error:', error);
        displayError('An unexpected error occurred');
    });
}
