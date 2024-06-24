const express = require('express');
const router = express.Router();
const db = require('../src/dbConfig');

// Middleware to check if user is admin
const isAdmin = (req, res, next) => {
  if (req.session.userId && req.session.isAdmin) {
    next();
  } else {
    res.status(403).json({ error: 'Access denied' });
  }
};

// Get all users sorted by ID in ascending order
router.get('/users', isAdmin, async (req, res) => {
  try {
    const users = await db.query('SELECT id, email, credit_balance FROM users ORDER BY id ASC');
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Add credits to a user
router.post('/users/:id/add-credits', isAdmin, async (req, res) => {
  const { id } = req.params;
  const { credits } = req.body;
  
  if (isNaN(credits) || credits < 0) {
    return res.status(400).json({ error: 'Invalid credit amount' });
  }

  try {
    const result = await db.query(
      'UPDATE users SET credit_balance = credit_balance + $1 WHERE id = $2 RETURNING id, email, credit_balance',
      [credits, id]
    );
    
    if (result.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(result[0]);
  } catch (error) {
    console.error('Error adding credits:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
