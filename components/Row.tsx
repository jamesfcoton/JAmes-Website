
import React, { useRef, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Movie } from '../types';
import MovieCard from './MovieCard';

interface RowProps {
  title: string;
  movies: Movie[];
  isRanked?: boolean;
  onMovieClick: (movie: Movie) => void;
}

const Row: React.FC<RowProps> = ({ title, movies, isRanked, onMovieClick }) => {
  const rowRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    if (rowRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = rowRef.current;
      setCanScrollLeft(scrollLeft > 0);
      // Use a small buffer (5px) to account for potential rounding issues
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 5);
    }
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, [movies]);

  const scroll = (direction: 'left' | 'right') => {
    if (rowRef.current) {
      const { clientWidth } = rowRef.current;
      const scrollAmount = direction === 'left' ? -clientWidth : clientWidth;
      rowRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      // The onScroll event listener handles the state update
    }
  };

  return (
    <div className="space-y-4 my-12 px-4 md:px-12 group/row relative">
      <div className="flex items-end justify-between px-1 border-b border-white/10 pb-2 mb-4">
        <div className="flex items-center gap-4">
            <div className="w-3 h-3 bg-accent rotate-45"></div>
            <h2 className="text-2xl md:text-3xl font-black uppercase text-white tracking-tighter hover:text-accent transition-colors cursor-pointer italic">
            {title}
            </h2>
        </div>
      </div>

      <div className="relative group/slider">
          {/* Left Arrow */}
          {canScrollLeft && (
            <button 
                onClick={() => scroll('left')}
                className="hidden md:flex absolute left-0 top-0 bottom-10 z-40 w-12 items-center justify-center bg-black/30 hover:bg-black/60 text-white hover:text-accent transition-all duration-300 opacity-0 group-hover/slider:opacity-100 backdrop-blur-sm -ml-4 rounded-r-lg border-r border-white/10"
            >
                <ChevronLeft className="w-8 h-8" />
            </button>
          )}

          <div 
            ref={rowRef}
            onScroll={checkScroll}
            className="flex gap-4 overflow-x-auto overflow-y-hidden hide-scrollbar pb-10 scroll-smooth px-1"
          >
            {movies.map((movie, index) => (
              <MovieCard 
                key={movie.id} 
                movie={movie} 
                rank={isRanked ? index + 1 : undefined}
                isLarge={isRanked}
                onClick={onMovieClick}
              />
            ))}
            {/* Spacer */}
            <div className="w-12 flex-none" /> 
          </div>

          {/* Right Arrow */}
          {canScrollRight && (
            <button 
                onClick={() => scroll('right')}
                className="hidden md:flex absolute right-0 top-0 bottom-10 z-40 w-12 items-center justify-center bg-black/30 hover:bg-black/60 text-white hover:text-accent transition-all duration-300 opacity-0 group-hover/slider:opacity-100 backdrop-blur-sm -mr-4 rounded-l-lg border-l border-white/10"
            >
                <ChevronRight className="w-8 h-8" />
            </button>
          )}
      </div>
    </div>
  );
};

export default Row;
