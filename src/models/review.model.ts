import { Schema, Document, model, Query } from 'mongoose';

interface IReview extends Document {
  review: string;
  ratting: number;
  createdAt: Date;
}

const reviewSchema = new Schema(
  {
    review: {
      type: String,
      require: [true, 'Review can not be empty'],
    },
    ratting: {
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

export const Review = model<IReview>('Review', reviewSchema);

// for load/delete data script outside the module
// module.exports = Review;
