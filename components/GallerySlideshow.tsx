
import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { GalleryItem } from '../types';

interface GallerySlideshowProps {
  images: GalleryItem[];
  initialIndex: number;
  onClose: () => void;
}

const GallerySlideshow: React.FC<GallerySlideshowProps> = ({ images, initialIndex, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') showPrev();
      if (e.key === 'ArrowRight') showNext();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex]);

  const showNext = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const showPrev = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const currentItem = images[currentIndex];

  return (
    <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center animate-in fade-in duration-300">
      {/* Controls */}
      <button 
        onClick={onClose}
        className="absolute top-4 right-4 z-50 p-2 text-white hover:text-accent transition-colors"
      >
        <X className="w-10 h-10" />
      </button>

      <button 
        onClick={showPrev}
        className="absolute left-4 z-50 p-2 text-white/50 hover:text-white transition-colors hover:scale-110"
      >
        <ChevronLeft className="w-12 h-12" />
      </button>

      <button 
        onClick={showNext}
        className="absolute right-4 z-50 p-2 text-white/50 hover:text-white transition-colors hover:scale-110"
      >
        <ChevronRight className="w-12 h-12" />
      </button>

      {/* Main Content */}
      <div className="relative w-full h-full p-4 md:p-12 flex items-center justify-center">
        {currentItem.type === 'video' ? (
             <video 
                src={currentItem.url} 
                controls
                autoPlay
                className="max-w-full max-h-full object-contain shadow-2xl border border-white/10"
             />
        ) : (
             <img 
                src={currentItem.url} 
                alt={`Gallery ${currentIndex + 1}`} 
                className="max-w-full max-h-full object-contain shadow-2xl"
             />
        )}
      </div>

      {/* Counter */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 font-mono text-accent text-sm tracking-widest bg-black/50 px-4 py-2 rounded-full border border-white/10">
        {String(currentIndex + 1).padStart(2, '0')} <span className="text-gray-500">/</span> {String(images.length).padStart(2, '0')}
      </div>
    </div>
  );
};

export default GallerySlideshow;
