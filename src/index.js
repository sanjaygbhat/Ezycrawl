const app = require('./app');
const port = process.env.PORT || 3000;
const startServer = (port) => {
    app.listen(port, '0.0.0.0', (err) => {
        if (err) {
            if (err.code === 'EADDRINUSE') {
                startServer(port + 1);
            } else {
                console.error('Failed to start server:', err);
            }
            return;
        }
    });
};
startServer(port);
