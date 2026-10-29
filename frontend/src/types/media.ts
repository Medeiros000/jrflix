export type MediaType = 'MOVIE' | 'SERIES';

export interface Media {
  id: string;
  title: string;
  description: string;
  type: MediaType;
  filePath: string;
  coverUrl: string;
  year: number;
  createdAt: string;
  updatedAt: string;
}

// Google Cast SDK Type declarations (avoids 'any')
declare global {
  interface Window {
    __onGCastApiAvailable?: (isAvailable: boolean) => void;
    cast?: {
      framework: {
        CastContext: {
          getInstance: () => {
            setOptions: (options: { receiverApplicationId: string; autoJoinPolicy: string }) => void;
            getCurrentSession: () => CastSession | null;
            addEventListener: (type: string, listener: (event: CastStateEvent) => void) => void;
          };
        };
        CastContextEventType: {
          CAST_STATE_CHANGED: string;
          SESSION_STATE_CHANGED: string;
        };
        CastState: {
          NO_DEVICES_AVAILABLE: string;
          NOT_CONNECTED: string;
          CONNECTING: string;
          CONNECTED: string;
        };
        SessionState: {
          SESSION_STARTED: string;
          SESSION_RESUMED: string;
          SESSION_ENDED: string;
        };
      };
    };
    chrome?: {
      cast: {
        AutoJoinPolicy: {
          ORIGIN_SCOPED: string;
          TAB_AND_ORIGIN_SCOPED: string;
          PAGE_SCOPED: string;
        };
        media: {
          DEFAULT_MEDIA_RECEIVER_APP_ID: string;
          MediaInfo: new (contentId: string, contentType: string) => CastMediaInfo;
          GenericMediaMetadata: new () => CastGenericMetadata;
          StreamType: {
            BUFFERED: string;
            LIVE: string;
          };
          LoadRequest: new (mediaInfo: CastMediaInfo) => CastLoadRequest;
        };
      };
    };
  }
}

export interface CastGenericMetadata {
  title?: string;
  subtitle?: string;
  images?: Array<{ url: string }>;
}

export interface CastMediaInfo {
  metadata?: CastGenericMetadata;
  streamType?: string;
}

export interface CastLoadRequest {
  autoplay?: boolean;
  currentTime?: number;
}

export interface CastSession {
  loadMedia: (request: CastLoadRequest) => Promise<void>;
  getMediaSession: () => unknown;
}

export interface CastStateEvent {
  castState?: string;
  sessionState?: string;
}

