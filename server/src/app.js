const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const routes = require('./routes');
const errorHandler = require('./middlewares/errorHandler');
const ApiError = require('./utils/apiError');
const { NODE_ENV } = require('./config/env');

const app = express();

// Security HTTP headers
app.use(helmet());

// Enable CORS
app.use(
  cors({
    origin: true, // Allow client origin
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);

// Logging middleware
if (NODE_ENV !== 'test') {
  app.use(morgan(NODE_ENV === 'development' ? 'dev' : 'combined'));
}

// Request parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Base API Routes
app.use('/api', routes);
app.use('/', routes);

// Handle 404 for unmatched routes
app.use((req, res, next) => {
  next(ApiError.notFound(`Route not found: ${req.method} ${req.originalUrl}`));
});

// Centralized error handling
app.use(errorHandler);

module.exports = app;
