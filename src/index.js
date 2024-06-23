const express = require('express');
const bodyParser = require('body-parser'); // Import body-parser
const path = require('path');
const bcrypt = require('bcrypt');
const session = require('express-session');
const db = require('./dbConfig');
const app = express();
const port = 3000;

// Use body-parser middleware
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Use session middleware
app.use(session({
    secret: 'your_secret_key',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // for HTTP; set true for HTTPS
}));

// Import routes from routes.js
const routes = require('../routes/routes');

// Use routes from routes.js
app.use('/api', routes);

// Signup route
app.post('/signup', async (req, res) => {
    const { email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    try {
        const result = await db.one('INSERT INTO users(email, password) VALUES($1, $2) RETURNING id', [email, hashedPassword]);
        res.send('User created with ID: ' + result.id);
    } catch (error) {
        res.status(400).send('Error creating the user: ' + error.message);
    }
});

// Login route
app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await db.one('SELECT * FROM users WHERE email = $1', [email]);
        if (await bcrypt.compare(password, user.password)) {
            req.session.userId = user.id; // Set user session
            res.send('Logged in!');
        } else {
            res.status(401).send('Invalid credentials');
        }
    } catch (error) {
        res.status(500).send('User not found');
    }
});

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
