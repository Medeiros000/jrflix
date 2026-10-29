import { Media } from '../types/media';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api';

export class MediaService {
  public static async getCatalog(): Promise<Media[]> {
    const response = await fetch(`${API_BASE_URL}/media`);
    if (!response.ok) {
      throw new Error(`Falha ao carregar catálogo: ${response.statusText}`);
    }
    return response.json();
  }

  public static getStreamUrl(mediaId: string): string {
    return `${API_BASE_URL}/media/${mediaId}/stream`;
  }
}

