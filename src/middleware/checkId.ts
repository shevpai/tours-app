import { NextFunction, Request, Response } from 'express';

export function checkTourID(
  req: Request,
  res: Response,
  next: NextFunction,
  value: string
) {
  // if (+value > toursFromFile.length) {
  //   return res.status(404).json({
  //     status: 'fail',
  //     message: 'invalid ID',
  //   });
  // }

  // console.log(`Tour id is ${value}`);
  next();
}
