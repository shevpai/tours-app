import { NextFunction, Response, Request } from 'express';
import { catchAsync } from '../utils/catchAsync';

const path = require('path');
const sharp = require('sharp');

interface MulterRequest extends Request {
  files: any;
}

export const resizeTourPhotos = catchAsync(
  async (req: MulterRequest, res: Response, next: NextFunction) => {
    if (!req.files.imageCover || !req.files.images) return next();

    // resize && save -> Cover Image
    const imageCoverFilename = `tour-${req.params.id}-${Date.now()}-cover.jpeg`;

    await sharp(req.files.imageCover[0].buffer)
      .resize(2000, 1333)
      .toFormat('jpeg')
      .jpeg({ quality: 90 })
      .toFile(
        path.join(__dirname, '..', '..', 'public', 'img', 'tours') +
          `/${imageCoverFilename}`
      );

    // To update image path in updateTour mw
    req.body.imageCover = imageCoverFilename;
    // Push filename in each iteration
    req.body.images = [];

    // resize && save -> images
    await Promise.all(
      req.files.images.map(async (file: Express.Multer.File, i: number) => {
        const filename = `tour-${req.params.id}-${Date.now()}-${i + 1}.jpeg`;

        await sharp(file.buffer)
          .resize(2000, 1333)
          .toFormat('jpeg')
          .jpeg({ quality: 90 })
          .toFile(
            path.join(__dirname, '..', '..', 'public', 'img', 'tours') +
              `/${filename}`
          );

        req.body.images.push(filename);
      })
    );

    next();
  }
);
