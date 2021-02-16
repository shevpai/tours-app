import { Router } from 'express';
import { aliasTopTours } from '../middleware/aliasTopTours';
import { protectRout } from '../middleware/protectRout';
import { restrictTo } from '../middleware/restrictTo';
import { reviewRouter } from './reviewRouter';
import tourController from '../controllers/tourController';
import { uploadTourPhotos } from '../middleware/uploadTourPhotos';
import { resizeTourPhotos } from '../middleware/resizeTourPhotos';

export const toursRouter = Router();

// Param middleware
// toursRouter.param('id', checkTourID);

// Nested routes
// toursRouter
//   .route('/:tourId/reviews')
//   .post(protectRout, restrictTo('user'), reviewController.createReview);

toursRouter.use('/:tourId/reviews', reviewRouter);

// Top 5 cheap alias
toursRouter.get('/top-5-best-tours', aliasTopTours, tourController.getAllTours);

// Tours stats
toursRouter.get('/tours-stats', tourController.getTourStats);
toursRouter.get(
  '/monthly-plan/:year',
  protectRout,
  restrictTo('admin', 'lead-guide', 'guide'),
  tourController.getMonthlyPlan
);

// Get all tours in defined area
toursRouter.get(
  '/tours-within/:distance/center/:latlng/unit/:unit',
  tourController.getToursWithin
);

// Get distance to each tour from defined coordinates
toursRouter.get(
  '/distances/:latlng/unit/:unit',
  tourController.getToursDistances
);

// Routs
toursRouter.get('/', tourController.getAllTours);
toursRouter.get('/:id', tourController.getTour);

toursRouter.patch(
  '/:id',
  protectRout,
  restrictTo('admin', 'lead-guide'),
  uploadTourPhotos,
  resizeTourPhotos,
  tourController.updateTour
);
toursRouter.delete(
  '/:id',
  protectRout,
  restrictTo('admin', 'lead-guide'),
  tourController.deleteTour
);
toursRouter.post(
  '/',
  protectRout,
  restrictTo('admin', 'lead-guide'),
  tourController.addTour
);
