import { Router } from 'express';
import { protectRout } from '../middleware/protectRout';
import authController from '../controllers/authController';
import userController from '../controllers/userController';

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
userRouter.delete('/delete-me', protectRout, userController.inactivateAcc);

userRouter.get('/', userController.getAllUsers);
