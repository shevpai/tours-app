import { NextFunction, Request, Response } from 'express';

export function aliasTopTours(req: Request, res: Response, next: NextFunction) {
  (req.query.limit = '5'), (req.query.sort = '-ratingsAverage,price');
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
}
