const { Sequelize } = require('sequelize');
require('dotenv').config();

// Create a new Sequelize instance
const dbName = process.env.DB_NAME;
const username = process.env.DB_USER;
const password = process.env.DB_PASSWORD;

const sequelize = new Sequelize(dbName, username, password, {
    host: process.env.DB_HOST,
    dialect: 'mysql', 
    pool: {
        max: 10, // Maximum number of connection in pool
        min: 0,  // Minimum number of connection in pool
        acquire: 30000, // Maximum time, in ms, that pool will try to get connection before throwing error
        idle: 10000  // Maximum time, in ms, that a connection can be idle before being released
    }
});

// Test the connection
sequelize.authenticate()
    .then(() => console.log('Successfully connected to the MySQL database with Sequelize.'))
    .catch((err) => {
        console.error('Unable to connect to the MySQL database:', err);
        process.exit(1);
    });

module.exports = sequelize;
