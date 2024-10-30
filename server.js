require('dotenv').config();

const express = require('express');
const pool = require('./config/database');  // Import the database connection

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares to parse the incoming request data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Import routes
const userRoutes = require('./routes/userRoutes');

// Routes
app.use('/api/users', userRoutes);

//Define a simple route for testing
app.get('/', (req, res) => {
    res.json({ message: 'Welcome to the application' });
});


// Start server
app.listen(PORT, async () => {
    try {
        // Test database connection
        await pool.query('SELECT 1');
        console.log('Database connection successful');
        console.log(`Server is running on port ${PORT}`);
    } catch (error) {
        console.error('Database connection failed:', error);
        process.exit(1);
    }
});
// // Start the Express server
// app.listen(PORT, () => {
//     console.log(`Server running on port ${PORT}`);
// });
