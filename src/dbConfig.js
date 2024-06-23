const pgp = require('pg-promise')();
const db = pgp({
    user: 'postgres',
    password: 'postgres',
    host: 'localhost',
    port: 5450,
    database: 'ezycrawl'
});

module.exports = db;