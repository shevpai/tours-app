import { NextFunction, Response } from 'express';
import { extndRequest } from '../utils/catchAsync';

const path = require('path');
const sharp = require('sharp');

export function resizeUserPhoto(
  req: extndRequest,
  res: Response,
  next: NextFunction
) {
  if (!req.file) return next();

  // Specify filename manualy for req.file, because we get our file from memory buffer
  req.file.filename = `user-${req.user!.id}-${Date.now()}.jpeg`;

  // crop image to squre [500px, 500px] -> format to jpeg (down to 90% quality) -> save
  sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(
      path.join(__dirname, '..', '..', 'public', 'img', 'users') +
        `/${req.file.filename}`
    );

  next();
}
