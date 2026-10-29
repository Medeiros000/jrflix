import React from 'react';
import { Play } from 'lucide-react';
import { Media } from '../types/media';

interface MediaCardProps {
  media: Media;
  onSelect: (media: Media) => void;
}

export const MediaCard: React.FC<MediaCardProps> = ({ media, onSelect }) => {
  return (
    <div
      onClick={() => onSelect(media)}
      className="group relative bg-[#181818] rounded-md overflow-hidden cursor-pointer transition-all duration-300 hover:scale-105 hover:z-20 hover:shadow-2xl hover:shadow-black/80 flex flex-col"
    >
      <div className="relative aspect-video w-full overflow-hidden bg-neutral-900">
        <img
          src={media.coverUrl}
          alt={media.title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-white/90 text-black flex items-center justify-center shadow-lg transform group-hover:scale-100 transition">
            <Play className="w-6 h-6 fill-black ml-1" />
          </div>
        </div>
      </div>

      <div className="p-3 flex flex-col flex-grow justify-between">
        <h3 className="font-semibold text-sm line-clamp-1 text-white group-hover:text-[#E50914] transition">
          {media.title}
        </h3>
        <div className="flex items-center gap-2 mt-2 text-xs text-gray-400">
          <span className="font-medium text-emerald-400">{media.year}</span>
          <span className="border border-neutral-700 px-1.5 py-0.5 rounded text-[10px] uppercase font-bold text-gray-300">
            {media.type === 'MOVIE' ? 'Filme' : 'Série'}
          </span>
        </div>
      </div>
    </div>
  );
};

