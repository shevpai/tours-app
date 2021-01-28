import { NextFunction, Request, Response } from 'express';
import { APIFeatures } from '../features/api.features';
import { AppError } from '../features/error.features';
import { Tour } from '../models/tour.model';
import { catchAsync } from '../utils/catchAsync';
import { createDoc, deleteDoc, updateDoc } from '../features/handlerFactory';

class TourController {
  getAllTours = catchAsync(async (req: Request, res: Response) => {
    const features = new APIFeatures(Tour.find(), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();

    const tours = await features.getQuery;

    res.status(200).json({
      status: 'success',
      results: tours.length,
      data: {
        tours,
      },
    });
  });

  getTour = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const tour = await Tour.findById(req.params.id).populate('reviews');

      if (!tour) {
        return next(new AppError('No tour found with that ID', 404));
      }

      res.status(200).json({
        status: 'success',
        data: {
          tour,
        },
      });
    }
  );

  addTour = createDoc(Tour);
  updateTour = updateDoc(Tour);
  deleteTour = deleteDoc(Tour);

  getTourStats = catchAsync(async (req: Request, res: Response) => {
    const stats = await Tour.aggregate([
      {
        $match: { ratingsAverage: { $gte: 4.5 } },
      },
      {
        $group: {
          _id: { $toUpper: '$difficulty' },
          numTours: { $sum: 1 },
          numRatings: { $sum: '$ratingsQuantity' },
          avgRating: { $avg: '$ratingsAverage' },
          avgPrice: { $avg: '$price' },
          minPrice: { $min: '$price' },
          maxPrice: { $max: '$price' },
        },
      },
      {
        $sort: { avgPrice: 1 },
      },
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        stats,
      },
    });
  });

  getMonthlyPlan = catchAsync(async (req: Request, res: Response) => {
    const year = +req.params.year;

    const plan = await Tour.aggregate([
      {
        $unwind: '$startDates',
      },
      {
        $match: {
          startDates: {
            $gte: new Date(`${year}-01-01`),
            $lte: new Date(`${year}-12-31`),
          },
        },
      },
      {
        $group: {
          _id: { $month: '$startDates' },
          numTourStarts: { $sum: 1 },
          tours: { $push: '$name' },
        },
      },
      {
        $addFields: { month: '$_id' },
      },
      {
        $project: {
          _id: 0,
        },
      },
      {
        $sort: { numTourStarts: -1 },
      },
      {
        $limit: 12,
      },
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        plan,
      },
    });
  });
}

export default new TourController();
