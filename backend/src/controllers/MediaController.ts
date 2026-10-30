import { Request, Response, NextFunction } from 'express';
import { MediaService } from '../services/MediaService';
import { MediaType } from '@prisma/client';

export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  public getCatalog = async (
    _req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const catalog = await this.mediaService.listCatalog();
      res.status(200).json(catalog);
    } catch (error) {
      next(error);
    }
  };

  public streamMedia = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const range = req.headers.range;

      const { rangeInfo, stream } = await this.mediaService.getMediaStreamDetails(id, range);

      const headers: Record<string, string | number> = {
        'Content-Range': `bytes ${rangeInfo.start}-${rangeInfo.end}/${rangeInfo.totalSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': rangeInfo.chunkSize,
        'Content-Type': rangeInfo.mimeType
      };

      res.writeHead(206, headers);
      stream.pipe(res);
    } catch (error) {
      next(error);
    }
  };

  public createMedia = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const year = Number(req.body.year);

      if (!req.body.videoFileName || !req.body.coverFileName) {
        res.status(400).json({ status: 'error', message: 'Os nomes do vídeo e da capa são obrigatórios' });
        return;
      }

      if (!req.body.title || !req.body.description || !Object.values(MediaType).includes(req.body.type)) {
        res.status(400).json({ status: 'error', message: 'Título, resumo e tipo são obrigatórios' });
        return;
      }

      if (!Number.isInteger(year) || year < 1888 || year > new Date().getFullYear() + 1) {
        res.status(400).json({ status: 'error', message: 'Ano inválido' });
        return;
      }

      const media = await this.mediaService.createMedia({
        title: req.body.title.trim(),
        description: req.body.description.trim(),
        type: req.body.type,
        year,
        videoFileName: req.body.videoFileName,
        coverFileName: req.body.coverFileName
      });

      res.status(201).json(media);
    } catch (error) {
      next(error);
    }
  };

  public getEpisodes = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { seriesId } = req.params;
      const episodes = await this.mediaService.getEpisodesByMediaId(seriesId);
      res.status(200).json(episodes);
    } catch (error) {
      next(error);
    }
  };

  public streamEpisode = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { episodeId } = req.params;
      const range = req.headers.range;

      const { rangeInfo, stream } = await this.mediaService.getEpisodeStreamDetails(episodeId, range);

      const headers: Record<string, string | number> = {
        'Content-Range': `bytes ${rangeInfo.start}-${rangeInfo.end}/${rangeInfo.totalSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': rangeInfo.chunkSize,
        'Content-Type': rangeInfo.mimeType
      };

      res.writeHead(206, headers);
      stream.pipe(res);
    } catch (error) {
      next(error);
    }
  };
}
