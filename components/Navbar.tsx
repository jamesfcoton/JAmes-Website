
import React, { useState, useEffect } from 'react';
import { MarqueeItem } from '../types';
import { Search, X } from 'lucide-react';

interface NavbarProps {
  marqueeItems: MarqueeItem[];
  marqueeColor?: string;
  marqueeTextColor?: string;
  onSearch: (query: string) => void;
  searchQuery?: string;
  onNavigate: (view: 'home' | 'about' | 'contact') => void;
  currentView: 'home' | 'about' | 'contact';
}

const Navbar: React.FC<NavbarProps> = ({ marqueeItems, marqueeColor, marqueeTextColor, onSearch, searchQuery = "", onNavigate, currentView }) => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      {/* Top Ticker - Dynamic & Linkable */}
      <div 
        className="fixed top-0 w-full z-[60] bg-accent text-xs md:text-sm font-mono font-bold overflow-hidden border-b-2 border-black group hover:pause-marquee h-8 flex items-center"
        style={{ 
            backgroundColor: marqueeColor || 'var(--theme-color)',
            color: marqueeTextColor || '#000000'
        }}
      >
        <div className="whitespace-nowrap animate-marquee py-1 flex items-center w-full">
          {/* We duplicate the array to ensure smooth infinite scrolling */}
          {[...marqueeItems, ...marqueeItems, ...marqueeItems].map((item, index) => (
            <React.Fragment key={`${item.id}-${index}`}>
              {item.link ? (
                <a 
                  href={item.link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="mx-4 hover:underline decoration-current decoration-2 underline-offset-2 cursor-pointer uppercase"
                >
                  {item.text}
                </a>
              ) : (
                <span className="mx-4 uppercase">{item.text}</span>
              )}
              <span className="mx-4 opacity-40">///</span>
            </React.Fragment>
          ))}
        </div>
      </div>

      <nav 
        className={`fixed top-8 w-full z-50 transition-all duration-300 ${
          isScrolled 
            ? 'bg-black border-b border-white' 
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-[1920px] mx-auto px-4 md:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-12">
            {/* Logo */}
            <div className="text-4xl font-black tracking-tighter italic transform -skew-x-12 text-white uppercase cursor-pointer" onClick={() => onNavigate('home')}>
              JAMES F COTON<span className="text-accent">.</span>
            </div>

            {/* Desktop Links */}
            <div className="hidden md:flex items-center gap-8 text-sm font-mono tracking-widest text-gray-300">
              <button 
                className={`hover:text-accent hover:underline decoration-2 underline-offset-4 transition-all ${currentView === 'home' && !searchQuery ? 'text-white underline decoration-accent' : ''}`} 
                onClick={() => onNavigate('home')}
              >
                Home
              </button>
              <button 
                className="hover:text-accent hover:underline decoration-2 underline-offset-4 transition-all" 
                onClick={() => onSearch("Stills")}
              >
                Stills
              </button>
              <button 
                className={`hover:text-accent hover:underline decoration-2 underline-offset-4 transition-all ${currentView === 'contact' ? 'text-white underline decoration-accent' : ''}`}
                onClick={() => onNavigate('contact')}
              >
                Contact
              </button>
              <button 
                className={`hover:text-accent hover:underline decoration-2 underline-offset-4 transition-all ${currentView === 'about' ? 'text-white underline decoration-accent' : ''}`}
                onClick={() => onNavigate('about')}
              >
                About
              </button>
            </div>
          </div>

          {/* Right Area - Aesthetic Search Bar */}
          <div className="flex items-center">
             <div className="relative group flex items-center bg-white/5 border border-white/10 rounded-full px-4 py-2 w-[200px] md:w-[320px] transition-all duration-300 hover:bg-white/10 hover:border-white/30 focus-within:border-accent focus-within:bg-black">
                <Search className="w-4 h-4 text-gray-400 group-focus-within:text-accent mr-3 transition-colors flex-none" />
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => onSearch(e.target.value)}
                  placeholder="Search (e.g. Car, Sport...)" 
                  className="bg-transparent border-none text-white text-xs font-mono font-bold tracking-widest uppercase w-full focus:outline-none placeholder-gray-600 pr-8"
                />
                {searchQuery && (
                    <button 
                        onClick={() => onSearch("")}
                        className="absolute right-3 text-gray-500 hover:text-accent transition-colors"
                    >
                        <X className="w-3 h-3" />
                    </button>
                )}
             </div>
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navbar;
