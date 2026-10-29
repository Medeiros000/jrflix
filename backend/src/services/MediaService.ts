import fs from 'fs';
import path from 'path';
import { Media } from '@prisma/client';
import { IMediaRepository } from '../repositories/MediaRepository';
import { config } from '../config/env';
import { AppError } from '../errors/AppError';
import { StreamRangeInfo } from '../types/media.types';

export class MediaService {
  constructor(private readonly mediaRepository: IMediaRepository) {}

  public async listCatalog(): Promise<Media[]> {
    const medias = await this.mediaRepository.findAll();

    return medias.map((media) => ({
      ...media,
      coverUrl: this.resolveCoverUrl(media.coverUrl)
    }));
  }

  public async getMediaStreamDetails(
    id: string,
    rangeHeader?: string
  ): Promise<{ resolvedPath: string; rangeInfo: StreamRangeInfo; stream: fs.ReadStream }> {
    const media = await this.mediaRepository.findById(id);

    if (!media) {
      throw new AppError('Mídia não encontrada', 404);
    }

    const resolvedPath = path.isAbsolute(media.filePath)
      ? media.filePath
      : path.join(config.mediaRootPath, media.filePath);

    if (!fs.existsSync(resolvedPath)) {
      throw new AppError(`Arquivo de vídeo não encontrado no caminho: ${media.filePath}`, 404);
    }

    const stat = fs.statSync(resolvedPath);
    const totalSize = stat.size;

    if (totalSize === 0) {
      throw new AppError('O arquivo de vídeo está vazio', 400);
    }

    const mimeType = this.resolveMimeType(resolvedPath);

    // Default chunk size if end is not specified (1MB chunk)
    const defaultChunkSize = 1024 * 1024;

    let start = 0;
    let end = totalSize - 1;

    if (rangeHeader) {
      const parts = rangeHeader.replace(/bytes=/, '').split('-');
      start = parseInt(parts[0], 10);
      const parsedEnd = parts[1] ? parseInt(parts[1], 10) : NaN;

      if (isNaN(start) || start >= totalSize || start < 0) {
        throw new AppError('Faixa de bytes requisitada (Range) não satisfatível', 416);
      }

      if (!isNaN(parsedEnd)) {
        end = Math.min(parsedEnd, totalSize - 1);
      } else {
        end = Math.min(start + defaultChunkSize, totalSize - 1);
      }
    } else {
      // If no Range header is provided, serve first chunk to encourage Range requests from clients
      end = Math.min(defaultChunkSize, totalSize - 1);
    }

    const chunkSize = end - start + 1;
    const stream = fs.createReadStream(resolvedPath, { start, end });

    return {
      resolvedPath,
      rangeInfo: {
        start,
        end,
        chunkSize,
        totalSize,
        mimeType
      },
      stream
    };
  }

  private resolveMimeType(filePath: string): string {
    const ext = path.extname(filePath).toLowerCase();
    switch (ext) {
      case '.mp4':
        return 'video/mp4';
      case '.mkv':
        return 'video/x-matroska';
      case '.webm':
        return 'video/webm';
      case '.mov':
        return 'video/quicktime';
      case '.avi':
        return 'video/x-msvideo';
      default:
        return 'video/mp4';
    }
  }

  private resolveCoverUrl(coverFileName: string): string {
    if (/^https?:\/\//i.test(coverFileName) || coverFileName.startsWith('data:')) {
      return coverFileName;
    }

    const resolvedPath = this.resolveMediaPath(coverFileName);

    if (!fs.existsSync(resolvedPath)) {
      throw new AppError(`Arquivo de capa não encontrado: ${coverFileName}`, 404);
    }

    if (!fs.statSync(resolvedPath).isFile()) {
      throw new AppError(`O caminho da capa não é um arquivo: ${coverFileName}`, 400);
    }

    const mimeType = this.resolveImageMimeType(resolvedPath);
    const imageBase64 = fs.readFileSync(resolvedPath).toString('base64');

    return `data:${mimeType};base64,${imageBase64}`;
  }

  private resolveMediaPath(fileName: string): string {
    const mediaRoot = path.resolve(config.mediaRootPath);
    const resolvedPath = path.resolve(mediaRoot, fileName);
    const relativePath = path.relative(mediaRoot, resolvedPath);

    if (relativePath.startsWith('..') || path.isAbsolute(relativePath)) {
      throw new AppError(`Caminho de mídia inválido: ${fileName}`, 400);
    }

    return resolvedPath;
  }

  private resolveImageMimeType(filePath: string): string {
    const ext = path.extname(filePath).toLowerCase();
    switch (ext) {
      case '.jpg':
      case '.jpeg':
        return 'image/jpeg';
      case '.png':
        return 'image/png';
      case '.webp':
        return 'image/webp';
      case '.gif':
        return 'image/gif';
      case '.svg':
        return 'image/svg+xml';
      default:
        throw new AppError(`Formato de imagem de capa não suportado: ${ext || 'desconhecido'}`, 400);
    }
  }
}
