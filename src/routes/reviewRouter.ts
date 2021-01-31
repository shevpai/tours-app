import { Router } from 'express';
import reviewController from '../controllers/reviewController';
import { protectRout } from '../middleware/protectRout';
import { restrictTo } from '../middleware/restrictTo';
import { setBodyForNestedReviews } from '../middleware/setBodyForNestedReviews';

export const reviewRouter = Router({ mergeParams: true });

reviewRouter.get('/', reviewController.getAllReviews);
reviewRouter.get('/:id', reviewController.getReview);

reviewRouter.use(protectRout);

reviewRouter.post(
  '/',
  restrictTo('user'),
  setBodyForNestedReviews,
  reviewController.createReview
);

reviewRouter.patch(
  '/:id',
  restrictTo('user', 'admin'),
  reviewController.updateReview
);

reviewRouter.delete(
  '/:id',
  restrictTo('user', 'admin'),
  reviewController.deleteReview
);
