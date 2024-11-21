import dotenv from 'dotenv';
import express from 'express';


import userRoutes from './routes/userRoutes';

dotenv.config();

const app: express.Application = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//Routes
app.use('/api/users', userRoutes);

// Database connection

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

