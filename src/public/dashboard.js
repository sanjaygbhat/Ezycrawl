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
            createApiUsageChart(); // Call this function after fetching user info
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

function createApiUsageChart() {
    const ctx = document.getElementById('apiUsageChart').getContext('2d');
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            datasets: [{
                label: 'API Calls',
                data: [12, 19, 3, 5, 2, 3],
                borderColor: '#3498db',
                tension: 0.1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

// Call this function after fetching user info
createApiUsageChart();
