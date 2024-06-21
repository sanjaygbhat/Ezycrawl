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

function handleWordInput(event) {
    if (event.key === 'Enter') {
        const wordInput = document.getElementById('wordInput');
        const wordsDisplay = document.getElementById('wordsDisplay');
        const word = wordInput.value.trim();

        if (word) {
            // Create a span element for the word
            const wordSpan = document.createElement('span');
            wordSpan.textContent = word;
            wordSpan.style.padding = '5px 10px';
            wordSpan.style.margin = '5px';
            wordSpan.style.borderRadius = '5px';
            wordSpan.style.color = '#fff'; // White text color
            wordSpan.style.backgroundColor = getRandomColor(); // Random background color

            // Append the word span to the display area
            wordsDisplay.appendChild(wordSpan);

            // Clear the input for the next word
            wordInput.value = '';
        }

        // Prevent default action of the enter key
        event.preventDefault();
    }
}

// Function to generate a random color
function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}
