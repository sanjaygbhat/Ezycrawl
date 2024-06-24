console.log('APP.JS IS RUNNING - VERSION 1');

const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');
const bcrypt = require('bcrypt');
const { Pool } = require('pg');
const crypto = require('crypto');

const app = express();
const pool = new Pool(/* your database configuration */);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
    secret: 'your_secret_key',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // for HTTP; set true for HTTPS
}));

app.use(express.static(path.join(__dirname, 'public')));

app.get('/signup', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'signup.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.get('/dashboard', (req, res) => {
    if (!req.session.userId) {
        return res.redirect('/login.html');
    }
    res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

app.post('/signup', async (req, res) => {
    const { email, password } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const result = await pool.query('INSERT INTO users (email, password) VALUES ($1, $2) RETURNING *', [email, hashedPassword]);
        req.session.userId = result.rows[0].id;
        res.json({ success: true, redirect: '/dashboard' });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (result.rows.length > 0) {
            const user = result.rows[0];
            if (await bcrypt.compare(password, user.password)) {
                req.session.userId = user.id;
                return res.redirect('/dashboard');
            }
        }
        res.status(401).send('Invalid email or password');
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).send('Server error');
    }
});

app.get('/api/user-info', async (req, res) => {
    console.log('Request received for /api/user-info');
    if (!req.session.userId) {
        console.log('No user session found');
        return res.status(401).json({ error: 'Not authenticated' });
    }
    try {
        const result = await pool.query('SELECT email FROM users WHERE id = $1', [req.session.userId]);
        res.json({ email: result.rows[0].email });
    } catch (error) {
        console.error('Error fetching user info:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

app.get('/api/api-keys', async (req, res) => {
    console.log('Request received for /api/api-keys');
    if (!req.session.userId) {
        console.log('No user session found');
        return res.status(401).json({ error: 'Not authenticated' });
    }
    try {
        const result = await pool.query('SELECT key FROM api_keys WHERE user_id = $1', [req.session.userId]);
        res.json(result.rows.map(row => row.key));
    } catch (error) {
        console.error('Error fetching API keys:', error);
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

// Move this catch-all route to the end of all other routes
app.use((req, res) => {
    console.error(`Unhandled request to ${req.path}`);
    res.status(404).send('404 Not Found');
});

app.listen(3000, () => {
    console.log(`Server running on http://localhost:3000`);
});
