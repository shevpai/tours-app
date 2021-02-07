import { Schema, Document, model, Query, Aggregate } from 'mongoose';
import { IUser } from './user.model';

const slugify = require('slugify');

interface location extends Document {
  coordinates: number[];
  descriptions: string;
  address: string;
  day: number;
}

export interface ITour extends Document {
  name: string;
  slug: string;
  rating: number;
  price: number;
  duration: number;
  maxGroupSize: number;
  difficulty: string;
  ratingsAverage: number;
  ratingsQuantity: number;
  summary: string;
  description: string;
  imageCover: string;
  images: string[];
  createdAt: Date;
  startDates: Date[];
  guides: IUser[];
  startLocation: location;
  locations: location[];
}

const tourSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name'],
      unique: true,
      trim: true,
      maxlength: [40, 'A tour name must have less or equal then 40 characters'],
      minlength: [10, 'A tour name must have more or equal then 10 characters'],
      validate: [
        (val: string) => /^[a-zA-Z\s]*$/.test(val),
        'Tour name must only contain characters',
      ],
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, 'A tour must have a duration'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have a group size'],
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have a difficulty'],
      enum: {
        // Work only for string values
        values: ['easy', 'medium', 'difficult'],
        message: 'Difficulty is either: easy, medium, difficult',
      },
    },
    ratingsAverage: {
      type: Number,
      default: '4.5',
      min: [1, 'Rating must be above 1.0'],
      max: [5, 'Rating must be below 5.0'],
      // run each time when we update field
      set: (val: number) => Math.round(val * 10) / 10,
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, 'A tour must have a price'],
    },
    priceDiscount: {
      type: Number,
      validate: {
        // Only for create new DoC
        validator: function (this: ITour, val: number) {
          return val < this.price;
        },
        message: 'Discount price ({VALUE}) should be below regular price',
      },
    },
    summary: {
      type: String,
      trim: true,
      required: [true, 'A tour must have a description'],
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, 'A tour must have a cover image'],
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false,
    },
    startLocation: {
      // GeoJSON
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
      },
      coordinates: [Number],
      address: String,
      description: String,
    },
    locations: [
      {
        type: {
          type: String,
          dafault: 'Point',
          enum: ['Point'],
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number,
      },
    ],
    guides: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

tourSchema.index({ price: 1, ratingsAverage: -1 });
tourSchema.index({ slug: 1 });

// Implementing virtual props
tourSchema.virtual('durationWeeks').get(function (this: ITour) {
  return (this.duration / 7).toFixed(2);
});

// Virtual populate
tourSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'tour',
  localField: '_id',
});

// Middlewares

// DOC MIDDLEWARE: bef .save() and create()
tourSchema.pre<ITour>('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

// tourSchema.post<ITour>('save', function (doc) {
//   console.log(doc);
// });

// Embedding guides(users) into Tours (--JUST FOR EXAMPLE)
// tourSchema.pre<ITour>('save', async function (next) {
//   const guidesPromises = this.guides.map(async (id) => await User.findById(id));
//   this.guides = await Promise.all(guidesPromises);
//   next();
// });

// QUERY MIDDLEWARE

// remove secret tours
tourSchema.pre<Query<ITour, ITour, any>>(/^find/, function () {
  this.find({ secretTour: { $ne: true } });
});

// populate guides
tourSchema.pre<Query<ITour, ITour, any>>(/^find/, function () {
  this.populate({
    path: 'guides',
    select: '-__v -passwordChangedAt',
  });
});

// AGGREGATION MIDDLEWARE
tourSchema.pre<Aggregate<ITour>>('aggregate', function () {
  this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
});

export const Tour = model<ITour>('Tour', tourSchema);

// for load/delete data script outside the module
// module.exports = Tour;
