import { NextFunction, Request, Response } from 'express';
import { Model } from 'mongoose';
import { catchAsync } from '../utils/catchAsync';
import { APIFeatures } from './api.features';
import { AppError } from './error.features';

type populateOptions =
  | string
  | {
      path: string;
      match?: any;
      select?: string;
    };

export const deleteDoc = (Model: Model<any>) =>
  catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const doc = await Model.findByIdAndDelete(req.params.id);

    if (!doc) {
      return next(new AppError('No document found with that ID', 404));
    }

    res.status(204).send();
  });

export const updateDoc = (Model: Model<any>) =>
  catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!doc) {
      return next(new AppError('No document found with that ID', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        document: doc,
      },
    });
  });

export const createDoc = (Model: Model<any>) =>
  catchAsync(async (req: Request, res: Response) => {
    const newDoc = await Model.create(req.body);

    res.status(201).json({
      status: 'success',
      data: {
        document: newDoc,
      },
    });
  });

export const getDoc = (Model: Model<any>, popOptions?: populateOptions) =>
  catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    let query = Model.findById(req.params.id);
    if (popOptions) query = query.populate(popOptions);
    const doc = await query;

    if (!doc) {
      return next(new AppError('No document found with that ID', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        document: doc,
      },
    });
  });

export const getAllDocs = (Model: Model<any>) =>
  catchAsync(async (req: Request, res: Response) => {
    // For nested GET reviews on tour
    let filter = {};
    if (req.params.tourId) filter = { tour: req.params.tourId };

    const features = new APIFeatures(Model.find(filter), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();

    const documents = await features.getQuery;
    // To get query statistic
    // const documents = await features.getQuery.explain();

    res.status(200).json({
      status: 'success',
      results: documents.length,
      data: {
        documents,
      },
    });
  });
