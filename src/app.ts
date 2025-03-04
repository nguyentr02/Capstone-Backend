import express from 'express';
import authRoutes from './routes/authRoutes';
import eventRoutes from './routes/eventRoutes';
import cookieParser from 'cookie-parser';

const app = express();

app.use(express.json());  // Middleware to parse JSON body
app.use(cookieParser());  // Middleware to parse cookies

app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);

export default app;