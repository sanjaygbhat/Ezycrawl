console.log('INDEX.JS IS RUNNING - VERSION 1');

const express = require('express');
const bodyParser = require('body-parser'); // Import body-parser
const path = require('path');
const bcrypt = require('bcrypt');
const session = require('express-session');
const { Pool } = require('pg');
const crypto = require('crypto');
const app = express();
const port = 3000;
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'ezycrawl', // Changed from 'sanjaybhat' to 'ezycrawl'
  password: 'postgres',
  port: 5450,
});

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
        const result = await pool.query('INSERT INTO users(email, password) VALUES($1, $2) RETURNING id', [email, hashedPassword]);
        req.session.userId = result.rows[0].id;
        res.json({ success: true, redirect: '/dashboard' });
    } catch (error) {
        res.status(400).send('Error creating the user: ' + error.message);
    }
});

// Login route
app.post('/login', async (req, res) => {
    console.log('Login request received:', req.body);
    const { email, password } = req.body;
    try {
        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        console.log('Database query result:', result.rows);
        if (result.rows.length > 0) {
            const user = result.rows[0];
            if (await bcrypt.compare(password, user.password)) {
                req.session.userId = user.id;
                console.log('Login successful, session:', req.session);
                return res.json({ success: true, redirect: '/dashboard' });
            }
        }
        console.log('Login failed: Invalid email or password');
        res.json({ success: false, message: 'Invalid email or password' });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

app.get('/dashboard', (req, res) => {
    console.log('Received request for /dashboard');  // Added logging
    if (!req.session.userId) {  // Corrected session check
        console.log('No user session found, redirecting to login');  // Added logging
        res.redirect('/login');
    } else {
        console.log('User session found, serving dashboard');  // Added logging
        res.sendFile(path.join(__dirname, 'public', 'dashboard.html')); 
    }
});

app.get('/api/user-info', async (req, res) => {
    if (!req.session.userId) {
        return res.status(401).json({ error: 'Not authenticated' });
    }
    try {
        const result = await pool.query('SELECT email FROM users WHERE id = $1', [req.session.userId]);
        res.json({ email: result.rows[0].email });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

app.get('/api/api-keys', async (req, res) => {
    if (!req.session.userId) {
        return res.status(401).json({ error: 'Not authenticated' });
    }
    try {
        const result = await pool.query('SELECT key FROM api_keys WHERE user_id = $1', [req.session.userId]);
        res.json(result.rows.map(row => row.key));
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

app.post('/api/create-api-key', async (req, res) => {
    console.log('Request received for /api/create-api-key');
    if (!req.session.userId) {
        console.log('No user session found');
        return res.status(401).json({ error: 'Not authenticated' });
    }
    try {
        const apiKey = crypto.randomBytes(32).toString('hex');
        console.log('Generated API key:', apiKey);
        await pool.query('INSERT INTO api_keys (user_id, key) VALUES ($1, $2)', [req.session.userId, apiKey]);
        res.json({ apiKey });
    } catch (error) {
        console.error('Error creating API key:', error);
        res.status(500).json({ error: 'Server error' });
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
