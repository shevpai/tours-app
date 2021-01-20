import { NextFunction, Response } from 'express';
import { promisify } from 'util';
import { AppError } from '../features/error.features';
import { User } from '../models/user.model';
import { catchAsync, extndRequest } from '../utils/catchAsync';

const jwt = require('jsonwebtoken');

export const protectRout = catchAsync(
  async (req: extndRequest, res: Response, next: NextFunction) => {
    const authHeader = (req.headers['x-access-token'] ||
      req.headers['authorization']) as string;

    // Check verification token
    const token =
      authHeader && authHeader.startsWith('Bearer')
        ? authHeader.split(' ')[1]
        : null;

    if (!token) {
      return next(
        new AppError('You are not logged in! Please log in to get access', 401)
      );
    }

    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    // Check if user still exist
    const user = await User.findById(decoded.id);

    if (!user) {
      return next(
        new AppError(
          'The user belonging to this token does no longer exist',
          401
        )
      );
    }

    // Check if user changed password after the token was issued
    if (user.changedPasswordAfter(decoded.iat)) {
      return next(
        new AppError('User recently changed password! Please log in again', 401)
      );
    }

    req.user = user;
    next();
  }
);
