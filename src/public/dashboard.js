document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM fully loaded and parsed");
    fetchUserInfo();
    console.log("fetchUserInfo called");
    fetchApiKeys();
});

function fetchUserInfo() {
    console.log('Fetching user info...');
    fetch('/api/user-info', {
        credentials: 'include'
    })
    .then(response => {
        console.log('Response status:', response.status);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        console.log('User info received:', data);
        if (data.error) {
            throw new Error(data.error);
        }

        const creditBalanceElement = document.getElementById('creditBalance');
        if (creditBalanceElement) {
            if (data.credit_balance !== undefined) {
                creditBalanceElement.textContent = `Credit Balance: $${parseFloat(data.credit_balance).toFixed(2)}`;
            } else {
                creditBalanceElement.textContent = 'Credit Balance: Not available';
            }
        } else {
            console.error('creditBalance element not found');
        }

        createApiUsageChart(); // Call this function after fetching user info
    })
    .catch(error => {
        console.error('Error fetching user info:', error);
        const creditBalanceElement = document.getElementById('creditBalance');
        if (creditBalanceElement) {
            creditBalanceElement.textContent = 'Error loading credit balance';
        }
    });
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
