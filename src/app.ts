import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors'; // Import cors middleware

// Importing routes
import authRoutes from './routes/authRoutes';
import eventRoutes from './routes/eventRoutes';
import userRoutes from './routes/userRoutes';
import ticketRoutes from './routes/ticketRoutes';
import registrationRoutes from './routes/registrationRoutes'; // Added import

import swaggerUi from 'swagger-ui-express';
import specs from './config/swagger';

// Importing middlewares
const app = express();

app.use(express.json());  // Middleware to parse JSON body
app.use(cookieParser());  // Middleware to parse cookies

// Enable CORS for all routes
app.use(cors({
    origin: '*', // Allow all origins (for development purposes only)
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allowed HTTP methods
}));

// Swagger UI route
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/user', userRoutes);
app.use('/api', ticketRoutes);
app.use('/api/registrations', registrationRoutes); // Added registration routes

export default app;
