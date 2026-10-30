import { Media } from '@prisma/client';
import { prisma } from '../prisma';

export interface IMediaRepository {
  findAll(): Promise<Media[]>;
  findById(id: string): Promise<Media | null>;
  create(data: {
    title: string;
    description: string;
    type: Media['type'];
    filePath: string;
    coverUrl: string;
    year: number;
  }): Promise<Media>;
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

  public async create(data: {
    title: string;
    description: string;
    type: Media['type'];
    filePath: string;
    coverUrl: string;
    year: number;
  }): Promise<Media> {
    return prisma.media.create({ data });
  }
}
