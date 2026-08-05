import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import mongoSanitize from 'express-mongo-sanitize';
import xss from 'xss-clean';

import { env } from './config/env.js';
import notFound from './middleware/notFound.js';
import errorHandler from './middleware/errorHandler.js';
import authLimiter from './middleware/rateLimit.js';

import authRoutes from '../routes/auth.routes.js';
import adminRoutes from '../routes/admin.routes.js';

const app = express();

app.use(helmet());
app.use(cors({ origin: env.clientOrigin, credentials: true }));
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

app.use(mongoSanitize());
app.use(xss());

app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/admin', adminRoutes);

app.get('/health', (req, res) => {
  res.json({ success: true, message: 'Server healthy' });
});

app.use(notFound);
app.use(errorHandler);

export default app;