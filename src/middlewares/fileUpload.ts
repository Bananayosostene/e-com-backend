import { NextFunction, Request, Response } from 'express';
import multer, { FileFilterCallback } from 'multer';
import cloudinaryUpload from '../utils/cloudinary';

export const storage = multer.memoryStorage();

export const imageFilter = (files: Express.Multer.File, cb: FileFilterCallback) => {
    if (files.mimetype.startsWith('image')) {
      cb(null, true);
    } else {
      cb(null, false);
    }
  };

export const upload = multer({
    storage,
    dest: 'uploads/',
    fileFilter: (
      req: Request,
      file: Express.Multer.File,
      cb: FileFilterCallback
    ) => {
      imageFilter(file, cb);
    },
  });

export const singleFileUpload = async (req: Request, res: Response, next: NextFunction) => {
    upload.single('image')(req, res, async err => {
      if (err) {
        return res
          .status(500)
          .send({ data: [], message: 'Server error', error: err.message });
      }
  
      try {
        if (req.file) {
          const image = req.file as Express.Multer.File;
          const { buffer, originalname } = image;
          const Url = await cloudinaryUpload(buffer, originalname);
          req.body.profileImageUrl = Url;
        }
        return next();
      } catch (uploadError) {
        return res.status(500).send({
          data: [],
          message: 'Upload failed',
        });
      }
    });
  };
