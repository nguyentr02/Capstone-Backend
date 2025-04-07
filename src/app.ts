import express from 'express';
import cookieParser from 'cookie-parser';

// Importing routes
import authRoutes from './routes/authRoutes';
import eventRoutes from './routes/eventRoutes';
import userRoutes from './routes/userRoutes';
import ticketRoutes from './routes/ticketRoutes';

// Importing middlewares
const app = express();

app.use(express.json());  // Middleware to parse JSON body
app.use(cookieParser());  // Middleware to parse cookies

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/user', userRoutes);
app.use('/api', ticketRoutes);

export default app;