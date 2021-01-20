import authController from '../controllers/authController';
import userController from '../controllers/userController';
import { protectRout } from '../middleware/protectRout';

const { Router } = require('express');

export const userRouter = Router();

userRouter.post('/signup', authController.signup);
userRouter.post('/login', authController.login);

userRouter.post('/forgot-password', authController.forgotPassword);
userRouter.patch('/reset-password/:token', authController.resetPassword);

userRouter.patch(
  '/update-my-password',
  protectRout,
  authController.updateUserPassword
);

userRouter.patch('/update-me', protectRout, userController.selfUpdate);

userRouter.get('/', userController.getAllUsers);
