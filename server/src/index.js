import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoose from 'mongoose';
import authRouter from './routes/auth.js';
import gameRouter from './routes/game.js';
import cookRouter from './routes/cook.js';
import marketRouter from './routes/market.js';
import customersRouter from './routes/customers.js';
import restaurantRouter from './routes/restaurant.js';
import profileRouter from './routes/profile.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  });

// Middleware
app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL }));
app.use(express.json());

// Rate limiter for auth routes
const authLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: { error: 'Too many requests, please try again later' }
});
app.use('/api/auth', authLimiter);

// Routes
app.use('/api/auth', authRouter);
app.use('/api/game', gameRouter);
app.use('/api/cook', cookRouter);
app.use('/api/market', marketRouter);
app.use('/api/customers', customersRouter);
app.use('/api/restaurant', restaurantRouter);
app.use('/api/profile', profileRouter);

// Error handler
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
