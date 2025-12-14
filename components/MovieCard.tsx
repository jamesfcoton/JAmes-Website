
import React, { useState, useRef, useEffect } from 'react';
import { Movie } from '../types';

interface MovieCardProps {
  movie: Movie;
  rank?: number;
  onClick: (movie: Movie) => void;
  isLarge?: boolean;
}

const MovieCard: React.FC<MovieCardProps> = ({ movie, rank, onClick, isLarge = false }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isVideoReady, setIsVideoReady] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  // Timeout ref to prevent rapid video loading triggers on accidental swipes
  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleMouseEnter = () => {
    hoverTimeoutRef.current = setTimeout(() => {
        setIsHovered(true);
    }, 200); // Small delay to avoid loading video when just passing through
  };

  const handleMouseLeave = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    setIsHovered(false);
    setIsVideoReady(false);
  };

  return (
    <div 
      className={`relative flex-none group cursor-pointer transition-all duration-200 ${isLarge ? 'w-[280px] md:w-[400px]' : 'w-[280px] md:w-[360px]'}`}
      onClick={() => onClick(movie)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Rank Number for Top 10 - Stoked Font */}
      {rank && (
        <span className="absolute -left-4 md:-left-8 -bottom-6 text-[100px] md:text-[140px] font-black leading-none z-10 text-stroke-2 italic tracking-tighter" style={{ fontFamily: 'Oswald' }}>
          {rank}
        </span>
      )}

      {/* Card Container - Rounded & Clean */}
      <div className={`relative overflow-hidden rounded-lg bg-gray-800 transition-all duration-300 ${rank ? 'ml-8 md:ml-12' : ''}`}>
        <div className="aspect-video w-full relative">
            {/* Static Image (Always visible as base) */}
            <img 
              src={movie.imageUrl} 
              alt={movie.title}
              className={`w-full h-full object-cover transition-all duration-500 ${isHovered ? 'grayscale-0' : 'grayscale-[50%]'}`}
              loading="lazy"
            />
            
            {/* Video Player (Overlay) */}
            {isHovered && movie.videoUrl && (
                <div className={`absolute inset-0 transition-opacity duration-500 ${isVideoReady ? 'opacity-100' : 'opacity-0'}`}>
                    <video
                        ref={videoRef}
                        src={movie.videoUrl}
                        autoPlay
                        muted
                        loop
                        playsInline
                        className="w-full h-full object-cover"
                        onCanPlay={() => setIsVideoReady(true)}
                    />
                </div>
            )}

            {/* Hard Vignette - Reduced Opacity */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-40"></div>
        </div>
        
        {/* Hover Overlay - Reduced from bg-black/80 to bg-black/40 */}
        <div className={`absolute inset-0 bg-black/40 transition-opacity duration-200 flex flex-col justify-between p-4 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
          <div className="w-full flex justify-between items-start">
             <span className="bg-accent text-black text-[10px] font-bold px-1 font-mono rounded-sm">{movie.quality || 'HD'}</span>
             <span className="text-accent font-mono text-xs">{movie.year}</span>
          </div>
          
          <div>
            <h3 className="text-white font-bold text-lg uppercase leading-none mb-2 font-oswald italic drop-shadow-md">{movie.title}</h3>
            <div className="flex items-center gap-2 text-xs text-gray-200 font-mono drop-shadow-sm">
                <span className="text-accent">●</span>
                <span>{movie.genre}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieCard;