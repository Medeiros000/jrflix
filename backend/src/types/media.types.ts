import { MediaType, Media } from '@prisma/client';

export type { MediaType, Media };

export interface StreamRangeInfo {
  start: number;
  end: number;
  chunkSize: number;
  totalSize: number;
  mimeType: string;
}

