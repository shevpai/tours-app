import { NextFunction, Response } from 'express';
import { AppError } from '../features/error.features';
import { catchAsync, extndRequest } from '../utils/catchAsync';

export function restrictTo(...roles: string[]) {
  return catchAsync(
    async (req: extndRequest, res: Response, next: NextFunction) => {
      if (!roles.includes(req.user!.role)) {
        return next(
          new AppError('You do not have permission to perform this action', 403)
        );
      }

      next();
    }
  );
}
