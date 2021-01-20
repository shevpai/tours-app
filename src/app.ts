import { Application } from 'express';
import { errorCreator, globalErrorHandler } from './middleware/errorHandler';
import { toursRouter } from './routes/toursRouter';
import { userRouter } from './routes/userRouter';

const path = require('path');

const express = require('express');
const morgan = require('morgan');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config({ path: path.join(__dirname, '..', 'config.env') });

// Unhandled sync exceptions
process.on('uncaughtException', (err: Error) => {
  console.log('UNCAUGHT EXCEPTION! Shutting down...');
  console.log(`${err.name}: ${err.message}`);

  process.exit(1);
});

const DB = process.env.DB_URI!.replace('<PASSWORD>', process.env.DB_PASSWORD!);

const app: Application = express();
const PORT = process.env.PORT || 8000;

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(express.json());

// static route
app.use('/public', express.static(path.join(__dirname, '..', 'public')));

// main routes
app.use('/api/v1/users', userRouter);
app.use('/api/v1/tours', toursRouter);

// handler for invalid routes
app.all('*', errorCreator);
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
