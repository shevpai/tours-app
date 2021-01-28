import { NextFunction, Response } from 'express';
import { extndRequest } from '../utils/catchAsync';

export function setParamsForNestedReviews(
  req: extndRequest,
  res: Response,
  next: NextFunction
) {
  // Allow nested routes
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user!.id;
  next();
}
