import { NextFunction, Request, Response } from 'express';
import { AppError, ResponseError } from '../features/error.features';

const sendErrorDev = (err: ResponseError, res: Response) => {
  res.status(err.statusCode!).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

const sendErrorProd = (err: ResponseError, res: Response) => {
  if (err.isOperational) {
    res.status(err.statusCode!).json({
      status: err.status,
      message: err.message,
    });
    // Else block for programming errors
  } else {
    console.error('ERROR:', err);

    res.status(500).json({
      status: 'error',
      message: 'Something went wrong',
    });
  }
};

const handleCastErrorDB = (err: ResponseError) =>
  new AppError(`Invalid ${err.path}: ${err.value}`, 400);

const handleDuplicateFieldsDB = (err: ResponseError) => {
  // match text between quotes for old version of mongodb error object
  // const duplicate = err.errmsg!.match(/(["'])(?:(?=(\\?))\2.)*?\1/)![0];

  const duplicate = err.keyValue!.name;

  return new AppError(
    `Duplicate field value: ${duplicate}. Please use another value!`,
    400
  );
};

const handleValidationError = (err: ResponseError) => {
  // for legacy mongoose error object
  // const errors = Object.values(err.errors!).map((e) => e.message);
  // const msg = `Invalid input data. ${errors.join('. ')}`;

  return new AppError(err.message, 400);
};

const handleJwtValidationError = () =>
  new AppError('Invalid token. Please log in again', 401);

const handleJwtExpiredError = () =>
  new AppError('Your token has expired! Please log in again', 401);

export function urlErrorHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  // work for es5
  // const err: ResponseError = new Error(`Can't find route for ${req.originalUrl}`);
  // err.status = 'fail'
  // err.statusCode = 404
  // next(err)

  // works only for es6+ compiler option
  next(new AppError(`Can't find route for ${req.originalUrl}`, 404));
}

export function globalErrorHandler(
  err: ResponseError,
  req: Request,
  res: Response,
  next: NextFunction
) {
  // next two lines for handle mongoose errors without crash app
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // error represintation for dev and prod
  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error: ResponseError = { ...err, message: err.message };

    if (error.name === 'CastError') error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);
    if (
      error._message === 'Validation failed' ||
      error._message === 'User validation failed' ||
      error._message === 'Tour validation failed'
    )
      error = handleValidationError(error);
    if (error.name === 'JsonWebTokenError') error = handleJwtValidationError();
    if (error.name === 'TokenExpiredError') error = handleJwtExpiredError();

    sendErrorProd(error, res);
  }
}
