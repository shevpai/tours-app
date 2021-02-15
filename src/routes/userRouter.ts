import { Router } from 'express';
import { protectRout } from '../middleware/protectRout';
import authController from '../controllers/authController';
import userController from '../controllers/userController';
import { restrictTo } from '../middleware/restrictTo';
import { addUserIdParam } from '../middleware/addUserIdParam';
import { uploadUserPhoto } from '../middleware/uploadUserPhoto';
import { resizeUserPhoto } from '../middleware/resizeUserPhoto';

export const userRouter = Router();

// sign up & log in
userRouter.post('/signup', authController.signup);
userRouter.post('/login', authController.login);
userRouter.get('/logout', authController.logout);

// reset password
userRouter.post('/forgot-password', authController.forgotPassword);
userRouter.patch('/reset-password/:token', authController.resetPassword);

// all routes below are protected
userRouter.use(protectRout);

userRouter.patch('/update-my-password', authController.updateUserPassword);

// GET ME endpoint
userRouter.get('/me', addUserIdParam, userController.getUser);

userRouter.patch(
  '/update-me',
  uploadUserPhoto,
  resizeUserPhoto,
  userController.selfUpdate
);
userRouter.delete('/delete-me', userController.inactivateAcc);

userRouter.use(restrictTo('admin'));

userRouter.get('/', userController.getAllUsers);
userRouter.get('/:id', userController.getUser);
userRouter.patch('/', userController.updateByAdmin);
userRouter.delete('/', userController.deleteByAdmin);
