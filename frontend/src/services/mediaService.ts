import { Media } from '../types/media';

// Use the frontend host by default so phones on the same network do not try
// to reach their own localhost. The dev server and nginx proxy both forward
// /api to the backend.
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export class MediaService {
  public static async getCatalog(): Promise<Media[]> {
    const response = await fetch(`${API_BASE_URL}/media`);

    if (!response.ok) {
      throw new Error(`Falha ao carregar catálogo: ${response.statusText}`);
    }

    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      throw new Error(
        'O servidor retornou uma página HTML em vez do catálogo. ' +
        'Reconstrua os containers com "docker compose up -d --build".'
      );
    }

    return response.json() as Promise<Media[]>;
  }

  public static getStreamUrl(mediaId: string): string {
    return `${API_BASE_URL}/media/${mediaId}/stream`;
  }
}
