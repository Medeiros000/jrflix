import { Request, Response, NextFunction } from 'express';
import { MediaService } from '../services/MediaService';

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
}

