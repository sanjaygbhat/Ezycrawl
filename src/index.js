const express = require('express');
const bodyParser = require('body-parser'); // Import body-parser
const path = require('path');
const app = express();
const port = 3000;

// Use body-parser middleware
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

// Import routes from routes.js
const routes = require('./routes');

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Use routes from routes.js
app.use('/api', routes);

// Catch-all for any other requests not handled above
app.use((req, res) => {
    console.error(`Unhandled request to ${req.path}`);
    res.status(404).send('404 Not Found');
});

// Start the server with error handling
app.listen(port, '0.0.0.0', (err) => {
    if (err) {
        console.error('Failed to start server:', err);
        return;
    }
    console.log(`Server running on http://localhost:${port}`);
});
