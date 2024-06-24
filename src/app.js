const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');
const bcrypt = require('bcrypt');
const db = require('../src/dbConfig');
const crypto = require('crypto');
const routes = require('../routes/routes');
const adminRoutes = require('../routes/admin');
const apiRoutes = require('../routes/routes');
const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(session({
    secret: 'your_secret_key',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // for HTTP; set true for HTTPS
}));
// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));
app.use('/', routes);
app.use('/api/admin', adminRoutes);
app.use('/api', apiRoutes);
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});
app.get('/dashboard', (req, res) => {
    if (!req.session.userId) {
        return res.redirect('/');
    }
    res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});
app.get('/admin', (req, res) => {
    if (req.session.isAdmin) {
        res.sendFile(path.join(__dirname, 'public', 'admin.html'));
    } else {
        res.status(403).send('Access denied');
    }
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
                req.session.isAdmin = user.is_admin;
                return res.json({ success: true, redirect: user.is_admin ? '/admin.html' : '/dashboard' });
            }
        }
        res.status(401).json({ error: 'Invalid email or password' });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});
app.get('/api/user-info', async (req, res) => {
    if (!req.session.userId) {
        return res.status(401).json({ error: 'Not authenticated' });
    }
    try {
        const result = await db.query('SELECT email, credit_balance FROM users WHERE id = $1', [req.session.userId]);
        if (result && result.length > 0) {
            const user = result[0];
            const responseData = {
                email: user.email,
                credit_balance: user.credit_balance
            };
            res.json(responseData);
        } else {
            res.status(404).json({ error: 'User not found' });
        }
    } catch (error) {
        console.error('Error fetching user info:', error);
        console.error('Error name:', error.name);
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
        res.status(500).json({ error: 'Server error', details: error.message });
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
        res.status(500).json({ error: 'Server error' });
    }
});
app.post('/api/admin/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const result = await db.query('SELECT * FROM users WHERE email = $1 AND is_admin = true', [email]);
        if (result.length > 0) {
            const user = result[0];
            const passwordMatch = await bcrypt.compare(password, user.password);
            if (passwordMatch) {
                req.session.userId = user.id;
                req.session.isAdmin = true;
                return res.json({ success: true });
            }
        }
        res.status(401).json({ error: 'Invalid email or password' });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});
app.get('/admin_dashboard.html', (req, res) => {
    if (req.session.isAdmin) {
        res.sendFile(path.join(__dirname, 'public', 'admin_dashboard.html'));
    } else {
        res.status(403).send('Access denied');
    }
});
app.get('/api/users', async (req, res) => {
    try {
        const result = await db.query('SELECT id, email, credit_balance FROM users ORDER BY id ASC');
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});
app.post('/api/users/:id/add-credits', async (req, res) => {
    const userId = req.params.id;
    const { credits } = req.body;
    try {
        const result = await db.query('UPDATE users SET credit_balance = credit_balance + $1 WHERE id = $2 RETURNING *', [credits, userId]);
        if (result.length > 0) {
            res.json(result[0]);
        } else {
            res.status(404).json({ error: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});
app.get('/api/users/search', async (req, res) => {
    const searchTerm = req.query.searchTerm;
    try {
        const result = await db.query('SELECT id, email, credit_balance FROM users WHERE email LIKE $1', ['%' + searchTerm + '%']);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});
const PORT = process.env.PORT || 3001;
console.log(`PORT in app.js: ${PORT}`); // Log the port being used
app.listen(PORT, () => {
});
module.exports = app;
