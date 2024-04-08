import { diskStorage } from 'multer';

export const storageConfig = (folder: string) =>
  diskStorage({
    destination: `public/${folder}`,
    filename: (_, file, cb) => {
      cb(null, Date.now() + '-' + file.originalname);
    },
  });
