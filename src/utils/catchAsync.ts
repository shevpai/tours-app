import { NextFunction, Request, Response } from 'express';
import { ResponseError } from '../features/error.features';
import { IUser } from '../models/user.model';

export interface extndRequest extends Request {
  user?: IUser;
}

type IFn = (
  req: Request | extndRequest,
  res: Response,
  next: NextFunction
) => Promise<void | ResponseError>;

export const catchAsync = (fn: IFn) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };
};
