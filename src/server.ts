import dotenv from 'dotenv';
import app from './app';
import { prisma } from './config/prisma';

dotenv.config();

const PORT = process.env.PORT || 3000;

const startServer = async () => {
    try {
        // Test database connection
        await prisma.$connect();
        console.log('Connected to database');

        // Start server
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    } catch (error) {
        console.error('Error starting server:', error);
        process.exit(1);
    }
};

startServer();