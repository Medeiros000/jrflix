import { Media, Episode, MediaType } from '@prisma/client';
import { prisma } from '../prisma';

export interface CreateMediaData {
  title: string;
  description: string;
  type: MediaType;
  filePath: string;
  coverUrl: string;
  year: number;
  seriesSlug?: string;
}

export interface UpsertEpisodeData {
  filePath: string;
  title: string;
  episodeNumber: number;
  seasonNumber: number;
  mediaId: string;
}

export interface IMediaRepository {
  findAll(): Promise<Media[]>;
  findById(id: string): Promise<Media | null>;
  create(data: CreateMediaData): Promise<Media>;
  upsertMedia(data: CreateMediaData & { seriesSlug?: string }): Promise<Media>;
  findEpisodesByMediaId(mediaId: string): Promise<Episode[]>;
  findEpisodeById(id: string): Promise<Episode | null>;
  upsertEpisode(data: UpsertEpisodeData): Promise<Episode>;
}

export class MediaRepository implements IMediaRepository {
  public async findAll(): Promise<Media[]> {
    return prisma.media.findMany({
      orderBy: { createdAt: 'desc' }
    });
  }

  public async findById(id: string): Promise<Media | null> {
    return prisma.media.findUnique({
      where: { id }
    });
  }

  public async create(data: CreateMediaData): Promise<Media> {
    return prisma.media.create({ data });
  }

  public async upsertMedia(data: CreateMediaData): Promise<Media> {
    if (data.seriesSlug) {
      return prisma.media.upsert({
        where: { seriesSlug: data.seriesSlug },
        create: data,
        update: {
          coverUrl: data.coverUrl,
          title: data.title
        }
      });
    }

    // For movies: find by filePath, create if not found
    const existing = await prisma.media.findFirst({ where: { filePath: data.filePath } });
    if (existing) {
      return existing;
    }
    return prisma.media.create({ data });
  }

  public async findEpisodesByMediaId(mediaId: string): Promise<Episode[]> {
    return prisma.episode.findMany({
      where: { mediaId },
      orderBy: [{ seasonNumber: 'asc' }, { episodeNumber: 'asc' }]
    });
  }

  public async findEpisodeById(id: string): Promise<Episode | null> {
    return prisma.episode.findUnique({ where: { id } });
  }

  public async upsertEpisode(data: UpsertEpisodeData): Promise<Episode> {
    return prisma.episode.upsert({
      where: { filePath: data.filePath },
      create: data,
      update: {
        title: data.title,
        episodeNumber: data.episodeNumber,
        seasonNumber: data.seasonNumber
      }
    });
  }
}
