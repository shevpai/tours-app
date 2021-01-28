import { Router } from 'express';
import reviewController from '../controllers/reviewController';
import { protectRout } from '../middleware/protectRout';
import { restrictTo } from '../middleware/restrictTo';
import { setParamsForNestedReviews } from '../middleware/setParamsForNestedReviews';

export const reviewRouter = Router({ mergeParams: true });

reviewRouter.get('/', reviewController.getAllReviews);
reviewRouter.post(
  '/',
  protectRout,
  restrictTo('user'),
  setParamsForNestedReviews,
  reviewController.createReview
);

reviewRouter.patch('/:id', protectRout, reviewController.updateReview);
reviewRouter.delete('/:id', protectRout, reviewController.deleteReview);
