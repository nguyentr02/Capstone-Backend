require('dotenv').config();

// Import required modules
const express = require('express');
const db = require('./db');

// Create Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//Define a simple route
app.get('/', (req, res) => {
    res.json({ message: 'Welcome to the application' });
});

// Start the Express server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
