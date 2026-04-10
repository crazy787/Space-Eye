require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const { apiLimiter } = require('./middleware/rateLimit');
const scheduler = require('./services/scheduler');

// Initialize Express
const app = express();

// Connect to MongoDB
connectDB().then(() => {
  // Start scheduler once DB is connected
  scheduler.start();
});

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Rate limiting
app.use('/api/', apiLimiter);

// Health check
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: '🚀 Space-Eye API v3.0',
    version: '3.0.0',
    endpoints: {
      iss: '/api/iss',
      satellites: '/api/satellites',
      alerts: '/api/alerts',
      ai: '/api/ai',
      media: '/api/media',
      auth: '/api/auth',
      settings: '/api/settings',
    },
  });
});

app.get('/api/health', (req, res) => {
  const cacheService = require('./services/cacheService');
  res.json({
    success: true,
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    cache: cacheService.getLastUpdated(),
    scheduler: scheduler.isRunning ? 'running' : 'stopped',
  });
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/iss', require('./routes/iss'));
app.use('/api/satellites', require('./routes/satellites'));
app.use('/api/alerts', require('./routes/alerts'));
app.use('/api/ai', require('./routes/ai'));
app.use('/api/media', require('./routes/media'));
app.use('/api/settings', require('./routes/settings'));

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

// Error handler
app.use(errorHandler);

// Graceful shutdown
process.on('SIGTERM', () => {
  scheduler.stop();
  process.exit(0);
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n🚀 Space-Eye API Server v3.0`);
  console.log(`📡 Running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🤖 AI Model: ${process.env.AI_MODEL || 'llama3'}`);
  console.log(`🔗 http://localhost:${PORT}\n`);
});

module.exports = app;
