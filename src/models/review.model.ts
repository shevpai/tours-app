import { Schema, Document, model, Query, Model, Types } from 'mongoose';
import { Tour } from './tour.model';

interface IReview extends Document {
  review: string;
  rating: number;
  createdAt: Date;
  tour: string;
  user: string;
}

// static methods declare in model not in document interface
interface IReviewModel extends Model<IReview> {
  calcAverageRatings(tourId: string): Promise<any[]>;
}

const reviewSchema = new Schema(
  {
    review: {
      type: String,
      require: [true, 'Review can not be empty'],
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    tour: {
      type: Schema.Types.ObjectId,
      ref: 'Tour',
      required: [true, 'Review must belong to a tour'],
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Review must belong to a user'],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// populate user & tour data
reviewSchema.pre<Query<IReview, IReview, any>>(/^find/, function () {
  this.populate({
    path: 'user',
    select: 'name photo',
  });
});

// Similar to static class methods (Reviews.method)
reviewSchema.statics.calcAverageRatings = async function (tourId: string) {
  const stats = await this.aggregate([
    {
      $match: { tour: new Types.ObjectId(tourId) },
    },
    {
      $group: {
        _id: 'tour',
        numRatings: { $sum: 1 },
        avgRating: { $avg: '$rating' },
      },
    },
  ]);

  // Update current tour
  if (stats.length) {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: stats[0]['numRatings'],
      ratingsAverage: stats[0]['avgRating'].toFixed(1),
    });
  } else {
    // Back to default values
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: 0,
      ratingsAverage: 4.5,
    });
  }
};

reviewSchema.post<IReview>('save', async function () {
  await model<IReview, IReviewModel>('Review').calcAverageRatings(this.tour);
});

// reviewSchema.pre<Query<IReview, IReview, any>>(
//   /^findOneAnd/,
//   async function () {
//     // To get access to document in query middleware (execute query)
//     const r = await this.findOne();
//   }
// );

// To update rating on updating review
reviewSchema.post<IReview>(/^findOneAnd/, async function (doc) {
  await model<IReview, IReviewModel>('Review').calcAverageRatings(doc.tour);
});

export const Review = model<IReview, IReviewModel>('Review', reviewSchema);

// for load/delete data script outside the module
// module.exports = Review;
