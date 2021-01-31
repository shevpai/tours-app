import {
  createDoc,
  deleteDoc,
  getAllDocs,
  getDoc,
  updateDoc,
} from '../features/handlerFactory';
import { Review } from '../models/review.model';

class ReviewController {
  getAllReviews = getAllDocs(Review);
  getReview = getDoc(Review);
  createReview = createDoc(Review);
  updateReview = updateDoc(Review);
  deleteReview = deleteDoc(Review);
}

export default new ReviewController();
