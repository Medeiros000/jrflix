import { useState, useEffect, useCallback } from 'react';
import { Media } from '../types/media';
import { MediaService } from '../services/mediaService';

interface UseMediaCatalogReturn {
  medias: Media[];
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useMediaCatalog(): UseMediaCatalogReturn {
  const [medias, setMedias] = useState<Media[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCatalog = useCallback(async (): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await MediaService.getCatalog();
      setMedias(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido ao buscar mídias');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCatalog();
  }, [fetchCatalog]);

  return { medias, isLoading, error, refresh: fetchCatalog };
}

