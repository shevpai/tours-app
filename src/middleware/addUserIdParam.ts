import { Response, NextFunction } from 'express';
import { extndRequest } from '../utils/catchAsync';

// TO use standart getUser for GET ME endpoint
export const addUserIdParam = (
  req: extndRequest,
  res: Response,
  next: NextFunction
) => {
  req.params.id = req.user!.id;
  next();
};
