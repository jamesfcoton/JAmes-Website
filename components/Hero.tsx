
import React, { useState, useEffect, useRef } from 'react';
import { Play, Info, Zap } from 'lucide-react';
import { Movie } from '../types';

interface HeroProps {
  movie: Movie | null;
  onMoreInfo: (movie: Movie) => void;
  onPlay: (movie: Movie) => void;
  badgeText?: string;
  badgeColor?: string;
}

const Hero: React.FC<HeroProps> = ({ movie, onMoreInfo, onPlay, badgeText = "NEW ARRIVAL", badgeColor }) => {
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Reset video loaded state when the movie ID changes
  useEffect(() => {
    setIsVideoLoaded(false);
  }, [movie?.id]);

  if (!movie) return (
    <div className="h-[90vh] w-full bg-neutral-900 animate-pulse" />
  );

  // Use heroUrl if available, otherwise fallback to imageUrl
  const displayImage = movie.heroUrl || movie.imageUrl;

  // Badge Text Logic for adaptive sizing
  const renderBadgeContent = () => {
      const words = badgeText.split(' ');
      const totalLength = badgeText.length;
      
      // Determine font size based on text length
      let fontSizeClass = 'text-xl';
      let lineHeightClass = 'leading-none';
      let gapClass = 'gap-0';

      if (totalLength <= 4) {
          fontSizeClass = 'text-4xl'; // Very short (e.g. NEW)
      } else if (totalLength <= 10) {
          fontSizeClass = 'text-xl'; // Medium (e.g. ARRIVAL)
      } else {
          fontSizeClass = 'text-[10px]'; // Long (e.g. EXCLUSIVE DROP)
          lineHeightClass = 'leading-tight';
      }

      return (
          <div className={`absolute inset-0 flex flex-col items-center justify-center text-black font-black ${lineHeightClass} ${gapClass} p-4 text-center`}>
              {words.map((word, i) => (
                  <span key={i} className={`${fontSizeClass} block`}>{word}</span>
              ))}
          </div>
      );
  };

  return (
    <div className="relative h-screen w-full overflow-hidden border-b border-white/20">
      
      {/* 1. Base Static Image Layer (Always visible underneath) */}
      <div className="absolute inset-0 z-0">
        <img 
          src={displayImage} 
          alt={movie.title} 
          className="w-full h-full object-cover filter grayscale-[30%] contrast-125"
        />
      </div>

      {/* 2. Video Layer (Fades in on top) */}
      {movie.videoUrl && (
        <div className={`absolute inset-0 z-0 transition-opacity duration-1000 ease-in-out ${isVideoLoaded ? 'opacity-100' : 'opacity-0'}`}>
            <video
                key={movie.videoUrl} // FORCE REMOUNT WHEN URL CHANGES
                ref={videoRef}
                autoPlay
                muted
                loop
                playsInline
                className="w-full h-full object-cover filter grayscale-[5%] contrast-110"
                onCanPlayThrough={() => setIsVideoLoaded(true)}
            >
                <source src={movie.videoUrl} type="video/mp4" />
            </video>
        </div>
      )}

      {/* 3. Texture/Grain Overlay (Applies to both) - Reduced opacity */}
      <div className="absolute inset-0 z-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5 mix-blend-overlay pointer-events-none"></div>
      
      {/* 4. Gradient Overlay (Legibility) - Significantly reduced darkness */}
      <div className="absolute inset-0 z-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

      {/* 5. Content Layer */}
      <div className="relative z-10 h-full flex items-end pb-32 px-4 md:px-12 max-w-[1920px] mx-auto pointer-events-none">
        <div className="max-w-4xl space-y-6 pointer-events-auto">
          
          {/* Retro Star Badge - Dynamic Size & Text & Color */}
          <div className="relative inline-block w-32 h-32 mb-6 transform -rotate-12">
             <div 
               className="absolute inset-0 bg-accent" 
               style={{ 
                   backgroundColor: badgeColor || undefined,
                   clipPath: "polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)" 
               }}
             ></div>
             {renderBadgeContent()}
          </div>

          <h1 className="text-7xl md:text-9xl font-black uppercase tracking-tighter text-white leading-[0.85] drop-shadow-[0_0_15px_rgba(0,0,0,0.8)] italic">
            {movie.title}
          </h1>
          
          <div className="flex items-center gap-6 text-base font-mono bg-black/70 backdrop-blur-sm inline-flex px-4 py-2 border border-white/20">
             <span className="text-accent font-bold flex items-center gap-1">
                <Zap className="w-4 h-4 fill-current" />
                {movie.matchPercentage || 98}% MATCH
             </span>
             <span className="text-white">{movie.year}</span>
             <span className="bg-white text-black px-1 text-xs font-bold">{movie.quality || '4K'}</span>
             <span className="text-gray-300 uppercase">{movie.genre}</span>
          </div>

          <p className="text-lg md:text-xl text-gray-200 line-clamp-3 leading-tight max-w-2xl font-medium drop-shadow-md">
            {movie.description}
          </p>

          <div className="flex items-center gap-0 pt-6">
            <button 
                onClick={() => onPlay(movie)}
                className="flex items-center gap-3 bg-accent text-white px-10 py-5 font-black uppercase tracking-widest hover:bg-white hover:text-black transition-colors border-2 border-transparent"
            >
              <Play className="w-5 h-5 fill-current" />
              Watch Now
            </button>
            <button 
                onClick={() => onMoreInfo(movie)}
                className="flex items-center gap-3 bg-black/50 backdrop-blur-md text-white px-10 py-5 font-bold uppercase tracking-widest hover:bg-black transition-colors border-2 border-white border-l-0"
            >
              <Info className="w-5 h-5" />
              Details
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
