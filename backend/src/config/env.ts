import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '4000', 10),
  databaseUrl: process.env.DATABASE_URL || '',
  mediaRootPath: process.env.MEDIA_ROOT_PATH || path.resolve(process.cwd(), '../midias'),
  corsOrigin: process.env.CORS_ORIGIN || '*'
};

