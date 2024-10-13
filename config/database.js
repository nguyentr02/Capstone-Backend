const { Sequelize } = require('sequelize');
require('dotenv').config();

// Create a new Sequelize instance
const dbName = process.env.DB_NAME;
const username = process.env.DB_USER;
const password = process.env.DB_PASSWORD;

const db = new Sequelize(dbName, username, password, {
    host: process.env.DB_HOST,
    dialect: 'mysql',
    pool: {
        max: 10, // Maximum number of connection in pool
        min: 0,  // Minimum number of connection in pool
        acquire: 30000, // Maximum time, in ms, that pool will try to get connection before throwing error
        idle: 10000  // Maximum time, in ms, that a connection can be idle before being released
    }
});

const connectDB = async () => {
    try {
        await sequelize.authenticate();
        console.log('Database connection has been established successfully.');
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
};


module.exports = { db, connectDB };
