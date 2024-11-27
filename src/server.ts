import express from 'express';
import authRoutes from './routes/authRoutes';

const app = express();

app.use(express.json());  // Middleware to parse JSON body
app.use('/api/auth', authRoutes);

export default app;