// for having access to ENV variables
const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.join(__dirname, '..', 'config.env') });

const express = require('express');
const morgan = require('morgan');
const mongoose = require('mongoose');
const rateLimiter = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

import { Application } from 'express';
import { urlErrorHandler, globalErrorHandler } from './middleware/errorHandler';
import { reviewRouter } from './routes/reviewRouter';
import { toursRouter } from './routes/toursRouter';
import { userRouter } from './routes/userRouter';

// Unhandled sync exceptions
process.on('uncaughtException', (err: Error) => {
  console.log('UNCAUGHT EXCEPTION! Shutting down...');
  console.log(`${err.name}: ${err.message}`);

  process.exit(1);
});

const DB = process.env.DB_URI!.replace('<PASSWORD>', process.env.DB_PASSWORD!);

const app: Application = express();
const PORT = process.env.PORT || 8000;

// logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Set security HTTP headers
app.use(helmet());

// To avoid DOS and Brut Force attacks
const limiter = rateLimiter({
  max: 100,
  windowMs: 60 * 60 * 1e3,
  message: 'Too many requests from this IP, please try again in an hour',
});

app.use('/api', limiter);

// instead of using bodyParser
app.use(express.json({ limit: '10kb' }));

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// Prevent params polution (double sort etc)
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsAverage',
      'ratingsQuantity',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  })
);

// Static route
app.use('/public', express.static(path.join(__dirname, '..', 'public')));

// Main routes
app.use('/api/v1/users', userRouter);
app.use('/api/v1/tours', toursRouter);
app.use('/api/v1/reviews', reviewRouter);

// Handler for invalid url
app.all('*', urlErrorHandler);

// Error handler
app.use(globalErrorHandler);

async function start() {
  try {
    await mongoose.connect(DB, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
      useFindAndModify: false,
    });

    const server = app.listen(PORT, () =>
      console.log(`Server is start on port ${PORT}...`)
    );

    // Promise reject errors
    process.on('unhandledRejection', (err: Error) => {
      console.log('UNHANDLED REJECTION! Shutting down...');
      console.log(`${err.name}: ${err.message}`);

      server.close(() => {
        process.exit(1);
      });
    });
  } catch (e) {
    console.error(`Server error ${e.message}`);
    process.exit(1);
  }
}

start();
