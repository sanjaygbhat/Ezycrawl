function processUrl() {
    const url = document.getElementById('urlInput').value;
    if (!url) {
        console.log('No URL entered'); // Log when no URL is entered
        alert('Please enter a URL');
        return;
    }

    console.log('Sending request to server with URL:', url); // Log the URL being sent

    // Sending a POST request to the '/api/process' endpoint
    fetch('/api/process', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ url })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.text();  // Handling the response as plain text
    })
    .then(text => {
        console.log('Received response:', text); // Log the response received
        document.getElementById('apiResponse').textContent = text;
    })
    .catch(error => {
        console.error('Error:', error);
        document.getElementById('apiResponse').textContent = 'Failed to process URL';
    });
}