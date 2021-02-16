import { AppError } from '../features/error.features';
import { extndRequest } from '../utils/catchAsync';

type MulterCb = (error: Error | null, destination: string | boolean) => void;

// For uploading files
const multer = require('multer');

// To store file in memory (for next -> resize mw)
const multerStorage = multer.memoryStorage();

// Filter by file type
const multerFilter = (
  req: extndRequest,
  file: Express.Multer.File,
  cb: MulterCb
) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an image! File type must be image.', 400), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

// Multiple upload using multer
export const uploadTourPhotos = upload.fields([
  { name: 'imageCover', maxCount: 1 },
  { name: 'images', maxCount: 3 },
]);

// second arg = maxCount
// upload.array('images', 3)
