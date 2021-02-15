import { AppError } from '../features/error.features';
import { extndRequest } from '../utils/catchAsync';

type MulterCb = (error: Error | null, destination: string | boolean) => void;

// For uploading files
const path = require('path');
const multer = require('multer');

// Storage settings
const multerStorage = multer.diskStorage({
  destination: (req: extndRequest, file: Express.Multer.File, cb: MulterCb) => {
    cb(null, path.join(__dirname, '..', '..', 'public', 'img', 'users'));
  },
  filename: (req: extndRequest, file: Express.Multer.File, cb: MulterCb) => {
    const ext = file.mimetype.split('/')[1];
    cb(null, `user-${req.user!.id}-${Date.now()}.${ext}`);
  },
});

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

export const uploadUserPhoto = upload.single('photo');
