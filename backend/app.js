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

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));
app.use(metricsMiddleware);

app.use('/', healthRoutes);

app.use('/api', urlRoutes);

app.use('/', redirectRoutes);

app.use(errorHandler);

export default app;
