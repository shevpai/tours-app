import { Router } from 'express';
import reviewController from '../controllers/reviewController';
import { protectRout } from '../middleware/protectRout';
import { restrictTo } from '../middleware/restrictTo';

export const reviewRouter = Router();

reviewRouter.get('/', reviewController.getAllReviews);
reviewRouter.post(
  '/',
  protectRout,
  restrictTo('user'),
  reviewController.createReview
);
