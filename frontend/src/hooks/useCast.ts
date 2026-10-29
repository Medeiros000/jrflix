import { useState, useEffect, useCallback } from 'react';
import { Media } from '../types/media';

interface UseCastReturn {
  isCastAvailable: boolean;
  isConnected: boolean;
  castMedia: (media: Media, streamUrl: string, currentTime?: number) => Promise<void>;
}

export function useCast(): UseCastReturn {
  const [isCastAvailable, setIsCastAvailable] = useState<boolean>(false);
  const [isConnected, setIsConnected] = useState<boolean>(false);

  useEffect(() => {
    const initCast = (isAvailable: boolean): void => {
      if (isAvailable && window.cast && window.chrome) {
        const castContext = window.cast.framework.CastContext.getInstance();
        castContext.setOptions({
          receiverApplicationId: window.chrome.cast.media.DEFAULT_MEDIA_RECEIVER_APP_ID,
          autoJoinPolicy: window.chrome.cast.AutoJoinPolicy.ORIGIN_SCOPED
        });

        setIsCastAvailable(true);

        castContext.addEventListener(
          window.cast.framework.CastContextEventType.SESSION_STATE_CHANGED,
          (event) => {
            const isSessionActive =
              event.sessionState === window.cast?.framework.SessionState.SESSION_STARTED ||
              event.sessionState === window.cast?.framework.SessionState.SESSION_RESUMED;
            setIsConnected(Boolean(isSessionActive));
          }
        );
      }
    };

    window.__onGCastApiAvailable = (isAvailable: boolean) => {
      initCast(isAvailable);
    };

    // If script already loaded before hook mounting
    if (window.cast?.framework) {
      initCast(true);
    }
  }, []);

  const castMedia = useCallback(
    async (media: Media, streamUrl: string, currentTime = 0): Promise<void> => {
      if (!window.cast || !window.chrome) {
        throw new Error('Google Cast SDK não está disponível');
      }

      const castContext = window.cast.framework.CastContext.getInstance();
      const session = castContext.getCurrentSession();

      if (!session) {
        throw new Error('Nenhum dispositivo Chromecast conectado. Conecte pelo botão Cast.');
      }

      const mediaInfo = new window.chrome.cast.media.MediaInfo(streamUrl, 'video/mp4');
      mediaInfo.metadata = new window.chrome.cast.media.GenericMediaMetadata();
      mediaInfo.metadata.title = media.title;
      mediaInfo.metadata.subtitle = `${media.year} • ${media.type === 'MOVIE' ? 'Filme' : 'Série'}`;
      mediaInfo.metadata.images = [{ url: media.coverUrl }];
      mediaInfo.streamType = window.chrome.cast.media.StreamType.BUFFERED;

      const request = new window.chrome.cast.media.LoadRequest(mediaInfo);
      request.autoplay = true;
      request.currentTime = currentTime;

      await session.loadMedia(request);
    },
    []
  );

  return { isCastAvailable, isConnected, castMedia };
}

