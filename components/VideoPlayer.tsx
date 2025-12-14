
import React from 'react';
import { X } from 'lucide-react';

interface VideoPlayerProps {
  vimeoUrl: string;
  onClose: () => void;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ vimeoUrl, onClose }) => {
  // Helper to extract ID and format standard URL to Embed URL if needed
  const getEmbedUrl = (url: string) => {
    if (url.includes('player.vimeo.com')) return url;
    
    // Simple regex to find ID from vimeo.com/123456
    const match = url.match(/vimeo\.com\/(\d+)/);
    if (match && match[1]) {
      return `https://player.vimeo.com/video/${match[1]}?autoplay=1&title=0&byline=0&portrait=0`;
    }
    
    // Fallback if user pasted just ID
    if (/^\d+$/.test(url)) {
        return `https://player.vimeo.com/video/${url}?autoplay=1&title=0&byline=0&portrait=0`;
    }

    return url;
  };

  const embedSrc = getEmbedUrl(vimeoUrl);

  return (
    <div className="fixed inset-0 z-[100] bg-black flex items-center justify-center p-0 md:p-8 animate-in fade-in duration-300">
      <button 
        onClick={onClose}
        className="absolute top-4 right-4 z-50 p-2 bg-black text-white hover:bg-acid hover:text-black border border-white transition-colors rounded-full"
      >
        <X className="w-8 h-8" strokeWidth={1.5} />
      </button>

      <div className="w-full h-full max-w-7xl max-h-[80vh] relative bg-black aspect-video border border-white/20 shadow-2xl">
        <iframe 
          src={embedSrc} 
          className="w-full h-full absolute inset-0"
          frameBorder="0" 
          allow="autoplay; fullscreen; picture-in-picture" 
          allowFullScreen
          title="Vimeo Player"
        />
      </div>
    </div>
  );
};

export default VideoPlayer;
