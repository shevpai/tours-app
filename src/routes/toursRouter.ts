import TourController from '../controllers/tourController';
import { aliasTopTours } from '../middleware/aliasTopTours';
import { checkTourID } from '../middleware/checkId';

const { Router } = require('express');

export const toursRouter = Router();

// Param middleware
toursRouter.param('id', checkTourID);

// Top 5 cheap alias
toursRouter.get('/top-5-best-tours', aliasTopTours, TourController.getAllTours);

// Tours stats
toursRouter.get('/tours-stats', TourController.getTourStats);
toursRouter.get('/monthly-plan/:year', TourController.getMonthlyPlan);

// Routs
toursRouter.get('/', TourController.getAllTours);
toursRouter.get('/:id', TourController.getTour);
toursRouter.patch('/:id', TourController.updateTour);
toursRouter.delete('/:id', TourController.deleteTour);
toursRouter.post('/', TourController.addTour);
