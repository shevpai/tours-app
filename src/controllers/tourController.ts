import { NextFunction, Request, Response } from 'express';
import { Tour } from '../models/tour.model';
import { catchAsync } from '../utils/catchAsync';
import {
  createDoc,
  deleteDoc,
  getAllDocs,
  getDoc,
  updateDoc,
} from '../features/handlerFactory';
import { AppError } from '../features/error.features';

class TourController {
  getAllTours = getAllDocs(Tour);
  getTour = getDoc(Tour, { path: 'reviews' });
  addTour = createDoc(Tour);
  updateTour = updateDoc(Tour);
  deleteTour = deleteDoc(Tour);

  // url='/tours-within/:distance/center/:latlng/unit/:unit'
  getToursWithin = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const { distance, latlng, unit } = req.params;
      const [lat, lng] = latlng.split(',');

      const radius = unit === 'mi' ? +distance / 3963.2 : +distance / 6378.1;

      if (!lat || !lng) {
        return next(
          new AppError(
            'Please provide latitude and longtitude in the format "lat,lng"',
            400
          )
        );
      }

      const tours = await Tour.find({
        startLocation: {
          $geoWithin: {
            $centerSphere: [[lng, lat], radius],
          },
        },
      });

      res.status(200).json({
        status: 'success',
        results: tours.length,
        data: {
          tours,
        },
      });
    }
  );

  // url='/distances/:latlng/unit/:unit'
  getToursDistances = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const { latlng, unit } = req.params;
      const [lat, lng] = latlng.split(',');

      const multiplier = unit === 'mi' ? 0.000621371 : 0.001;

      if (!lat || !lng) {
        return next(
          new AppError(
            'Please provide latitude and longtitude in the format "lat,lng"',
            400
          )
        );
      }

      const distances = await Tour.aggregate([
        {
          $geoNear: {
            near: { type: 'Point', coordinates: [+lng, +lat] },
            distanceField: 'distance',
            // convert in kilometers
            distanceMultiplier: multiplier,
          },
        },
        {
          $project: {
            distance: 1,
            name: 1,
          },
        },
      ]);

      res.status(200).json({
        status: 'success',
        data: {
          distances,
        },
      });
    }
  );

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
