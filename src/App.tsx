import React from 'react';
import SnakeGame from './components/SnakeGame';
import MusicPlayer from './components/MusicPlayer';

export default function App() {
  return (
    <div className="min-h-screen bg-[#050505] text-[#00FFFF] flex flex-col font-mono selection:bg-[#FF00FF] selection:text-[#050505] relative">
      <div className="noise-bg"></div>
      <div className="scanlines"></div>

      {/* Header */}
      <header className="p-6 text-center relative z-10 border-b-4 border-[#FF00FF] mb-4 bg-[#050505]">
        <h1 className="text-5xl md:text-7xl font-black tracking-widest text-[#00FFFF] uppercase glitch" data-text="SYS.SNAKE_PROTOCOL">
          SYS.SNAKE_PROTOCOL
        </h1>
        <p className="text-[#FF00FF] mt-2 tracking-widest text-2xl uppercase animate-pulse">
          AUDIO_INTERFACE // ACTIVE
        </p>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4 relative z-10">
        <SnakeGame />
      </main>

      {/* Footer / Music Player */}
      <footer className="p-6 relative z-10 border-t-4 border-[#00FFFF] mt-4 bg-[#050505]">
        <MusicPlayer />
      </footer>
    </div>
  );
}
