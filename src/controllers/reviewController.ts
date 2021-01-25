import { Request, Response } from 'express';
import { Review } from '../models/review.model';
import { catchAsync } from '../utils/catchAsync';

class ReviewController {
  getAllReviews = catchAsync(async (req: Request, res: Response) => {
    const reviews = await Review.find();

    res.status(200).json({
      status: 'success',
      results: reviews.length,
      data: {
        reviews,
      },
    });
  });

  createReview = catchAsync(async (req: Request, res: Response) => {
    const newReview = await Review.create(req.body);

    res.status(201).json({
      status: 'success',
      data: {
        review: newReview,
      },
    });
  });
}

export default new ReviewController();
