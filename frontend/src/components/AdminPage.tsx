import React, { FormEvent, useState } from 'react';
import { Film, Image, FileVideo, CheckCircle, AlertTriangle } from 'lucide-react';
import { MediaService } from '../services/mediaService';

interface AdminPageProps {
  onCreated: () => Promise<void>;
  onBack: () => void;
}

export const AdminPage: React.FC<AdminPageProps> = ({ onCreated, onBack }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [year, setYear] = useState('');
  const [type, setType] = useState<'MOVIE' | 'SERIES'>('MOVIE');
  const [videoFileName, setVideoFileName] = useState('');
  const [coverFileName, setCoverFileName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    if (!videoFileName || !coverFileName) {
      setError('Selecione o vídeo e a imagem de capa.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      setMessage(null);
      await MediaService.createMedia({ title, description, year, type, videoFileName, coverFileName });
      await onCreated();
      setMessage('Título cadastrado com sucesso.');
      setTitle('');
      setDescription('');
      setYear('');
      setVideoFileName('');
      setCoverFileName('');
      event.currentTarget.reset();
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : 'Falha ao cadastrar título.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button onClick={onBack} className="text-sm text-gray-400 hover:text-white mb-6">
        ← Voltar ao catálogo
      </button>
      <section className="bg-[#181818] border border-neutral-800 rounded-xl p-6 sm:p-8">
        <div className="flex items-center gap-3 mb-6">
          <Film className="w-6 h-6 text-[#E50914]" />
          <div>
            <h1 className="text-2xl font-bold">Cadastrar mídia</h1>
            <p className="text-sm text-gray-400">Selecione os arquivos que já estão na pasta de mídias do servidor.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid sm:grid-cols-2 gap-5">
            <label className="space-y-2 text-sm">
              <span className="text-gray-300">Título</span>
              <input required value={title} onChange={(event) => setTitle(event.target.value)}
                className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-white" />
            </label>
            <label className="space-y-2 text-sm">
              <span className="text-gray-300">Ano</span>
              <input required type="number" min="1888" max={new Date().getFullYear() + 1} value={year}
                onChange={(event) => setYear(event.target.value)}
                className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-white" />
            </label>
          </div>

          <label className="space-y-2 text-sm block">
            <span className="text-gray-300">Resumo</span>
            <textarea required value={description} onChange={(event) => setDescription(event.target.value)}
              className="w-full min-h-28 bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-white" />
          </label>

          <fieldset className="space-y-2 text-sm">
            <legend className="text-gray-300">Tipo</legend>
            <div className="flex gap-5">
              <label><input type="radio" checked={type === 'MOVIE'} onChange={() => setType('MOVIE')} /> <span className="ml-1">Filme</span></label>
              <label><input type="radio" checked={type === 'SERIES'} onChange={() => setType('SERIES')} /> <span className="ml-1">Série</span></label>
            </div>
          </fieldset>

          <div className="grid sm:grid-cols-2 gap-5">
            <label className="flex flex-col gap-2 text-sm border border-dashed border-neutral-700 rounded-lg p-4 cursor-pointer hover:border-red-500">
              <span className="flex items-center gap-2 text-gray-300"><FileVideo className="w-4 h-4" /> Nome do vídeo</span>
              <input required type="file" accept="video/*" onChange={(event) => setVideoFileName(event.target.files?.[0]?.name || '')} className="text-xs text-gray-400" />
              <span className="text-xs text-gray-500">{videoFileName || 'Selecione o vídeo para obter o nome'}</span>
            </label>
            <label className="flex flex-col gap-2 text-sm border border-dashed border-neutral-700 rounded-lg p-4 cursor-pointer hover:border-red-500">
              <span className="flex items-center gap-2 text-gray-300"><Image className="w-4 h-4" /> Nome da capa</span>
              <input required type="file" accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml" onChange={(event) => setCoverFileName(event.target.files?.[0]?.name || '')} className="text-xs text-gray-400" />
              <span className="text-xs text-gray-500">{coverFileName || 'Selecione a imagem para obter o nome'}</span>
            </label>
          </div>

          {error && <p className="flex items-center gap-2 text-sm text-red-300"><AlertTriangle className="w-4 h-4" />{error}</p>}
          {message && <p className="flex items-center gap-2 text-sm text-emerald-300"><CheckCircle className="w-4 h-4" />{message}</p>}
          <button disabled={isSubmitting} className="w-full bg-[#E50914] hover:bg-red-700 disabled:opacity-50 rounded-lg py-3 font-bold">
            {isSubmitting ? 'Cadastrando...' : 'Cadastrar no catálogo'}
          </button>
        </form>
      </section>
    </main>
  );
};
