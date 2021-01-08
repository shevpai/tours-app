import { Application } from 'express';
import { toursRouter } from './routes/toursRouter';
import { userRouter } from './routes/userRouter';

const path = require('path');

const express = require('express');
const morgan = require('morgan');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config({ path: path.join(__dirname, '..', 'config.env') });

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

async function start() {
  try {
    await mongoose.connect(DB, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
      useFindAndModify: false,
    });
    app.listen(PORT, () => console.log(`Server is start on port ${PORT}...`));
  } catch (e) {
    console.error(`Server error ${e.message}`);
    process.exit(1);
  }
}

start();
