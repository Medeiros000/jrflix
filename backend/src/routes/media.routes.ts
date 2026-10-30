import { Router } from 'express';
import { MediaRepository } from '../repositories/MediaRepository';
import { MediaService } from '../services/MediaService';
import { MediaController } from '../controllers/MediaController';

const mediaRouter = Router();

const mediaRepository = new MediaRepository();
const mediaService = new MediaService(mediaRepository);
const mediaController = new MediaController(mediaService);

mediaRouter.get('/', mediaController.getCatalog);
mediaRouter.post('/', mediaController.createMedia);
mediaRouter.get('/:id/stream', mediaController.streamMedia);

export { mediaRouter };
