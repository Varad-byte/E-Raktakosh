/**
 * Blood Bank Inventory Management System (BBIMS)
 * Production-Ready Backend Server
 */

require('dotenv').config();
const path = require('node:path');
const express = require('express');
const cors = require('cors');

const apiRoutes = require('./src/routes');
const { errorHandler, notFoundHandler } = require('./src/middleware/errorHandler');
const { db } = require('./src/config/db');

const app = express();
const PORT = process.env.PORT || 5000;
const CORS_ORIGIN = process.env.CORS_ORIGIN || '*';

// 1. CORS Configuration
app.use(cors({
  origin: CORS_ORIGIN,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// 2. Request Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 3. Request Logging (in development)
if (process.env.NODE_ENV !== 'test') {
  app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
      const duration = Date.now() - start;
      console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} ${res.statusCode} (${duration}ms)`);
    });
    next();
  });
}

// 4. Mount API Routes on both /api and /api/v1 for 100% frontend contract compatibility
app.use('/api', apiRoutes);
app.use('/api/v1', apiRoutes);

// 5. Serve existing frontend static files (index.html, script.js, style.css)
app.use(express.static(path.resolve(__dirname)));

// 6. 404 Handler for undefined API routes
app.use('/api', notFoundHandler);
app.use('/api/v1', notFoundHandler);

// 7. Fallback to index.html for client-side routing on frontend paths
app.get('/{*splat}', (req, res) => {
  res.sendFile(path.resolve(__dirname, 'index.html'));
});

// 8. Centralized Error Handler
app.use(errorHandler);

// 9. Start Server
const server = app.listen(PORT, () => {
  console.log(`
  ==============================================================
   BLOOD BANK INVENTORY MANAGEMENT SYSTEM (BBIMS) BACKEND
  ==============================================================
   Environment : ${process.env.NODE_ENV || 'development'}
   Server URL  : http://localhost:${PORT}
   API URL     : http://localhost:${PORT}/api
   API (v1)    : http://localhost:${PORT}/api/v1
   Frontend UI : http://localhost:${PORT}/
   Health Check: http://localhost:${PORT}/api/health
  ==============================================================
  `);
});

// 10. Graceful Shutdown
function handleShutdown(signal) {
  console.log(`\nReceived ${signal}. Shutting down gracefully...`);
  server.close(() => {
    console.log('HTTP server closed.');
    try {
      db.close();
      console.log('Database connection closed.');
    } catch (e) {
      // Ignored if already closed
    }
    process.exit(0);
  });
}

process.on('SIGTERM', () => handleShutdown('SIGTERM'));
process.on('SIGINT', () => handleShutdown('SIGINT'));

module.exports = { app, server };
