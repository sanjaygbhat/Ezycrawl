const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');
const bcrypt = require('bcrypt');
const db = require('./dbConfig');
const crypto = require('crypto');
const routes = require('../routes/routes');

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(session({
    secret: 'your_secret_key',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // for HTTP; set true for HTTPS
}));

app.use(express.static(path.join(__dirname, 'public')));
app.use('/', routes);

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/dashboard', (req, res) => {
    if (!req.session.userId) {
        return res.redirect('/');
    }
    res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

app.post('/signup', async (req, res) => {
    const { email, password } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const result = await db.query('INSERT INTO users (email, password) VALUES ($1, $2) RETURNING *', [email, hashedPassword]);
        req.session.userId = result[0].id;
        res.json({ success: true, redirect: '/dashboard' });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
        if (result.length > 0) {
            const user = result[0];
            if (await bcrypt.compare(password, user.password)) {
                req.session.userId = user.id;
                return res.json({ success: true, redirect: '/dashboard' });
            }
        }
        res.status(401).json({ error: 'Invalid email or password' });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

app.get('/api/user-info', async (req, res) => {
    if (!req.session.userId) {
        return res.status(401).json({ error: 'Not authenticated' });
    }
    try {
        const result = await db.query('SELECT email FROM users WHERE id = $1', [req.session.userId]);
        res.json({ email: result[0].email });
    } catch (error) {
        console.error('Error fetching user info:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

app.get('/api/api-keys', async (req, res) => {
    if (!req.session.userId) {
        return res.status(401).json({ error: 'Not authenticated' });
    }
    try {
        const result = await db.query('SELECT key FROM api_keys WHERE user_id = $1', [req.session.userId]);
        res.json(result.map(row => row.key));
    } catch (error) {
        console.error('Error fetching API keys:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

app.post('/api/create-api-key', async (req, res) => {
    if (!req.session.userId) {
        return res.status(401).json({ error: 'Not authenticated' });
    }
    try {
        const apiKey = crypto.randomBytes(32).toString('hex');
        await db.query('INSERT INTO api_keys (user_id, key) VALUES ($1, $2)', [req.session.userId, apiKey]);
        res.json({ apiKey });
    } catch (error) {
        console.error('Error creating API key:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = app;
