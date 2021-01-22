import { NextFunction, Request, Response } from 'express';
import { AppError } from '../features/error.features';
import { User } from '../models/user.model';
import { catchAsync, extndRequest } from '../utils/catchAsync';

type IObj = {
  [key: string]: any;
};

const filterObj = (obj: IObj, ...allowedFields: string[]) =>
  allowedFields.reduce((acc: IObj, key) => {
    if (Object.keys(obj).includes(key)) acc[key] = obj[key];
    return acc;
  }, {});

class UserController {
  getAllUsers = catchAsync(async (req: Request, res: Response) => {
    const users = await User.find();

    res.status(200).json({
      status: 'success',
      data: {
        users,
      },
    });
  });

  selfUpdate = catchAsync(
    async (req: extndRequest, res: Response, next: NextFunction) => {
      // create error if user try to POST password
      if (req.body.password || req.body.passwordConfirm) {
        return next(
          new AppError(
            'This route is not for password updates. Please use /users/update-my-password',
            400
          )
        );
      }

      // filter body (not allowed user to change secure props)
      const filtredBody = filterObj(req.body, 'name', 'email');

      // use findByIdAndUpdate to avoid passwordConfirm validation
      const updatedUser = await User.findByIdAndUpdate(
        req.user!.id,
        filtredBody,
        {
          new: true,
          runValidators: true,
        }
      );

      res.status(200).json({
        status: 'success',
        data: {
          user: updatedUser,
        },
      });
    }
  );

  inactivateAcc = catchAsync(
    async (req: extndRequest, res: Response, next: NextFunction) => {
      await User.findByIdAndUpdate(req.user!.id, { active: false });

      res.status(204).json({
        status: 'success',
        data: null,
      });
    }
  );
}

export default new UserController();
