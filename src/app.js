const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');
const app = express();
const PORT = 3000;

// Middleware to parse request bodies and manage sessions
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
    secret: 'your_secret_key',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // for HTTP; set true for HTTPS
}));

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Route to serve the signup page
app.get('/signup', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'signup.html'));
});

// Route to serve the login page
app.get('/login', (req, res) => {
    console.log("Hellooooo");
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// POST routes for handling form submissions
app.post('/signup', (req, res) => {
    // Handle signup logic here
    res.send('Signup successful!');
});

app.post('/login', (req, res) => {
    // Handle login logic here
    res.send('Login successful!');
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
