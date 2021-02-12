// Just a sample of middleware that check if user logged in
// And if it's true sends current user data back, by putting it in res.locals

import { NextFunction, Response } from 'express';
import { promisify } from 'util';
import { User } from '../models/user.model';
import { catchAsync, extndRequest } from '../utils/catchAsync';

const jwt = require('jsonwebtoken');

export const isLoggedIn = catchAsync(
  async (req: extndRequest, res: Response, next: NextFunction) => {
    if (req.cookies.jwt) {
      // Verify token from cookies
      const decoded = await promisify(jwt.verify)(
        req.cookies.jwt,
        process.env.JWT_SECRET
      );

      // Check if user still exist
      const user = await User.findById(decoded.id);

      if (!user) {
        return next();
      }

      // Check if user changed password after the token was issued
      if (user.changedPasswordAfter(decoded.iat)) {
        return next();
      }

      // If we passed through all if() statement, there is logged in user.
      // We put that user in locals and later have access to user data in veiw tamplates
      res.locals.user = user;
      return next();
    }
    next();
  }
);
