// create_admin.js
const bcrypt = require('bcrypt');
const { db, pgp } = require('../src/dbConfig'); // Ensure this path is correct and pgp is properly exported
async function createAdminUser() {
    const email = 'sanjay@ezytech.com';
    const password = 'Ezydunk@2024';
    const isAdmin = true;

    try {
        console.log('Hashing password...');
        // Hash the password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        console.log('Password hashed successfully.');

        // Insert the admin user into the database
        const que = 'INSERT INTO users (email, password, is_admin, credit_balance) VALUES ($1, $2, $3, $4) RETURNING id';
        const values = [email, hashedPassword, isAdmin, 0]; // Starting credit balance is 0

        console.log('Inserting admin user into the database...');
        const result = await db.query(que, values);
        console.log(`Admin user created successfully with ID: ${result[0].id}`);
    } catch (error) {
        console.error('Error creating admin user:', error);
    } finally {
        console.log('Closing the database connection...');
        if (pgp) {
            pgp.end(); // Ensure pgp is defined before calling end()
            console.log('Database connection closed.');
        } else {
            console.error('pgp is undefined. Cannot close the database connection.');
        }
    }
}

createAdminUser();