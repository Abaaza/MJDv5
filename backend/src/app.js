// src/app.js
import express from 'express';
import cors from 'cors';
import connect from './config/db.js'; // async connection function

// ✅ Await DB connection before anything else (works in Node 20+ with top-level await)
await connect();

import authRoutes from './routes/auth.routes.js';
import boqRoutes from './routes/boq.routes.js';
import matchRoutes from './routes/match.routes.js';
import priceRoutes from './routes/price.routes.js';
import quotationRoutes from './routes/quotation.routes.js';
import auth from './middlewares/auth.js';

const app = express();

// ✅ Middlewares (order matters)
app.use(cors({ origin: '*', credentials: true }));
// Increase body size limit for large price match payloads
app.use(express.json({ limit: '10mb', strict: false })); // important for Lambda to parse body properly

// ✅ --- ADDED THIS ROUTE ---
// Add a "health check" route for the base URL to confirm the API is running
app.get('/', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'MJD Backend API is running successfully.' });
});

// ✅ API Routes
app.use('/api/auth', authRoutes);
app.use('/api/boq', auth, boqRoutes);
app.use('/api/match', auth, matchRoutes);
app.use('/api/prices', auth, priceRoutes);
app.use('/api/quotations', auth, quotationRoutes);

export default app;
