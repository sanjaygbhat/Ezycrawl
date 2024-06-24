document.addEventListener('DOMContentLoaded', () => {
    fetchUserInfo();
    fetchApiKeys();
});

function fetchUserInfo() {
    fetch('/api/user-info')
        .then(response => response.json())
        .then(data => {
            document.getElementById('userEmail').textContent = data.email;
            document.getElementById('userLogo').textContent = data.email[0].toUpperCase();
        })
        .catch(error => console.error('Error fetching user info:', error));
}

function fetchApiKeys() {
    fetch('/api/api-keys')
        .then(response => response.json())
        .then(data => {
            const apiKeysDiv = document.getElementById('apiKeys');
            apiKeysDiv.innerHTML = '';
            data.forEach(key => {
                const keyElement = document.createElement('div');
                keyElement.textContent = key;
                apiKeysDiv.appendChild(keyElement);
            });
        })
        .catch(error => console.error('Error fetching API keys:', error));
}

function createApiKey() {
    fetch('/api/create-api-key', { method: 'POST' })
        .then(response => response.json())
        .then(data => {
            alert(`New API Key created: ${data.apiKey}`);
            fetchApiKeys();
        })
        .catch(error => console.error('Error creating API key:', error));
}