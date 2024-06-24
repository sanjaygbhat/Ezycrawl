const app = require('./app');
const dotenv = require('dotenv');
dotenv.config();
const PORT = process.env.PORT || 3001;
// Attempt to start the server and handle possible errors
app.listen(PORT, () => {
}).on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
    } else {
        console.error(err);
    }
});
