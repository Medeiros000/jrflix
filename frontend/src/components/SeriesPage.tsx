import React, { useEffect, useState } from 'react';
import { ArrowLeft, Play, Tv, Calendar, AlertCircle, RefreshCw } from 'lucide-react';
import { Media, Episode } from '../types/media';
import { MediaService } from '../services/mediaService';

interface SeriesPageProps {
  series: Media;
  onBack: () => void;
  onPlayEpisode: (episode: Episode) => void;
}

export const SeriesPage: React.FC<SeriesPageProps> = ({
  series,
  onBack,
  onPlayEpisode
}) => {
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEpisodes = async (): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await MediaService.getEpisodes(series.id);
      setEpisodes(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar episódios');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEpisodes();
  }, [series.id]);

  // Group episodes by season if there are multiple seasons
  const seasons = Array.from(new Set(episodes.map((ep) => ep.seasonNumber))).sort((a, b) => a - b);

  return (
    <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8 animate-fadeIn">
      {/* Botão de Retorno à Home */}
      <div>
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-neutral-900/80 hover:bg-neutral-800 border border-neutral-700 text-gray-200 hover:text-white transition shadow-md group"
        >
          <ArrowLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
          <span className="text-sm font-semibold">Voltar ao Início</span>
        </button>
      </div>

      {/* Hero Banner da Série */}
      <div className="relative rounded-2xl overflow-hidden bg-neutral-900 border border-neutral-800 shadow-2xl">
        <div className="relative h-64 sm:h-96 w-full">
          {series.coverUrl ? (
            <img
              src={series.coverUrl}
              alt={series.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-neutral-950 via-neutral-900 to-neutral-800" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-[#141414]/70 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#141414] via-[#141414]/50 to-transparent" />

          {/* Conteúdo sobreposto */}
          <div className="absolute bottom-6 left-6 right-6 sm:bottom-10 sm:left-10 max-w-3xl space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <span className="px-2.5 py-1 bg-[#E50914] text-white text-[11px] font-black uppercase tracking-wider rounded">
                Série
              </span>
              <span className="flex items-center gap-1.5 text-xs text-gray-300 bg-neutral-900/80 px-2 py-0.5 rounded border border-neutral-700">
                <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                {series.year}
              </span>
              <span className="text-xs text-neutral-400">
                {episodes.length} {episodes.length === 1 ? 'episódio' : 'episódios'}
              </span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight drop-shadow-md">
              {series.title}
            </h1>

            {series.description && (
              <p className="text-gray-300 text-sm sm:text-base line-clamp-3 leading-relaxed drop-shadow">
                {series.description}
              </p>
            )}

            {episodes.length > 0 && (
              <div className="pt-2">
                <button
                  onClick={() => onPlayEpisode(episodes[0])}
                  className="inline-flex items-center gap-2.5 bg-[#E50914] hover:bg-red-700 text-white font-bold px-6 py-3 rounded-lg shadow-xl transition transform hover:scale-105"
                >
                  <Play className="w-5 h-5 fill-white" />
                  <span>Assistir E01</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Lista de Episódios Estilo Netflix */}
      <section className="space-y-6">
        <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
          <div className="flex items-center gap-2">
            <Tv className="w-5 h-5 text-[#E50914]" />
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Episódios
            </h2>
          </div>
          {seasons.length > 1 && (
            <span className="text-xs text-neutral-400">
              {seasons.length} temporadas disponíveis
            </span>
          )}
        </div>

        {/* Loading Skeletons */}
        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="bg-neutral-900/80 border border-neutral-800 rounded-xl p-4 space-y-3 animate-pulse"
              >
                <div className="w-full aspect-video bg-neutral-800 rounded-lg" />
                <div className="h-4 bg-neutral-800 rounded w-3/4" />
                <div className="h-3 bg-neutral-800 rounded w-1/2" />
              </div>
            ))}
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-950/40 border border-red-800 rounded-lg p-6 text-center space-y-3">
            <AlertCircle className="w-8 h-8 text-red-500 mx-auto" />
            <p className="text-sm text-red-200">{error}</p>
            <button
              onClick={fetchEpisodes}
              className="inline-flex items-center gap-2 bg-neutral-800 hover:bg-neutral-700 text-white text-xs px-4 py-2 rounded-md transition"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Tentar novamente
            </button>
          </div>
        )}

        {/* Empty */}
        {!isLoading && !error && episodes.length === 0 && (
          <div className="text-center py-16 border border-dashed border-neutral-800 rounded-xl space-y-3">
            <Tv className="w-10 h-10 text-neutral-600 mx-auto" />
            <p className="text-neutral-400 text-sm">Nenhum episódio encontrado nesta pasta.</p>
          </div>
        )}

        {/* Cards de Episódios */}
        {!isLoading && episodes.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {episodes.map((episode) => {
              const epNumStr = `E${String(episode.episodeNumber).padStart(2, '0')}`;
              const sNumStr = `S${String(episode.seasonNumber).padStart(2, '0')}`;

              return (
                <div
                  key={episode.id}
                  onClick={() => onPlayEpisode(episode)}
                  className="group relative bg-[#181818] hover:bg-[#222222] border border-neutral-800/80 hover:border-neutral-700 rounded-xl overflow-hidden cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl flex flex-col"
                >
                  {/* Thumbnail / Header do Card */}
                  <div className="relative aspect-video w-full bg-neutral-900 overflow-hidden">
                    {series.coverUrl ? (
                      <img
                        src={series.coverUrl}
                        alt={episode.title}
                        className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full bg-neutral-800" />
                    )}

                    {/* Badge do Episódio */}
                    <div className="absolute top-3 left-3 bg-black/80 backdrop-blur-md px-2.5 py-1 rounded text-xs font-bold text-white border border-white/10">
                      {sNumStr}{epNumStr}
                    </div>

                    {/* Botão de Play Hover */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="w-12 h-12 rounded-full bg-[#E50914] text-white flex items-center justify-center shadow-lg transform group-hover:scale-110 transition">
                        <Play className="w-6 h-6 fill-white ml-0.5" />
                      </div>
                    </div>
                  </div>

                  {/* Detalhes do Card */}
                  <div className="p-4 flex flex-col flex-1 justify-between gap-2">
                    <div>
                      <div className="flex items-center justify-between text-xs text-neutral-400 mb-1">
                        <span>Episódio {episode.episodeNumber}</span>
                        <span>Temporada {episode.seasonNumber}</span>
                      </div>
                      <h3 className="font-semibold text-sm sm:text-base text-white group-hover:text-[#E50914] transition line-clamp-2">
                        {episode.title}
                      </h3>
                    </div>

                    <div className="pt-2 border-t border-neutral-800/60 flex items-center justify-between text-xs text-neutral-400">
                      <span className="flex items-center gap-1.5 text-neutral-300">
                        <Play className="w-3.5 h-3.5 text-[#E50914]" />
                        Reproduzir
                      </span>
                      <span className="text-[11px] text-neutral-500 font-mono truncate max-w-[140px]">
                        {episode.filePath.split('/').pop()}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};

