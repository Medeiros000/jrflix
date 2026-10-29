import React from 'react';
import { Film } from 'lucide-react';

export const Navbar: React.FC = () => {
  return (
    <header className="sticky top-0 z-40 w-full bg-[#141414]/90 backdrop-blur-md border-b border-white/10 px-6 py-4 transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2 cursor-pointer">
            <Film className="w-8 h-8 text-[#E50914]" />
            <span className="text-2xl font-black tracking-wider text-[#E50914] uppercase">
              JRFlix
            </span>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-300">
            <a href="#" className="text-white hover:text-white transition">Início</a>
            <a href="#" className="hover:text-white transition">Séries</a>
            <a href="#" className="hover:text-white transition">Filmes</a>
            <a href="#" className="hover:text-white transition">Bombando</a>
            <a href="#" className="hover:text-white transition">Minha lista</a>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-xs bg-white/10 text-gray-300 px-3 py-1 rounded-full border border-white/5">
            Streaming Local
          </span>
          <div className="w-8 h-8 rounded bg-red-600 flex items-center justify-center font-bold text-xs text-white">
            JR
          </div>
        </div>
      </div>
    </header>
  );
};

