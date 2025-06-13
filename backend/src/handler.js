// src/handler.js
import serverless from 'serverless-http';
import app from './app.js';

// Use the simplified, default export. 
// It works perfectly with API Gateway Payload Format 2.0.
export const handler = serverless(app);
