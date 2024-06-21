const express = require('express');
const config = require('./config');
const routes = require('./routes');

const app = express();

app.use(express.json());
app.use('/api', routes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(config.port, () => {
    console.log(`Server is running on port ${config.port}`);
});