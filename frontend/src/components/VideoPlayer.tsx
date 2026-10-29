import React, { useRef, useState } from 'react';
import { Cast, ArrowLeft, AlertCircle } from 'lucide-react';
import { Media } from '../types/media';
import { MediaService } from '../services/mediaService';
import { useCast } from '../hooks/useCast';

interface VideoPlayerProps {
  media: Media;
  onClose: () => void;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ media, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamUrl = MediaService.getStreamUrl(media.id);
  const { isCastAvailable, isConnected, castMedia } = useCast();
  const [castMessage, setCastMessage] = useState<string | null>(null);

  const handleStartCast = async (): Promise<void> => {
    try {
      setCastMessage(null);
      const currentTime = videoRef.current?.currentTime || 0;
      await castMedia(media, streamUrl, currentTime);
      setCastMessage('Transmitindo para Chromecast!');
      if (videoRef.current) {
        videoRef.current.pause();
      }
    } catch (err) {
      setCastMessage(err instanceof Error ? err.message : 'Falha ao iniciar transmissão Cast');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col justify-between">
      {/* Top Overlay Bar */}
      <div className="absolute top-0 inset-x-0 p-4 bg-gradient-to-b from-black/90 to-transparent flex items-center justify-between z-10 transition opacity-90 hover:opacity-100">
        <button
          onClick={onClose}
          className="flex items-center gap-2 text-white hover:text-red-500 transition px-3 py-2 rounded-lg bg-black/40 backdrop-blur-sm"
        >
          <ArrowLeft className="w-6 h-6" />
          <span className="font-semibold text-sm">Voltar ao Catálogo</span>
        </button>

        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <h2 className="text-white font-bold text-sm">{media.title}</h2>
            <span className="text-xs text-gray-400">{media.year} • {media.type === 'MOVIE' ? 'Filme' : 'Série'}</span>
          </div>

          {/* Cast Trigger */}
          <button
            onClick={handleStartCast}
            title={isCastAvailable ? 'Transmitir para Chromecast' : 'Cast não detectado na rede'}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg border backdrop-blur-sm transition ${
              isConnected
                ? 'bg-blue-600 border-blue-400 text-white'
                : 'bg-black/50 border-neutral-700 text-gray-200 hover:bg-neutral-800'
            }`}
          >
            <Cast className={`w-5 h-5 ${isConnected ? 'animate-pulse' : ''}`} />
            <span className="text-xs font-semibold">
              {isConnected ? 'Transmitindo' : 'Chromecast'}
            </span>
          </button>
        </div>
      </div>

      {castMessage && (
        <div className="absolute top-20 left-1/2 transform -translate-x-1/2 z-20 bg-neutral-900 border border-neutral-700 text-white text-xs px-4 py-2 rounded-full shadow-lg flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-amber-400" />
          <span>{castMessage}</span>
        </div>
      )}

      {/* Video Tag with full HTTP range support */}
      <div className="relative w-full h-full flex items-center justify-center bg-black">
        <video
          ref={videoRef}
          src={streamUrl}
          controls
          autoPlay
          preload="metadata"
          className="w-full h-full max-h-screen object-contain"
        >
          Seu navegador não suporta reprodução de vídeo HTML5.
        </video>
      </div>
    </div>
  );
};

