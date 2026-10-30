import React, { useState } from 'react';
import { useMediaCatalog } from './hooks/useMediaCatalog';
import { Media, Episode } from './types/media';
import { Navbar } from './components/Navbar';
import { MediaCard } from './components/MediaCard';
import { MediaModal } from './components/MediaModal';
import { VideoPlayer } from './components/VideoPlayer';
import { AdminPage } from './components/AdminPage';
import { SeriesPage } from './components/SeriesPage';
import { MediaService } from './services/mediaService';
import { Film, AlertTriangle, RefreshCw } from 'lucide-react';

interface ActivePlayback {
  media: Media;
  streamUrl?: string;
  displayTitle?: string;
  subtitle?: string;
}

export const App: React.FC = () => {
  const { medias, isLoading, error, refresh } = useMediaCatalog();
  const [selectedMedia, setSelectedMedia] = useState<Media | null>(null);
  const [selectedSeries, setSelectedSeries] = useState<Media | null>(null);
  const [playback, setPlayback] = useState<ActivePlayback | null>(null);
  const [isAdminPage, setIsAdminPage] = useState(false);

  const handleOpenModal = (media: Media): void => {
    setSelectedMedia(media);
  };

  const handleCloseModal = (): void => {
    setSelectedMedia(null);
  };

  const handleSelectSeries = (media: Media): void => {
    setSelectedSeries(media);
  };

  const handleStartMoviePlayback = (media: Media): void => {
    setSelectedMedia(null);
    setPlayback({
      media,
      streamUrl: MediaService.getStreamUrl(media.id),
      displayTitle: media.title,
      subtitle: `${media.year} • Filme`
    });
  };

  const handleStartEpisodePlayback = (series: Media, episode: Episode): void => {
    setPlayback({
      media: series,
      streamUrl: MediaService.getEpisodeStreamUrl(episode.id),
      displayTitle: `${series.title}: ${episode.title}`,
      subtitle: `T${episode.seasonNumber}:E${episode.episodeNumber} • ${series.title}`
    });
  };

  const handleClosePlayer = (): void => {
    setPlayback(null);
  };

  return (
    <div className="min-h-screen bg-[#141414] text-white flex flex-col">
      <Navbar onAdminClick={() => { setIsAdminPage(true); setSelectedSeries(null); }} />

      {isAdminPage ? (
        <AdminPage onCreated={refresh} onBack={() => setIsAdminPage(false)} />
      ) : selectedSeries ? (
        <SeriesPage
          series={selectedSeries}
          onBack={() => setSelectedSeries(null)}
          onPlayEpisode={(ep) => handleStartEpisodePlayback(selectedSeries, ep)}
        />
      ) : (
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Hero Banner Minimalista */}
          <div className="relative rounded-2xl overflow-hidden mb-10 bg-gradient-to-r from-neutral-900 to-neutral-800 border border-neutral-800 p-8 sm:p-12 shadow-2xl">
            <div className="max-w-2xl space-y-4">
              <span className="inline-block px-3 py-1 bg-red-600/20 text-[#E50914] text-xs font-bold uppercase rounded-full border border-red-500/20">
                Servidor Doméstico de Streaming
              </span>
              <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
                Sua coleção local, com experiência Netflix.
              </h1>
              <p className="text-gray-400 text-sm sm:text-base leading-relaxed">
                Assista a seus filmes e séries diretamente do HD, com buffer ultrarrápido via HTTP Range Requests e transmissão para Google Chromecast.
              </p>
            </div>
          </div>

          {/* Catalog Section */}
          <section className="space-y-6">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
              <div className="flex items-center gap-2">
                <Film className="w-5 h-5 text-[#E50914]" />
                <h2 className="text-xl font-bold tracking-tight text-white">Catálogo de Vídeos</h2>
              </div>
              <span className="text-xs text-neutral-400">
                {medias.length} {medias.length === 1 ? 'título disponível' : 'títulos disponíveis'}
              </span>
            </div>

            {isLoading && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="animate-pulse bg-neutral-800 rounded-md aspect-video" />
                ))}
              </div>
            )}

            {error && (
              <div className="bg-red-950/40 border border-red-800 rounded-lg p-6 text-center space-y-3">
                <AlertTriangle className="w-8 h-8 text-red-500 mx-auto" />
                <p className="text-sm text-red-200">{error}</p>
                <button
                  onClick={refresh}
                  className="inline-flex items-center gap-2 bg-neutral-800 hover:bg-neutral-700 text-white text-xs px-4 py-2 rounded-md transition"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Tentar novamente
                </button>
              </div>
            )}

            {!isLoading && !error && medias.length === 0 && (
              <div className="text-center py-16 border border-dashed border-neutral-800 rounded-xl space-y-3">
                <Film className="w-10 h-10 text-neutral-600 mx-auto" />
                <p className="text-neutral-400 text-sm">Nenhum vídeo cadastrado no catálogo.</p>
                <p className="text-neutral-600 text-xs">Execute o seed ou cadastre novos registros no banco.</p>
              </div>
            )}

            {!isLoading && medias.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
                {medias.map((media) => (
                  <MediaCard
                    key={media.id}
                    media={media}
                    onSelect={handleOpenModal}
                    onSelectSeries={handleSelectSeries}
                  />
                ))}
              </div>
            )}
          </section>
        </main>
      )}

      {/* Modal de Detalhes para Filmes */}
      <MediaModal
        media={selectedMedia}
        onClose={handleCloseModal}
        onPlay={handleStartMoviePlayback}
      />

      {/* Player de Vídeo em Tela Cheia com Chromecast */}
      {playback && (
        <VideoPlayer
          media={playback.media}
          streamUrl={playback.streamUrl}
          displayTitle={playback.displayTitle}
          subtitle={playback.subtitle}
          onClose={handleClosePlayer}
        />
      )}
    </div>
  );
};

export default App;
