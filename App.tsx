
import React, { useEffect, useState, useMemo } from 'react';
import { CatalogData, Movie, MarqueeItem, GalleryItem } from './types';
import { fetchCatalog } from './services/geminiService';
import { getCatalogData, saveCatalogData, getMarqueeData, saveMarqueeData } from './services/dbService';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Row from './components/Row';
import Modal from './components/Modal';
import AdminPanel from './components/AdminPanel';
import VideoPlayer from './components/VideoPlayer';
import MovieCard from './components/MovieCard';
import Contact from './components/Contact';
import About from './components/About';
import { Search } from 'lucide-react';

// Default initial state for the marquee
const DEFAULT_MARQUEE: MarqueeItem[] = [
  { id: '1', text: 'CURATED PIECES', link: '' },
  { id: '2', text: 'WATCH MY REELS', link: 'https://instagram.com' },
  { id: '3', text: 'YO! REACH OUT', link: 'mailto:contact@jamesfcoton.com' },
  { id: '4', text: 'NEW COLLECTION 2025', link: '' },
  { id: '5', text: 'STREAMING NOW', link: '' },
];

const App: React.FC = () => {
  const [data, setData] = useState<CatalogData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [playingMovie, setPlayingMovie] = useState<Movie | null>(null);
  
  // Navigation State
  const [searchQuery, setSearchQuery] = useState("");
  const [currentView, setCurrentView] = useState<'home' | 'about' | 'contact'>('home');

  const [marqueeItems, setMarqueeItems] = useState<MarqueeItem[]>(DEFAULT_MARQUEE);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  
  const [adminPassword, setAdminPassword] = useState(() => {
    return localStorage.getItem('jamesfcoton_password') || "admin123";
  });

  // Load Marquee
  useEffect(() => {
      const loadMarquee = async () => {
          const cloudMarquee = await getMarqueeData();
          if (cloudMarquee) {
              setMarqueeItems(cloudMarquee);
          } else {
             const local = localStorage.getItem('jamesfcoton_marquee');
             if (local) setMarqueeItems(JSON.parse(local));
          }
      };
      loadMarquee();
  }, []);

  // Handle Marquee Updates
  const handleUpdateMarquee = (items: MarqueeItem[]) => {
      setMarqueeItems(items);
      saveMarqueeData(items);
  };

  // Persist Password Changes
  useEffect(() => {
    localStorage.setItem('jamesfcoton_password', adminPassword);
  }, [adminPassword]);

  // Helper to migrate old gallery strings to GalleryItem objects
  const migrateGallery = (movie: any) => {
    if (movie.gallery && movie.gallery.length > 0 && typeof movie.gallery[0] === 'string') {
        movie.gallery = movie.gallery.map((url: string) => ({ url, type: 'image' }));
    }
    return movie;
  };

  // Catalog Persistence logic
  useEffect(() => {
    const init = async () => {
      setLoading(true);
      
      try {
        const savedCatalog = await getCatalogData();
        
        if (savedCatalog) {
           let parsed = savedCatalog;
           let allMovies: any[] = [];
           if (parsed.highlight) {
             parsed.highlight = migrateGallery(parsed.highlight);
             allMovies.push(parsed.highlight);
           }
           if (parsed.top10) {
             parsed.top10 = parsed.top10.map(migrateGallery);
             allMovies.push(...parsed.top10);
           }
           if (parsed.categories) {
             parsed.categories = parsed.categories.map((c: any) => ({
               ...c,
               movies: c.movies.map((m: any) => {
                 const migrated = migrateGallery(m);
                 allMovies.push(migrated);
                 return migrated;
               })
             }));
           }

           if (!parsed.library) {
              console.log("Migrating data structure (Library rebuild)...");
              parsed.library = Array.from(new Map(allMovies.map((m: any) => [m.id, m])).values());
           } else {
             parsed.library = parsed.library.map(migrateGallery);
           }

           setData(parsed);
           setLoading(false);
           return;
        }
      } catch (e) {
        console.error("Failed to load catalog from storage");
      }

      const catalog = await fetchCatalog();
      setData(catalog);
      await saveCatalogData(catalog);
      setLoading(false);
    };
    init();
  }, []);

  const handleUpdateCatalog = (newData: CatalogData) => {
      setData(newData);
      saveCatalogData(newData);
  };

  // Apply Theme Color
  useEffect(() => {
    if (data?.themeColor) {
        document.documentElement.style.setProperty('--theme-color', data.themeColor);
    }
  }, [data?.themeColor]);

  const handleMovieClick = (movie: Movie) => {
    setSelectedMovie(movie);
  };

  const handleCloseModal = () => {
    setSelectedMovie(null);
  };

  const handlePlayMovie = (movie: Movie) => {
    if (movie.vimeoUrl) {
      setPlayingMovie(movie);
    } else {
      alert("No full film available for this project yet.");
    }
  };

  const handleNavigate = (view: 'home' | 'about' | 'contact') => {
      setCurrentView(view);
      setSearchQuery(""); // Clear search when changing main views
      window.scrollTo(0, 0);
  };

  const handleSearch = (query: string) => {
      setSearchQuery(query);
      if (query) {
          setCurrentView('home'); // Reset to home view context when searching
      }
  };

  // Filter Logic for Smart Search
  const searchResults = useMemo(() => {
    if (!data || !searchQuery) return [];
    const query = searchQuery.toLowerCase();
    
    const scoredMovies = data.library.map(movie => {
        let score = 0;
        if (movie.title.toLowerCase().includes(query)) score += 10;
        if (movie.genre.toLowerCase().includes(query)) score += 5;
        if (movie.tags?.some(tag => tag.toLowerCase().includes(query))) score += 5;

        if (movie.aiAnalysis) {
            if (movie.aiAnalysis.industry.toLowerCase().includes(query)) score += 5;
            if (movie.aiAnalysis.mood_vibe.some(m => m.toLowerCase().includes(query))) score += 8;
            if (movie.aiAnalysis.keywords.some(k => k.toLowerCase().includes(query))) score += 4;
            if (movie.aiAnalysis.visual_elements.some(v => v.toLowerCase().includes(query))) score += 4;
            if (movie.aiAnalysis.synopsis_pitch.toLowerCase().includes(query)) score += 2;
        }

        return { movie, score };
    });

    return scoredMovies
        .filter(item => item.score > 0)
        .sort((a, b) => b.score - a.score)
        .map(item => item.movie);
        
  }, [data, searchQuery]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white space-y-4">
        <div className="w-16 h-16 bg-accent animate-spin"></div>
        <p className="text-accent font-mono uppercase tracking-widest animate-pulse">Initializing Interface...</p>
      </div>
    );
  }

  // --- RENDER CONTENT BASED ON VIEW STATE ---
  const renderContent = () => {
      if (searchQuery) {
          return (
            <div className="pt-32 px-4 md:px-12 animate-in fade-in duration-300">
                <div className="flex items-end gap-4 border-b border-white/20 pb-4 mb-8">
                    <div className="w-4 h-4 bg-accent"></div>
                    <h2 className="text-3xl md:text-5xl font-black uppercase italic tracking-tighter">
                        CURATED FILMS
                    </h2>
                    <span className="text-gray-500 font-mono text-xl uppercase">"{searchQuery}"</span>
                </div>

                {searchResults.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {searchResults.map(movie => (
                            <div key={movie.id} className="w-full">
                                <MovieCard 
                                    movie={movie} 
                                    onClick={handleMovieClick}
                                    isLarge={false}
                                />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-gray-500 space-y-4">
                        <Search className="w-16 h-16 opacity-20" />
                        <p className="font-mono uppercase tracking-widest">No matching projects found in database.</p>
                    </div>
                )}
            </div>
          );
      }

      if (currentView === 'contact' && data) {
          return <Contact data={data} />;
      }

      if (currentView === 'about' && data) {
          return <About data={data} />;
      }

      // Default Home View
      return (
        <>
            <Hero 
              movie={data?.highlight || null} 
              onMoreInfo={handleMovieClick}
              onPlay={handlePlayMovie}
              badgeText={data?.heroBadgeText || "NEW ARRIVAL"}
              badgeColor={data?.heroBadgeColor}
            />

            <div className="relative z-20 space-y-4 pt-12">
              {data?.top10 && data.top10.length > 0 && (
                <Row 
                  title={data.top10Title || "Top 10 / Trending"}
                  movies={data.top10} 
                  isRanked 
                  onMovieClick={handleMovieClick}
                />
              )}

              {data?.categories.map((category) => (
                <Row 
                  key={category.id} 
                  title={category.title} 
                  movies={category.movies}
                  onMovieClick={handleMovieClick}
                />
              ))}
            </div>
        </>
      );
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-accent selection:text-black overflow-x-hidden">
      <Navbar 
        marqueeItems={marqueeItems} 
        marqueeColor={data?.marqueeColor} 
        marqueeTextColor={data?.marqueeTextColor}
        onSearch={handleSearch}
        searchQuery={searchQuery}
        onNavigate={handleNavigate}
        currentView={currentView}
      />
      
      <main className="pb-20 min-h-screen">
        {renderContent()}
      </main>

      <footer className="py-24 px-12 border-t border-white/20 bg-black relative">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start gap-12">
            <div>
                 <h2 className="text-4xl font-black italic text-white mb-6 uppercase">JAMES F COTON<span className="text-accent">.</span></h2>
                 <p className="text-gray-500 font-mono max-w-sm">
                    AI CURATED CONTENT FOR THE MODERN ERA. 
                    EST. 2024. BRUTALIST DESIGN SYSTEM.
                 </p>
            </div>
            <div className="grid grid-cols-2 gap-12 font-mono text-sm uppercase text-gray-400">
                <div className="flex flex-col gap-4">
                    <button onClick={() => handleNavigate('home')} className="hover:text-accent text-left">Home</button>
                    <button onClick={() => handleNavigate('about')} className="hover:text-accent text-left">About</button>
                    <button onClick={() => handleNavigate('contact')} className="hover:text-accent text-left">Contact</button>
                </div>
                <div className="flex flex-col gap-4">
                    <a href="https://instagram.com" target="_blank" className="hover:text-accent">Instagram</a>
                    <a href="https://vimeo.com" target="_blank" className="hover:text-accent">Vimeo</a>
                    <a href="https://twitter.com" target="_blank" className="hover:text-accent">Twitter</a>
                </div>
            </div>
        </div>
        
        <div className="text-center mt-20 relative">
          <p className="text-gray-700 font-mono text-xs">© 2024 JAMES F COTON. AI GENERATED INTERFACE.</p>
          
          <button 
            onClick={() => setIsAdminOpen(true)}
            className="absolute -bottom-10 left-1/2 transform -translate-x-1/2 text-black hover:text-gray-900 transition-colors font-serif italic text-lg opacity-50 hover:opacity-100 p-4"
            title="System Access"
          >
            π
          </button>
        </div>
      </footer>

      <Modal 
        movie={selectedMovie} 
        onClose={handleCloseModal} 
        onPlay={handlePlayMovie}
      />

      {playingMovie && playingMovie.vimeoUrl && (
        <VideoPlayer 
          vimeoUrl={playingMovie.vimeoUrl} 
          onClose={() => setPlayingMovie(null)} 
        />
      )}

      {isAdminOpen && data && (
        <AdminPanel 
          isOpen={isAdminOpen} 
          onClose={() => setIsAdminOpen(false)} 
          marqueeItems={marqueeItems}
          onUpdateMarquee={handleUpdateMarquee}
          currentPassword={adminPassword}
          onUpdatePassword={setAdminPassword}
          catalogData={data}
          onUpdateCatalog={handleUpdateCatalog}
        />
      )}
    </div>
  );
};

export default App;
