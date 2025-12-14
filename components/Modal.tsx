
import React, { useEffect, useState, useRef } from 'react';
import { X, Play, Star, Plus, ThumbsUp, Download } from 'lucide-react';
import { Movie } from '../types';
import GallerySlideshow from './GallerySlideshow';

interface ModalProps {
  movie: Movie | null;
  onClose: () => void;
  onPlay: (movie: Movie) => void;
}

const Modal: React.FC<ModalProps> = ({ movie, onClose, onPlay }) => {
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [slideshowOpen, setSlideshowOpen] = useState(false);
  const [slideshowIndex, setSlideshowIndex] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (movie) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    // Reset video state when movie changes
    setIsVideoLoaded(false);
    return () => { document.body.style.overflow = 'unset'; };
  }, [movie]);

  if (!movie) return null;

  // Use heroUrl if available, otherwise fallback to imageUrl
  const displayImage = movie.heroUrl || movie.imageUrl;

  const handleOpenSlideshow = (index: number) => {
    setSlideshowIndex(index);
    setSlideshowOpen(true);
  };

  return (
    <>
      <div className="fixed inset-0 z-[70] flex items-center justify-center p-0 md:p-8">
        {/* Backdrop */}
        <div 
          className="absolute inset-0 bg-accent/10 backdrop-blur-lg transition-opacity" 
          onClick={onClose}
        />

        {/* Modal Content */}
        <div className="relative w-full max-w-5xl bg-black border-2 border-white shadow-[10px_10px_0px_0px_rgba(var(--theme-color-rgb),1)] animate-in fade-in zoom-in-95 duration-200 max-h-[100vh] md:max-h-[90vh] overflow-y-auto hide-scrollbar flex flex-col">
          
          {/* Close Button */}
          <button 
            onClick={onClose}
            className="fixed md:absolute top-4 right-4 z-20 p-2 bg-black text-white hover:bg-accent hover:text-black border border-white transition-colors"
          >
            <X className="w-8 h-8" strokeWidth={1.5} />
          </button>

          {/* Hero Media Area (Image + Video) */}
          <div className="relative h-[40vh] md:h-[550px] flex-none overflow-hidden">
            {/* Base Image */}
            <img 
              src={displayImage} 
              alt={movie.title} 
              className="w-full h-full object-cover grayscale-[20%]"
            />
            
            {/* Background Video Layer */}
            {movie.videoUrl && (
              <div className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${isVideoLoaded ? 'opacity-100' : 'opacity-0'}`}>
                  <video
                      key={movie.videoUrl} // FORCE REMOUNT WHEN URL CHANGES
                      ref={videoRef}
                      autoPlay
                      muted
                      loop
                      playsInline
                      className="w-full h-full object-cover filter grayscale-[20%]"
                      onCanPlayThrough={() => setIsVideoLoaded(true)}
                  >
                      <source src={movie.videoUrl} type="video/mp4" />
                  </video>
              </div>
            )}

            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
            
            <div className="absolute bottom-0 left-0 p-6 md:p-10 w-full z-10">
              <h2 className="text-5xl md:text-8xl font-black text-white mb-6 uppercase italic leading-[0.85] mix-blend-difference drop-shadow-lg">{movie.title}</h2>
              
              <div className="flex flex-wrap items-center gap-4">
                <button 
                  onClick={() => onPlay(movie)}
                  className="flex items-center gap-2 bg-accent text-black px-8 py-4 font-black uppercase tracking-widest hover:bg-white transition-colors"
                >
                  <Play className="w-5 h-5 fill-black" /> Play
                </button>
                
                <button className="p-4 border border-white hover:bg-white hover:text-black transition-colors rounded-full">
                  <Plus className="w-5 h-5" />
                </button>
                
                <button className="p-4 border border-white hover:bg-white hover:text-black transition-colors rounded-full">
                  <ThumbsUp className="w-5 h-5" />
                </button>
                
                {movie.downloadUrl && (
                  <a 
                    href={movie.downloadUrl}
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="p-4 border border-white hover:bg-white hover:text-black transition-colors rounded-full"
                    title="Download Assets"
                  >
                    <Download className="w-5 h-5" />
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Details Content Container */}
          <div className="bg-black flex-1 flex flex-col">
            
            {/* Split Layout: Info & Sidebar */}
            <div className="p-6 md:p-10 grid md:grid-cols-[2fr_1fr] gap-12">
                <div className="space-y-8">
                    <div className="flex items-center gap-4 text-base font-mono border-b border-accent pb-4">
                        <span className="text-accent font-bold">{(movie.matchPercentage || movie.rating * 10)}% MATCH</span>
                        <span className="text-gray-400">/</span>
                        <span className="text-white">{movie.year}</span>
                        <span className="text-gray-400">/</span>
                        <span className="bg-white text-black px-1 font-bold text-xs">{movie.quality || 'HD'}</span>
                        <span className="text-gray-400">/</span>
                        <span className="text-white uppercase">{movie.genre}</span>
                    </div>

                    <div className="space-y-4 text-white leading-relaxed text-xl md:text-2xl font-light">
                        <p>{movie.description}</p>
                    </div>
                </div>

                <div className="space-y-8 text-sm font-mono">
                    <div className="border-l-2 border-accent pl-4">
                        <span className="text-gray-500 block mb-2 uppercase tracking-widest text-xs">Crew / Cast</span>
                        <div className="text-white hover:text-accent transition-colors uppercase leading-relaxed">
                        {movie.crew || "Information Unavailable"}
                        </div>
                    </div>
                    
                    <div className="border-l-2 border-accent pl-4">
                        <span className="text-gray-500 block mb-2 uppercase tracking-widest text-xs">Genres</span>
                        <span className="text-white uppercase">{movie.genre}</span>
                    </div>

                    <div className="border-l-2 border-accent pl-4">
                        <span className="text-gray-500 block mb-2 uppercase tracking-widest text-xs">Rating</span>
                        <div className="flex items-center gap-2 text-white font-bold text-lg">
                        <Star className="w-5 h-5 fill-accent text-accent" />
                        <span>{movie.rating}</span>
                        <span className="text-gray-600">/ 10</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* GALLERY SECTION - Full Width */}
            {movie.gallery && movie.gallery.length > 0 && (
                <div className="px-6 md:px-10 pb-10 space-y-4">
                   <h3 className="text-accent uppercase tracking-widest font-bold text-sm border-b border-accent/30 pb-2 mb-6">Visuals / Gallery</h3>
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {movie.gallery.map((item, idx) => (
                          <div 
                            key={idx} 
                            onClick={() => handleOpenSlideshow(idx)}
                            className="aspect-video bg-gray-900 cursor-pointer overflow-hidden border border-white/10 hover:border-accent transition-all group relative rounded-md shadow-lg"
                          >
                             {item.type === 'video' ? (
                                <video 
                                    src={item.url} 
                                    muted 
                                    loop 
                                    autoPlay
                                    playsInline
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                />
                             ) : (
                                <img 
                                    src={item.url} 
                                    alt={`Gallery ${idx}`} 
                                    loading="lazy"
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                />
                             )}
                          </div>
                      ))}
                   </div>
                </div>
            )}
          </div>
        </div>
      </div>

      {slideshowOpen && movie.gallery && (
         <GallerySlideshow 
            images={movie.gallery} 
            initialIndex={slideshowIndex} 
            onClose={() => setSlideshowOpen(false)} 
         />
      )}
    </>
  );
};

export default Modal;
