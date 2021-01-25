import { Router } from 'express';
import { aliasTopTours } from '../middleware/aliasTopTours';
import { protectRout } from '../middleware/protectRout';
import { restrictTo } from '../middleware/restrictTo';
import tourController from '../controllers/tourController';

export const toursRouter = Router();

// Param middleware
// toursRouter.param('id', checkTourID);

// Top 5 cheap alias
toursRouter.get('/top-5-best-tours', aliasTopTours, tourController.getAllTours);

// Tours stats
toursRouter.get('/tours-stats', tourController.getTourStats);
toursRouter.get('/monthly-plan/:year', tourController.getMonthlyPlan);

// Routs
toursRouter.get('/', protectRout, tourController.getAllTours);
toursRouter.get('/:id', tourController.getTour);
toursRouter.patch('/:id', tourController.updateTour);
toursRouter.delete(
  '/:id',
  protectRout,
  restrictTo('admin', 'lead-guide'),
  tourController.deleteTour
);
toursRouter.post('/', tourController.addTour);
