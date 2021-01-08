import UserController from '../controllers/userController';

const { Router } = require('express');

export const userRouter = Router();

userRouter.get('/', UserController.getAllUsers);
