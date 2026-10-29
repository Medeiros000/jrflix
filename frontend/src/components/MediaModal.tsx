import React from 'react';
import { X, Play, Calendar, Film, Tv, HardDrive } from 'lucide-react';
import { Media } from '../types/media';

interface MediaModalProps {
  media: Media | null;
  onClose: () => void;
  onPlay: (media: Media) => void;
}

export const MediaModal: React.FC<MediaModalProps> = ({ media, onClose, onPlay }) => {
  if (!media) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div
        className="relative w-full max-w-3xl bg-[#181818] rounded-xl overflow-hidden shadow-2xl border border-white/10"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-black/70 hover:bg-neutral-800 text-white flex items-center justify-center border border-white/20 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="relative aspect-video w-full bg-black">
          <img
            src={media.coverUrl}
            alt={media.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#181818] via-transparent to-black/30" />

          <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between">
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white drop-shadow-md">
                {media.title}
              </h2>
            </div>
            <button
              onClick={() => onPlay(media)}
              className="flex items-center gap-2 bg-[#E50914] hover:bg-red-700 text-white font-bold px-6 py-2.5 rounded-md shadow-lg transition transform hover:scale-105"
            >
              <Play className="w-5 h-5 fill-white" />
              <span>Assistir</span>
            </button>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-gray-300">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <Calendar className="w-4 h-4" />
              {media.year}
            </span>
            <span className="flex items-center gap-1.5 bg-neutral-800 border border-neutral-700 px-2.5 py-1 rounded">
              {media.type === 'MOVIE' ? <Film className="w-3.5 h-3.5" /> : <Tv className="w-3.5 h-3.5" />}
              {media.type === 'MOVIE' ? 'Filme' : 'Série'}
            </span>
            <span className="flex items-center gap-1.5 text-gray-400">
              <HardDrive className="w-3.5 h-3.5" />
              {media.filePath}
            </span>
          </div>

          <p className="text-sm text-gray-300 leading-relaxed">
            {media.description}
          </p>
        </div>
      </div>
    </div>
  );
};

