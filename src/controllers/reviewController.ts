import { Request, Response } from 'express';
import { createDoc, deleteDoc, updateDoc } from '../features/handlerFactory';
import { Review } from '../models/review.model';
import { catchAsync, extndRequest } from '../utils/catchAsync';

class ReviewController {
  getAllReviews = catchAsync(async (req: Request, res: Response) => {
    let filter = {};

    if (req.params.tourId) filter = { tour: req.params.tourId };

    const reviews = await Review.find(filter);

    res.status(200).json({
      status: 'success',
      results: reviews.length,
      data: {
        reviews,
      },
    });
  });

  createReview = createDoc(Review);
  updateReview = updateDoc(Review);
  deleteReview = deleteDoc(Review);
}

export default new ReviewController();
