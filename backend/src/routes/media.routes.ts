import { Router } from 'express';
import { MediaRepository } from '../repositories/MediaRepository';
import { MediaService } from '../services/MediaService';
import { MediaController } from '../controllers/MediaController';

const mediaRouter = Router();
const episodeRouter = Router();

const mediaRepository = new MediaRepository();
const mediaService = new MediaService(mediaRepository);
const mediaController = new MediaController(mediaService);

// Media routes
mediaRouter.get('/', mediaController.getCatalog);
mediaRouter.post('/', mediaController.createMedia);
mediaRouter.get('/:id/stream', mediaController.streamMedia);
mediaRouter.get('/:seriesId/episodes', mediaController.getEpisodes);

// Episode routes (mounted separately at /api/episodes)
episodeRouter.get('/:episodeId/stream', mediaController.streamEpisode);

export { mediaRouter, episodeRouter };
