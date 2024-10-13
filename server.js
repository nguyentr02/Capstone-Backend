require('dotenv').config();

const express = require('express');
const { connectDB } = require('./config/database');  // Import the database connection

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Import routes
const userRoutes = require('./routes/userRoutes');

app.use('/api/users', userRoutes);

connectDB();

//Define a simple route
app.get('/', (req, res) => {
    res.json({ message: 'Welcome to the application' });
});

// Start the Express server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
