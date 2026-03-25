import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Music } from 'lucide-react';

const TRACKS = [
  {
    id: 1,
    title: "DATA_STREAM_01",
    artist: "UNKNOWN_ENTITY",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    duration: "6:12"
  },
  {
    id: 2,
    title: "NEURAL_NET_BETA",
    artist: "SYS_ADMIN",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    duration: "7:05"
  },
  {
    id: 3,
    title: "DEEP_LEARN_GAMMA",
    artist: "CONSTRUCT_09",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
    duration: "5:44"
  }
];

export default function MusicPlayer() {
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  
  const audioRef = useRef<HTMLAudioElement>(null);

  const currentTrack = TRACKS[currentTrackIndex];

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  useEffect(() => {
    if (isPlaying) {
      audioRef.current?.play().catch(() => setIsPlaying(false));
    } else {
      audioRef.current?.pause();
    }
  }, [isPlaying, currentTrackIndex]);

  const togglePlay = () => setIsPlaying(!isPlaying);

  const playNext = () => {
    setCurrentTrackIndex((prev) => (prev + 1) % TRACKS.length);
    setProgress(0);
  };

  const playPrev = () => {
    setCurrentTrackIndex((prev) => (prev - 1 + TRACKS.length) % TRACKS.length);
    setProgress(0);
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const current = audioRef.current.currentTime;
      const duration = audioRef.current.duration;
      if (duration) {
        setProgress((current / duration) * 100);
      }
    }
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (audioRef.current) {
      const bounds = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - bounds.left;
      const percentage = x / bounds.width;
      audioRef.current.currentTime = percentage * audioRef.current.duration;
      setProgress(percentage * 100);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-[#050505] border-4 border-[#00FFFF] p-6 flex flex-col md:flex-row items-center gap-6 font-mono">
      <audio
        ref={audioRef}
        src={currentTrack.url}
        onEnded={playNext}
        onTimeUpdate={handleTimeUpdate}
      />

      {/* Track Info */}
      <div className="flex items-center gap-4 w-full md:w-1/3 border-b-4 md:border-b-0 md:border-r-4 border-[#FF00FF] pb-4 md:pb-0 md:pr-4">
        <div className="w-16 h-16 bg-[#FF00FF] flex items-center justify-center text-[#050505] flex-shrink-0">
          <Music className="w-8 h-8" />
        </div>
        <div className="overflow-hidden">
          <h3 className="text-[#00FFFF] text-2xl font-bold truncate glitch" data-text={currentTrack.title}>
            {currentTrack.title}
          </h3>
          <p className="text-[#FF00FF] text-lg truncate">ID: {currentTrack.artist}</p>
        </div>
      </div>

      {/* Controls & Progress */}
      <div className="flex flex-col items-center gap-4 w-full md:w-1/3">
        <div className="flex items-center gap-6">
          <button onClick={playPrev} className="text-[#00FFFF] hover:text-[#FF00FF] hover:scale-110 transition-transform">
            <SkipBack className="w-8 h-8" />
          </button>
          
          <button 
            onClick={togglePlay}
            className="w-16 h-16 bg-[#00FFFF] text-[#050505] flex items-center justify-center hover:bg-[#FF00FF] transition-colors"
          >
            {isPlaying ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8 ml-2" />}
          </button>
          
          <button onClick={playNext} className="text-[#00FFFF] hover:text-[#FF00FF] hover:scale-110 transition-transform">
            <SkipForward className="w-8 h-8" />
          </button>
        </div>
        
        {/* Progress Bar */}
        <div 
          className="w-full h-4 bg-[#050505] border-2 border-[#00FFFF] cursor-pointer relative"
          onClick={handleProgressClick}
        >
          <div 
            className="absolute top-0 left-0 h-full bg-[#FF00FF]"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Volume */}
      <div className="hidden md:flex items-center justify-end gap-4 w-full md:w-1/3 border-l-4 border-[#FF00FF] pl-4">
        <button onClick={() => setIsMuted(!isMuted)} className="text-[#00FFFF] hover:text-[#FF00FF]">
          {isMuted || volume === 0 ? <VolumeX className="w-8 h-8" /> : <Volume2 className="w-8 h-8" />}
        </button>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={isMuted ? 0 : volume}
          onChange={(e) => {
            setVolume(parseFloat(e.target.value));
            setIsMuted(false);
          }}
          className="w-32 h-4 bg-[#050505] border-2 border-[#00FFFF] appearance-none cursor-pointer accent-[#FF00FF]"
        />
      </div>
    </div>
  );
}
