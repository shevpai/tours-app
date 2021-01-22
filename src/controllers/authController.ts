import { NextFunction, Request, Response } from 'express';
import { AppError } from '../features/error.features';
import { IUser, User } from '../models/user.model';
import { catchAsync, extndRequest } from '../utils/catchAsync';
import { sendEmail } from '../utils/email';

const crypto = require('crypto');
const jwt = require('jsonwebtoken');

const cookieOptions = {
  expires: new Date(
    Date.now() + +process.env.JWT_COOKIE_EXPIRES_IN! * 24 * 60 * 60 * 1e3
  ),
  secure: process.env.NODE_ENV === 'production' ? true : false,
  httpOnly: true,
};

const createToken = (id: string) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

const createAndSendToken = (user: IUser, statusCode: number, res: Response) => {
  const token = createToken(user._id);

  res.cookie('jwt', token, cookieOptions);

  const userData = {
    name: user.name,
    email: user.email,
    role: user.role,
    id: user._id,
  };

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user: userData,
    },
  });
};

class AuthController {
  signup = catchAsync(async (req: Request, res: Response) => {
    const user = new User({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      passwordConfirm: req.body.passwordConfirm,
      passwordChangedAt: req.body.passwordChangedAt,
      role: req.body.role,
    });
    await user.save();

    createAndSendToken(user, 201, res);
  });

  login = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const { email, password } = req.body;

      if (!email || !password) {
        return next(new AppError(`Please provide email and password`, 400));
      }

      const user = await User.findOne({ email }).select('+password');

      if (!user || !(await user.correctPass(password, user.password))) {
        return next(new AppError('Incorrect email or password', 401));
      }

      createAndSendToken(user, 200, res);
    }
  );

  updateUserPassword = catchAsync(
    async (req: extndRequest, res: Response, next: NextFunction) => {
      const user = await User.findById(req.user!.id).select('+password');

      if (!(await user.correctPass(req.body.currentPassword, user.password))) {
        return next(new AppError('Your current password is wrong', 401));
      }

      user.password = req.body.password;
      user.passwordConfirm = req.body.passwordConfirm;

      // use .save() instead of findByIdAndUpdate because of pre middleware(hash password)
      // and also validation for password and passwordConfirm
      await user.save();

      createAndSendToken(user, 200, res);
    }
  );

  forgotPassword = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      // Check if user exist
      const user = await User.findOne({ email: req.body.email });

      if (!user) {
        return next(new AppError('There is no user with email address', 404));
      }

      // Generate reset token
      const resetToken = user.createPasswordResetToken();
      await user.save({ validateBeforeSave: false });

      // Send token to user's email
      const resetURL = `${req.protocol}://${req.get(
        'host'
      )}/api/v1/users/reset-password/${resetToken}`;

      const message = `Forgot you password? Submit a PATCH request with your new password and passwordConfirmed to: ${resetURL}\nIf you didn't forget your password, please ignore this email!`;

      try {
        await sendEmail({
          email: user.email,
          subject: 'Your password reset token (valid for 10 min)',
          text: message,
        });

        res.status(200).json({
          status: 'success',
          message: 'Token sent to email',
        });
      } catch (e) {
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save({ validateBeforeSave: false });

        return next(
          new AppError(
            'There was an error sending the email. Try again later!',
            500
          )
        );
      }
    }
  );

  resetPassword = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      // Get user by token
      const hashedToken = crypto
        .createHash('sha256')
        .update(req.params.token)
        .digest('hex');

      const user = await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gt: Date.now() },
      });

      // Check if token expired
      if (!user) {
        return next(new AppError('Token is invalid or has expired', 400));
      }
      user.password = req.body.password;
      user.passwordConfirm = req.body.passwordConfirm;
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;

      await user.save();

      // Update user.changedPasswordAt

      // Automatically log in user (send JWT)
      createAndSendToken(user, 200, res);
    }
  );
}

export default new AuthController();
