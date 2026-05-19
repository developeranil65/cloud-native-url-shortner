import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import errorHandler from './middleware/errorHandler.js';
import metricsMiddleware from './middleware/metrics.js';

import urlRoutes from './routes/urlRoutes.js';
import redirectRoutes from './routes/redirectRoutes.js';
import healthRoutes from './routes/healthRoutes.js';

dotenv.config();

const app = express();

// Middleware
app.use(helmet()); // Security headers
app.use(cors()); // CORS support
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev')); // Request logging

// Prometheus Metrics Middleware
app.use(metricsMiddleware);

// Routes
// Health and Metrics endpoints (should typically not be rate-limited the same way)
app.use('/', healthRoutes);

// API routes
app.use('/api', urlRoutes);

// Redirect route (catch-all for short codes)
app.use('/', redirectRoutes);

// Error Handling Middleware
app.use(errorHandler);

export default app;
