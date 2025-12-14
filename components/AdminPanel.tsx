
import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Shield, Layout, LogOut, Disc, Terminal, Save, FolderOpen, ChevronRight, Image, Database, Layers, Check, RefreshCcw, Upload, FileVideo, FileImage, ArrowUp, ArrowDown, GripVertical, MonitorPlay, Search, Tag, Images, Video, Hash, Download, Loader2, Copy, ExternalLink, Cloud, User, Clock, BrainCircuit, Sparkles, Film, Eye, ScanLine, AlertTriangle, FileText } from 'lucide-react';
import { MarqueeItem, CatalogData, Movie, GalleryItem } from '../types';
import { uploadFile, getFiles, deleteFile, StorageFile } from '../services/storageService';
import { storage } from '../services/firebaseConfig';

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
  marqueeItems: MarqueeItem[];
  onUpdateMarquee: (items: MarqueeItem[]) => void;
  currentPassword: string;
  onUpdatePassword: (pass: string) => void;
  catalogData: CatalogData;
  onUpdateCatalog: (data: CatalogData) => void;
}

type Tab = 'banner' | 'security' | 'projects' | 'sections' | 'storage' | 'pages';
type StorageFolder = 'all' | 'images' | 'videos' | 'gallery' | 'uploads';

const AdminPanel: React.FC<AdminPanelProps> = ({ 
  isOpen, 
  onClose, 
  marqueeItems, 
  onUpdateMarquee,
  currentPassword,
  onUpdatePassword,
  catalogData,
  onUpdateCatalog
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<Tab>('banner');
  const [isUploading, setIsUploading] = useState(false);
  
  // Banner State
  const [newItemText, setNewItemText] = useState("");
  const [newItemLink, setNewItemLink] = useState("");

  // Security State
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [passSuccess, setPassSuccess] = useState("");

  // PROJECT MANAGEMENT (Global DB) State
  const [projectSearch, setProjectSearch] = useState("");
  const [selectedProject, setSelectedProject] = useState<Movie | null>(null);
  const [projectForm, setProjectForm] = useState<Partial<Movie>>({});
  const [newTagInput, setNewTagInput] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false); 

  // SECTIONS MANAGEMENT State
  const [selectedSection, setSelectedSection] = useState<string>("highlight"); // 'highlight', 'top10', or category ID
  const [isAddMovieOpen, setIsAddMovieOpen] = useState(false);
  const [addMovieSearch, setAddMovieSearch] = useState("");
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [draggedCategoryIndex, setDraggedCategoryIndex] = useState<number | null>(null);

  // STORAGE MANAGEMENT State
  const [storageFolder, setStorageFolder] = useState<StorageFolder>('all');
  const [storageFiles, setStorageFiles] = useState<StorageFile[]>([]);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);
  
  // PAGES MANAGEMENT State
  const [pagesForm, setPagesForm] = useState<{
      aboutText: string;
      aboutImage: string;
      contactText: string;
      emailPersonal: string;
      emailAgent: string;
  }>({
      aboutText: catalogData.aboutText || "",
      aboutImage: catalogData.aboutImage || "",
      contactText: catalogData.contactText || "",
      emailPersonal: catalogData.emailPersonal || "",
      emailAgent: catalogData.emailAgent || ""
  });

  // Sync edit form when movie selected
  useEffect(() => {
    if (selectedProject) {
        setProjectForm({ 
            ...selectedProject,
            tags: selectedProject.tags || [] // Ensure tags is always an array
        });
        setShowDeleteConfirm(false);
    } else {
        setProjectForm({});
    }
  }, [selectedProject]);

  // Load files when storage tab or folder changes
  useEffect(() => {
    if (isAuthenticated && activeTab === 'storage') {
        loadStorageFiles();
    }
  }, [activeTab, storageFolder, isAuthenticated]);

  const loadStorageFiles = async () => {
      setIsLoadingFiles(true);
      let files: StorageFile[] = [];

      if (storageFolder === 'all') {
          // Scan all folders
          const folders = ['images', 'videos', 'gallery', 'uploads'];
          const results = await Promise.all(folders.map(f => getFiles(f)));
          files = results.flat();
      } else {
          files = await getFiles(storageFolder);
      }

      // Sort by creation time (Newest First)
      files.sort((a, b) => new Date(b.timeCreated).getTime() - new Date(a.timeCreated).getTime());

      setStorageFiles(files);
      setIsLoadingFiles(false);
  };

  if (!isOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === currentPassword) {
      setIsAuthenticated(true);
      setError("");
    } else {
      setError("ACCESS DENIED. INVALID CREDENTIALS.");
    }
  };

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemText.trim()) return;

    const newItem: MarqueeItem = {
      id: Date.now().toString(),
      text: newItemText,
      link: newItemLink
    };

    onUpdateMarquee([...marqueeItems, newItem]);
    setNewItemText("");
    setNewItemLink("");
  };

  const handleDeleteItem = (id: string) => {
    onUpdateMarquee(marqueeItems.filter(item => item.id !== id));
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPass !== confirmPass) {
        setPassSuccess("");
        setError("Passwords do not match.");
        return;
    }
    if (newPass.length < 4) {
        setPassSuccess("");
        setError("Password too short.");
        return;
    }
    onUpdatePassword(newPass);
    setPassSuccess("CREDENTIALS UPDATED SUCCESSFULLY.");
    setError("");
    setNewPass("");
    setConfirmPass("");
    setTimeout(() => setPassSuccess(""), 3000);
  };

  // --- PROJECT DB HANDLERS ---
  
  const handleCreateProject = () => {
    const newId = `p${Date.now()}`;
    const emptyMovie: Movie = {
        id: newId,
        title: "NEW PROJECT",
        description: "",
        genre: "General",
        rating: 0,
        year: 2025,
        quality: "HD",
        matchPercentage: 0,
        crew: "",
        imageUrl: "https://picsum.photos/seed/new/1920/1080",
        backdropUrl: "https://picsum.photos/seed/new/1920/1080",
        gallery: [],
        tags: []
    };
    
    // Update Library
    const newLibrary = [emptyMovie, ...catalogData.library];
    onUpdateCatalog({ ...catalogData, library: newLibrary });
    setSelectedProject(emptyMovie);
  };

  const handleSaveProject = () => {
    if (!selectedProject || !projectForm.id) return;
    
    const updatedMovie = { ...selectedProject, ...projectForm } as Movie;
    
    // 1. Update Library
    const newLibrary = catalogData.library.map(m => m.id === updatedMovie.id ? updatedMovie : m);
    
    // 2. Propagate changes to all sections (Highlight, Top10, Categories)
    let newData = { ...catalogData, library: newLibrary };
    
    // Update Highlight
    if (newData.highlight.id === updatedMovie.id) newData.highlight = updatedMovie;
    
    // Update Top 10
    newData.top10 = newData.top10.map(m => m.id === updatedMovie.id ? updatedMovie : m);
    
    // Update Categories
    newData.categories = newData.categories.map(c => ({
        ...c,
        movies: c.movies.map(m => m.id === updatedMovie.id ? updatedMovie : m)
    }));

    onUpdateCatalog(newData);
    setSelectedProject(updatedMovie);
  };

  const executeDeleteProject = () => {
      if (!selectedProject) return;
      const id = selectedProject.id;
      const newLibrary = catalogData.library.filter(m => m.id !== id);
      let newData = { ...catalogData, library: newLibrary };
      newData.top10 = newData.top10.filter(m => m.id !== id);
      newData.categories = newData.categories.map(c => ({
          ...c,
          movies: c.movies.filter(m => m.id !== id)
      }));

      if (newData.highlight.id === id) {
          if (newLibrary.length > 0) {
              newData.highlight = newLibrary[0];
          } else {
             newData.highlight = { ...selectedProject, id: "empty", title: "No Projects" }; 
          }
      }

      onUpdateCatalog(newData);
      setSelectedProject(null);
      setShowDeleteConfirm(false); 
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: 'imageUrl' | 'videoUrl' | 'heroUrl') => {
      if (e.target.files && e.target.files[0]) {
          setIsUploading(true);
          try {
              const file = e.target.files[0];
              const folder = field === 'videoUrl' ? 'videos' : 'images';
              const downloadURL = await uploadFile(file, folder);
              setProjectForm({ ...projectForm, [field]: downloadURL });
          } catch (err: any) {
              console.error("Upload Error:", err);
              if (err.code === 'storage/unauthorized') {
                 alert("Upload Failed: Permission Denied.");
              } else {
                 alert(`Upload Failed: ${err.message}`);
              }
          } finally {
              setIsUploading(false);
          }
      }
  };
  
  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
          setIsUploading(true);
          try {
              const newItems: GalleryItem[] = [];
              const files = Array.from(e.target.files) as File[];
              for (const file of files) {
                  const url = await uploadFile(file, 'gallery');
                  newItems.push({
                      url,
                      type: file.type.startsWith('video') ? 'video' : 'image'
                  });
              }
              const currentGallery = projectForm.gallery || [];
              setProjectForm({ ...projectForm, gallery: [...currentGallery, ...newItems] });
          } catch (err: any) {
             alert(`Upload Failed: ${err.message}`);
          } finally {
              setIsUploading(false);
          }
      }
  };

  const handleRemoveGalleryImage = (index: number) => {
      const currentGallery = projectForm.gallery || [];
      const newGallery = currentGallery.filter((_, i) => i !== index);
      setProjectForm({ ...projectForm, gallery: newGallery });
  };
  
  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        e.stopPropagation();
        addTag();
    }
  };

  const addTag = () => {
    if (newTagInput.trim()) {
        const words = newTagInput.split(/[\s,]+/);
        const validTags = words.filter(w => w.trim().length > 0);

        setProjectForm(prev => {
            const currentTags = prev.tags || [];
            const merged = new Set([...currentTags, ...validTags]);
            return { ...prev, tags: Array.from(merged) };
        });
        setNewTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
      setProjectForm(prev => ({
          ...prev,
          tags: (prev.tags || []).filter(t => t !== tagToRemove)
      }));
  };

  // --- SECTIONS HANDLERS ---
  const handleAddMovieToSection = (movie: Movie) => {
      let newData = { ...catalogData };
      if (selectedSection === 'highlight') {
          newData.highlight = movie; 
      } else if (selectedSection === 'top10') {
          if (!newData.top10.find(m => m.id === movie.id)) {
              newData.top10 = [...newData.top10, movie];
          }
      } else {
          newData.categories = newData.categories.map(c => {
              if (c.id === selectedSection) {
                  if (c.movies.find(m => m.id === movie.id)) return c;
                  return { ...c, movies: [...c.movies, movie] };
              }
              return c;
          });
      }
      onUpdateCatalog(newData);
      setIsAddMovieOpen(false);
  };

  const handleRemoveMovieFromSection = (movieId: string) => {
    let newData = { ...catalogData };
    if (selectedSection === 'top10') {
        newData.top10 = newData.top10.filter(m => m.id !== movieId);
    } else {
        newData.categories = newData.categories.map(c => {
            if (c.id === selectedSection) {
                return { ...c, movies: c.movies.filter(m => m.id !== movieId) };
            }
            return c;
        });
    }
    onUpdateCatalog(newData);
  };

  const handleDragStart = (e: React.DragEvent, index: number) => { setDraggedIndex(index); e.dataTransfer.effectAllowed = "move"; };
  const handleDragOver = (e: React.DragEvent, index: number) => { e.preventDefault(); e.dataTransfer.dropEffect = "move"; };
  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
      e.preventDefault();
      if (draggedIndex === null || draggedIndex === dropIndex) return;

      let newData = { ...catalogData };
      let list: Movie[] = [];
      if (selectedSection === 'top10') list = [...newData.top10];
      else if (selectedSection !== 'highlight') {
          const cat = newData.categories.find(c => c.id === selectedSection);
          if (!cat) return;
          list = [...cat.movies];
      } else return;

      const itemToMove = list[draggedIndex];
      list.splice(draggedIndex, 1);
      list.splice(dropIndex, 0, itemToMove);

      if (selectedSection === 'top10') newData.top10 = list;
      else newData.categories = newData.categories.map(c => c.id === selectedSection ? { ...c, movies: list } : c);

      onUpdateCatalog(newData);
      setDraggedIndex(null);
  };
  
  const handleCategoryDragStart = (e: React.DragEvent, index: number) => { setDraggedCategoryIndex(index); e.dataTransfer.effectAllowed = "move"; e.stopPropagation(); };
  const handleCategoryDragOver = (e: React.DragEvent, index: number) => { e.preventDefault(); e.dataTransfer.dropEffect = "move"; };
  const handleCategoryDrop = (e: React.DragEvent, dropIndex: number) => {
      e.preventDefault();
      e.stopPropagation();
      if (draggedCategoryIndex === null || draggedCategoryIndex === dropIndex) return;
      const newCategories = [...catalogData.categories];
      const itemToMove = newCategories[draggedCategoryIndex];
      newCategories.splice(draggedCategoryIndex, 1);
      newCategories.splice(dropIndex, 0, itemToMove);
      onUpdateCatalog({ ...catalogData, categories: newCategories });
      setDraggedCategoryIndex(null);
  };

  const handleAddCategory = () => {
      const title = prompt("Enter Category Title:");
      if (!title) return;
      const newCat = { id: `c${Date.now()}`, title, movies: [] };
      onUpdateCatalog({ ...catalogData, categories: [...catalogData.categories, newCat]});
      setSelectedSection(newCat.id);
  };

  const handleUpdateCategoryTitle = (id: string, newTitle: string) => {
      if (id === 'highlight') onUpdateCatalog({ ...catalogData, highlightTitle: newTitle });
      else if (id === 'top10') onUpdateCatalog({ ...catalogData, top10Title: newTitle });
      else {
          const newCategories = catalogData.categories.map(c => c.id === id ? { ...c, title: newTitle } : c);
          onUpdateCatalog({ ...catalogData, categories: newCategories });
      }
  };

  const handleUpdateBadgeText = (newText: string) => { onUpdateCatalog({ ...catalogData, heroBadgeText: newText }); };
  const handleUpdateBadgeColor = (newColor: string) => { onUpdateCatalog({ ...catalogData, heroBadgeColor: newColor }); };

  const handleDeleteCategory = (id: string) => {
      if (confirm("Are you sure you want to delete this section?")) {
          const newCategories = catalogData.categories.filter(c => c.id !== id);
          onUpdateCatalog({ ...catalogData, categories: newCategories });
          setSelectedSection('top10');
      }
  };

  // --- STORAGE TAB HANDLERS ---
  const handleStorageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
          setIsUploading(true);
          try {
              const targetFolder = storageFolder === 'all' ? 'uploads' : storageFolder;
              const files = Array.from(e.target.files) as File[];
              for (const file of files) {
                  await uploadFile(file, targetFolder);
              }
              await loadStorageFiles(); // Refresh list
          } catch (err) {
              alert("Upload failed. Check permissions.");
          } finally {
              setIsUploading(false);
          }
      }
  };

  const handleDeleteStorageFile = async (fullPath: string) => {
      if (confirm("Permanently delete this file from storage?")) {
          try {
              await deleteFile(fullPath);
              setStorageFiles(prev => prev.filter(f => f.fullPath !== fullPath));
          } catch (err) {
              alert("Delete failed.");
          }
      }
  };

  const copyToClipboard = (text: string) => {
      navigator.clipboard.writeText(text);
      alert("URL Copied to Clipboard!");
  };

  // --- PAGES HANDLERS ---
  const handlePagesSave = () => {
      onUpdateCatalog({
          ...catalogData,
          aboutText: pagesForm.aboutText,
          aboutImage: pagesForm.aboutImage,
          contactText: pagesForm.contactText,
          emailPersonal: pagesForm.emailPersonal,
          emailAgent: pagesForm.emailAgent
      });
      alert("Pages Updated Successfully!");
  };

  const handlePagesImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
        setIsUploading(true);
        try {
            const file = e.target.files[0];
            const url = await uploadFile(file, 'images');
            setPagesForm({ ...pagesForm, aboutImage: url });
        } catch (err) {
            alert("Upload Failed");
        } finally {
            setIsUploading(false);
        }
    }
  };


  // Renderers
  const renderProjectList = () => {
    const filtered = catalogData.library.filter(m => 
        m.title.toLowerCase().includes(projectSearch.toLowerCase()) || 
        m.tags?.some(tag => tag.toLowerCase().includes(projectSearch.toLowerCase()))
    );

    return (
        <div className="grid gap-2">
            <button 
                onClick={handleCreateProject}
                className="w-full py-3 border border-dashed border-white/30 text-white/50 hover:text-accent hover:border-accent uppercase text-xs font-bold tracking-widest mb-4 flex items-center justify-center gap-2"
            >
                <Plus className="w-4 h-4" /> New Project
            </button>

            {filtered.map(m => (
                <button 
                    key={m.id} 
                    onClick={() => setSelectedProject(m)}
                    className={`flex items-center gap-3 p-3 border text-left transition-all group ${selectedProject?.id === m.id ? 'bg-accent text-black border-accent' : 'bg-black border-white/20 text-gray-400 hover:text-white hover:border-white'}`}
                >
                    <div className="aspect-video w-16 h-9 overflow-hidden bg-gray-800 flex-none">
                        <img src={m.imageUrl} className="w-full h-full object-cover grayscale group-hover:grayscale-0" alt="" />
                    </div>
                    <div className="overflow-hidden">
                        <div className="font-bold uppercase truncate text-sm">{m.title}</div>
                        <div className="text-[10px] font-mono opacity-70 flex gap-2">
                             <span>{m.year}</span>
                             <span>•</span>
                             <span>{m.genre}</span>
                        </div>
                    </div>
                    <ChevronRight className="w-4 h-4 ml-auto opacity-50" />
                </button>
            ))}
        </div>
    );
  };

  // Login Screen
  if (!isAuthenticated) {
      return (
        <div className="fixed inset-0 z-[100] bg-black text-white font-mono flex flex-col items-center justify-center p-4">
             <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>
             
             <div className="z-10 w-full max-w-md bg-neutral-900 border-2 border-accent p-8 shadow-[0_0_50px_rgba(var(--theme-color-rgb),0.15)]">
                <div className="flex justify-center mb-8">
                    <div className="w-20 h-20 bg-accent flex items-center justify-center">
                        <Terminal className="w-10 h-10 text-black" />
                    </div>
                </div>
                
                <h2 className="text-2xl font-black text-center mb-2 uppercase tracking-tighter text-white">JAMES F COTON BACKEND</h2>
                <p className="text-center text-gray-500 text-xs mb-8 uppercase tracking-widest">Restricted Access // Auth Required</p>

                <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                        <input 
                        type="password" 
                        value={passwordInput}
                        onChange={(e) => setPasswordInput(e.target.value)}
                        className="w-full bg-black border border-gray-700 p-4 text-center text-xl tracking-[0.5em] text-accent focus:border-accent focus:outline-none placeholder-gray-800 transition-all"
                        placeholder="••••••"
                        autoFocus
                        autoComplete="off"
                        />
                    </div>
                    {error && <p className="text-red-500 text-xs text-center font-bold animate-pulse">{error}</p>}
                    
                    <button type="submit" className="w-full bg-white text-black font-black uppercase py-4 hover:bg-accent transition-colors tracking-widest text-sm">
                        Enter System
                    </button>
                    
                    <button type="button" onClick={onClose} className="w-full text-gray-600 text-xs uppercase hover:text-white transition-colors">
                        Abort Connection
                    </button>
                </form>
             </div>
        </div>
      );
  }

  return (
    <div className="fixed inset-0 z-[100] bg-neutral-950 text-white font-mono flex flex-col md:flex-row">
      {/* Sidebar */}
      <div className="w-full md:w-64 border-r border-white/10 flex flex-col justify-between bg-black z-20">
        <div>
            <div className="h-20 flex items-center justify-center md:justify-start md:px-6 border-b border-white/10 relative overflow-hidden">
                <div className="w-8 h-8 bg-accent flex items-center justify-center mr-0 md:mr-3 z-10">
                    <span className="text-black font-bold">J</span>
                </div>
                <span className="hidden md:block font-bold tracking-widest z-10">BACKEND</span>
                
                {/* Visual Connection Status */}
                {storage ? (
                    <div className="absolute top-2 right-2 flex items-center gap-1 bg-green-900/50 border border-green-500/50 px-2 py-0.5 rounded-full z-20">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-[8px] text-green-500 font-bold uppercase">Online</span>
                    </div>
                ) : (
                    <div className="absolute top-2 right-2 flex items-center gap-1 bg-red-900/50 border border-red-500/50 px-2 py-0.5 rounded-full z-20">
                        <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                        <span className="text-[8px] text-red-500 font-bold uppercase">Offline</span>
                    </div>
                )}
            </div>

            <nav className="p-4 flex flex-row md:flex-col gap-2 overflow-x-auto">
                <button 
                    onClick={() => setActiveTab('banner')}
                    className={`flex-none w-auto md:w-full flex items-center gap-4 p-3 transition-colors uppercase text-sm font-bold ${activeTab === 'banner' ? 'bg-accent text-black' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                >
                    <Layout className="w-5 h-5" />
                    <span className="hidden md:block">Live Config</span>
                </button>
                <button 
                    onClick={() => setActiveTab('projects')}
                    className={`flex-none w-auto md:w-full flex items-center gap-4 p-3 transition-colors uppercase text-sm font-bold ${activeTab === 'projects' ? 'bg-accent text-black' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                >
                    <Database className="w-5 h-5" />
                    <span className="hidden md:block">Projects</span>
                </button>
                <button 
                    onClick={() => setActiveTab('storage')}
                    className={`flex-none w-auto md:w-full flex items-center gap-4 p-3 transition-colors uppercase text-sm font-bold ${activeTab === 'storage' ? 'bg-accent text-black' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                >
                    <Cloud className="w-5 h-5" />
                    <span className="hidden md:block">Media Library</span>
                </button>
                <button 
                    onClick={() => setActiveTab('sections')}
                    className={`flex-none w-auto md:w-full flex items-center gap-4 p-3 transition-colors uppercase text-sm font-bold ${activeTab === 'sections' ? 'bg-accent text-black' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                >
                    <Layers className="w-5 h-5" />
                    <span className="hidden md:block">Sections</span>
                </button>
                <button 
                    onClick={() => setActiveTab('pages')}
                    className={`flex-none w-auto md:w-full flex items-center gap-4 p-3 transition-colors uppercase text-sm font-bold ${activeTab === 'pages' ? 'bg-accent text-black' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                >
                    <FileText className="w-5 h-5" />
                    <span className="hidden md:block">Pages</span>
                </button>
                <button 
                    onClick={() => setActiveTab('security')}
                    className={`flex-none w-auto md:w-full flex items-center gap-4 p-3 transition-colors uppercase text-sm font-bold ${activeTab === 'security' ? 'bg-accent text-black' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                >
                    <Shield className="w-5 h-5" />
                    <span className="hidden md:block">Security</span>
                </button>
            </nav>
        </div>

        <div className="p-4 border-t border-white/10 hidden md:block">
            <button onClick={onClose} className="w-full flex items-center gap-4 p-3 text-red-500 hover:bg-red-500/10 transition-colors uppercase text-sm font-bold">
                <LogOut className="w-5 h-5" />
                <span className="hidden md:block">Exit System</span>
            </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        <header className="h-16 md:h-20 border-b border-white/10 flex items-center justify-between px-4 md:px-8 bg-neutral-900/50 flex-none">
             <h1 className="text-lg md:text-xl font-black uppercase tracking-widest text-white flex items-center gap-2">
                {activeTab === 'banner' && 'Marquee Configuration'}
                {activeTab === 'projects' && 'Projects Database'}
                {activeTab === 'sections' && 'Section Curation'}
                {activeTab === 'storage' && 'Cloud Storage Manager'}
                {activeTab === 'pages' && 'Page Content'}
                {activeTab === 'security' && 'Account Security'}
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse ml-2"></span>
             </h1>
             <button onClick={onClose} className="md:hidden text-red-500"><LogOut className="w-6 h-6" /></button>
        </header>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-black/50 relative">
            
            {/* UPLOADING/ANALYZING OVERLAY */}
            {(isUploading) && (
                <div className="absolute inset-0 z-50 bg-black/80 flex flex-col items-center justify-center backdrop-blur-sm">
                    <Loader2 className="w-16 h-16 text-accent animate-spin mb-4" />
                    <p className="text-accent font-mono uppercase tracking-widest text-lg animate-pulse">
                        UPLOADING MEDIA...
                    </p>
                </div>
            )}

            {/* DELETE CONFIRMATION MODAL */}
            {showDeleteConfirm && (
                <div className="absolute inset-0 z-[200] bg-black/80 flex items-center justify-center backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-neutral-900 border border-red-500 p-8 max-w-sm w-full shadow-[0_0_50px_rgba(239,68,68,0.2)] flex flex-col items-center text-center">
                        <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-6">
                            <Trash2 className="w-8 h-8 text-red-500" />
                        </div>
                        <h3 className="text-red-500 font-bold uppercase text-2xl mb-2">Delete Project?</h3>
                        <p className="text-gray-400 text-sm mb-8 font-mono leading-relaxed">
                            Are you sure you want to permanently delete <br/>
                            <span className="text-white font-bold border-b border-white/20 pb-1">"{selectedProject?.title}"</span>? <br/>
                            This action cannot be undone.
                        </p>
                        <div className="flex gap-4 w-full">
                            <button 
                                onClick={() => setShowDeleteConfirm(false)}
                                className="flex-1 bg-transparent border border-white/20 text-white p-4 font-bold uppercase hover:bg-white/10 transition-colors tracking-widest text-xs"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={executeDeleteProject}
                                className="flex-1 bg-red-600 text-white p-4 font-bold uppercase hover:bg-red-700 transition-colors tracking-widest text-xs shadow-lg shadow-red-900/50"
                            >
                                Yes, Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* --- PAGES TAB --- */}
            {activeTab === 'pages' && (
                <div className="max-w-4xl mx-auto space-y-8">
                    {/* About Page Config */}
                    <div className="bg-neutral-900 border border-white/10 p-6 space-y-6">
                         <div className="flex items-center justify-between border-b border-white/10 pb-4">
                             <h3 className="text-accent font-bold uppercase tracking-widest">About Page</h3>
                             <button onClick={handlePagesSave} className="bg-white text-black px-4 py-2 text-xs font-bold uppercase hover:bg-accent transition-colors">
                                 Save Changes
                             </button>
                         </div>

                         <div className="grid md:grid-cols-2 gap-8">
                             <div className="space-y-4">
                                 <label className="text-xs text-gray-500 uppercase">Director Biography</label>
                                 <textarea 
                                     rows={10}
                                     value={pagesForm.aboutText}
                                     onChange={(e) => setPagesForm({...pagesForm, aboutText: e.target.value})}
                                     placeholder="Enter biography text here..."
                                     className="w-full bg-black border border-white/20 p-3 text-white text-sm font-mono focus:border-accent outline-none"
                                 />
                             </div>
                             <div className="space-y-4">
                                 <label className="text-xs text-gray-500 uppercase">Profile Image</label>
                                 <div className="aspect-[4/5] bg-black border border-white/20 relative group cursor-pointer overflow-hidden flex items-center justify-center">
                                     {pagesForm.aboutImage ? (
                                         <img src={pagesForm.aboutImage} className="w-full h-full object-cover opacity-50 group-hover:opacity-100 transition-opacity" />
                                     ) : (
                                         <User className="w-16 h-16 text-gray-700" />
                                     )}
                                     <input 
                                         type="file" 
                                         accept="image/*"
                                         onChange={handlePagesImageUpload}
                                         className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                     />
                                     <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                         <div className="bg-black/50 backdrop-blur px-4 py-2 border border-white/20 text-xs font-bold uppercase text-white group-hover:bg-accent group-hover:text-black transition-colors">
                                             Upload New
                                         </div>
                                     </div>
                                 </div>
                             </div>
                         </div>
                    </div>

                    {/* Contact Page Config */}
                    <div className="bg-neutral-900 border border-white/10 p-6 space-y-6">
                         <div className="flex items-center justify-between border-b border-white/10 pb-4">
                             <h3 className="text-accent font-bold uppercase tracking-widest">Contact Page</h3>
                         </div>

                         <div className="space-y-4">
                             <label className="text-xs text-gray-500 uppercase">Intro Text</label>
                             <textarea 
                                 rows={3}
                                 value={pagesForm.contactText}
                                 onChange={(e) => setPagesForm({...pagesForm, contactText: e.target.value})}
                                 className="w-full bg-black border border-white/20 p-3 text-white text-sm font-mono focus:border-accent outline-none"
                             />
                         </div>

                         <div className="grid md:grid-cols-2 gap-6">
                             <div className="space-y-2">
                                 <label className="text-xs text-gray-500 uppercase">Personal Email</label>
                                 <input 
                                     type="text" 
                                     value={pagesForm.emailPersonal}
                                     onChange={(e) => setPagesForm({...pagesForm, emailPersonal: e.target.value})}
                                     className="w-full bg-black border border-white/20 p-3 text-white text-sm font-mono focus:border-accent outline-none"
                                 />
                             </div>
                             <div className="space-y-2">
                                 <label className="text-xs text-gray-500 uppercase">Agent / Rep Email</label>
                                 <input 
                                     type="text" 
                                     value={pagesForm.emailAgent}
                                     onChange={(e) => setPagesForm({...pagesForm, emailAgent: e.target.value})}
                                     className="w-full bg-black border border-white/20 p-3 text-white text-sm font-mono focus:border-accent outline-none"
                                 />
                             </div>
                         </div>
                    </div>
                </div>
            )}

            {/* --- STORAGE TAB --- */}
            {activeTab === 'storage' && (
                <div className="h-full flex flex-col">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-2">
                            {(['all', 'images', 'videos', 'gallery', 'uploads'] as StorageFolder[]).map(folder => (
                                <button
                                    key={folder}
                                    onClick={() => setStorageFolder(folder)}
                                    className={`px-4 py-2 text-sm font-bold uppercase border transition-colors ${storageFolder === folder ? 'bg-accent text-black border-accent' : 'bg-black border-white/20 text-gray-400 hover:border-white'}`}
                                >
                                    {folder}
                                </button>
                            ))}
                        </div>
                        
                        <div className="relative overflow-hidden">
                            <button className="bg-white text-black px-4 py-2 font-bold uppercase text-sm flex items-center gap-2 hover:bg-accent transition-colors">
                                <Upload className="w-4 h-4" /> 
                                {storageFolder === 'all' ? 'Upload to /uploads' : `Upload to /${storageFolder}`}
                            </button>
                            <input 
                                type="file" 
                                multiple
                                onChange={handleStorageUpload}
                                className="absolute inset-0 opacity-0 cursor-pointer"
                            />
                        </div>
                    </div>

                    <div className="flex-1 bg-neutral-900 border border-white/10 p-4 overflow-y-auto custom-scrollbar">
                        {isLoadingFiles ? (
                            <div className="flex flex-col items-center justify-center h-40">
                                <Loader2 className="w-8 h-8 text-accent animate-spin" />
                                <p className="text-xs text-gray-500 mt-2 uppercase">Scanning Storage...</p>
                            </div>
                        ) : storageFiles.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-40 text-gray-600">
                                <Cloud className="w-12 h-12 opacity-20 mb-2" />
                                <p className="text-xs uppercase tracking-widest">Folder Empty</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                                {storageFiles.map((file) => (
                                    <div key={file.fullPath} className="group relative bg-black border border-white/10 aspect-square flex flex-col">
                                        <div className="flex-1 overflow-hidden relative bg-checkerboard">
                                            {file.type === 'image' && (
                                                <img src={file.url} className="w-full h-full object-cover" />
                                            )}
                                            {file.type === 'video' && (
                                                <video src={file.url} className="w-full h-full object-cover" />
                                            )}
                                            {file.type === 'unknown' && (
                                                <div className="w-full h-full flex items-center justify-center bg-gray-800 text-xs font-mono">FILE</div>
                                            )}
                                            
                                            {/* Uploader Badge */}
                                            <div className="absolute top-2 left-2 bg-black/70 backdrop-blur-sm border border-white/10 px-2 py-1 flex items-center gap-1.5 rounded-sm">
                                                <User className="w-3 h-3 text-accent" />
                                                <span className="text-[9px] font-mono text-white uppercase tracking-wider">{file.uploadedBy}</span>
                                            </div>

                                            {/* Hover Overlay */}
                                            <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                                                <div className="text-[9px] text-gray-400 font-mono mb-2 flex items-center gap-1">
                                                    <Clock className="w-3 h-3" />
                                                    {new Date(file.timeCreated).toLocaleDateString()}
                                                </div>
                                                <div className="flex gap-2">
                                                    <button 
                                                        onClick={() => copyToClipboard(file.url)}
                                                        className="bg-white/10 hover:bg-white text-white hover:text-black p-2 rounded-full transition-colors"
                                                        title="Copy URL"
                                                    >
                                                        <Copy className="w-4 h-4" />
                                                    </button>
                                                    <a 
                                                        href={file.url} 
                                                        target="_blank" 
                                                        rel="noreferrer"
                                                        className="bg-white/10 hover:bg-white text-white hover:text-black p-2 rounded-full transition-colors"
                                                        title="Open"
                                                    >
                                                        <ExternalLink className="w-4 h-4" />
                                                    </a>
                                                    <button 
                                                        onClick={() => handleDeleteStorageFile(file.fullPath)}
                                                        className="bg-red-500/20 hover:bg-red-500 text-red-500 hover:text-white p-2 rounded-full transition-colors"
                                                        title="Delete"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="p-2 border-t border-white/10 bg-neutral-900">
                                            <p className="text-[10px] font-mono truncate text-gray-400" title={file.name}>{file.name}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
            
            {/* ... Rest of code remains matching existing file ... */}
            {/* --- BANNER TAB --- */}
            {activeTab === 'banner' && (
                <div className="max-w-4xl mx-auto space-y-12">
                   {/* Theme Colors Configuration */}
                   <div className="bg-neutral-900 border border-white/10 p-6">
                        <h3 className="text-accent mb-6 uppercase tracking-widest font-bold text-sm border-b border-white/10 pb-2">Appearance & Colors</h3>
                        
                        <div className="grid md:grid-cols-3 gap-8">
                            {/* Global Theme */}
                            <div className="flex items-center gap-4">
                                <input 
                                    type="color" 
                                    value={catalogData.themeColor || "#CCFF00"}
                                    onChange={(e) => onUpdateCatalog({ ...catalogData, themeColor: e.target.value })}
                                    className="w-16 h-16 bg-transparent border-0 cursor-pointer p-0"
                                />
                                <div className="space-y-1">
                                    <p className="text-white font-bold uppercase">{catalogData.themeColor || "#CCFF00"}</p>
                                    <p className="text-gray-500 text-xs uppercase">Site Theme / Accent</p>
                                </div>
                            </div>
                            
                            {/* Background Text Color */}
                             <div className="flex items-center gap-4">
                                <input 
                                    type="color" 
                                    value={catalogData.marqueeTextColor || "#000000"}
                                    onChange={(e) => onUpdateCatalog({ ...catalogData, marqueeTextColor: e.target.value })}
                                    className="w-16 h-16 bg-transparent border-0 cursor-pointer p-0"
                                />
                                <div className="space-y-1">
                                    <p className="text-white font-bold uppercase">{catalogData.marqueeTextColor || "#000000"}</p>
                                    <p className="text-gray-500 text-xs uppercase">Ticker Text Color</p>
                                </div>
                            </div>

                             <div className="flex items-center gap-4">
                                <input 
                                    type="color" 
                                    value={catalogData.marqueeColor || catalogData.themeColor || "#CCFF00"}
                                    onChange={(e) => onUpdateCatalog({ ...catalogData, marqueeColor: e.target.value })}
                                    className="w-16 h-16 bg-transparent border-0 cursor-pointer p-0"
                                />
                                <div className="space-y-1">
                                    <p className="text-white font-bold uppercase">{catalogData.marqueeColor || "#CCFF00"}</p>
                                    <p className="text-gray-500 text-xs uppercase">Ticker Background</p>
                                </div>
                            </div>
                        </div>
                   </div>

                   {/* Marquee Elements */}
                   <div className="bg-neutral-900 border border-white/10 p-6">
                        <h3 className="text-accent mb-6 uppercase tracking-widest font-bold text-sm border-b border-white/10 pb-2">Add New Banner Element</h3>
                        <form onSubmit={handleAddItem} className="grid md:grid-cols-[2fr_2fr_auto] gap-4 items-end">
                            <div className="space-y-2">
                                <label className="text-xs text-gray-500 uppercase">Banner Text</label>
                                <input 
                                    type="text" 
                                    value={newItemText}
                                    onChange={(e) => setNewItemText(e.target.value)}
                                    placeholder="ENTER DISPLAY TEXT"
                                    className="w-full bg-black border border-white/20 p-3 text-white focus:border-accent focus:outline-none text-sm font-mono"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs text-gray-500 uppercase">Link URL (Optional)</label>
                                <input 
                                    type="text" 
                                    value={newItemLink}
                                    onChange={(e) => setNewItemLink(e.target.value)}
                                    placeholder="HTTPS://"
                                    className="w-full bg-black border border-white/20 p-3 text-white focus:border-accent focus:outline-none text-sm font-mono"
                                />
                            </div>
                            <button type="submit" className="bg-white text-black p-3 font-bold uppercase hover:bg-accent transition-colors flex items-center justify-center gap-2">
                                <Plus className="w-4 h-4" /> Add
                            </button>
                        </form>
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-gray-500 uppercase tracking-widest text-xs">Active Elements ({marqueeItems.length})</h3>
                        <div className="grid gap-2">
                            {marqueeItems.map((item) => (
                                <div key={item.id} className="flex items-center justify-between bg-neutral-900 p-4 border border-white/5 hover:border-accent transition-colors group">
                                    <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-6">
                                        <span className="text-white font-bold uppercase text-lg">{item.text}</span>
                                        {item.link && (
                                            <span className="text-xs text-accent bg-accent/10 px-2 py-1 rounded-none border border-accent/20 truncate max-w-[200px]">
                                                {item.link}
                                            </span>
                                        )}
                                    </div>
                                    <button 
                                        onClick={() => handleDeleteItem(item.id)}
                                        className="text-gray-600 hover:text-red-500 transition-colors p-2 hover:bg-red-500/10"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
            
            {/* --- SECURITY TAB --- */}
            {activeTab === 'security' && (
                <div className="max-w-2xl mx-auto pt-10">
                    <div className="bg-neutral-900 border border-white/10 p-8 space-y-6">
                        {/* ... Existing security content ... */}
                        <div className="flex items-center gap-4 text-accent mb-4">
                            <Shield className="w-8 h-8" />
                            <h3 className="text-xl font-black uppercase tracking-widest">Update Credentials</h3>
                        </div>
                        
                        <form onSubmit={handleChangePassword} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs text-gray-500 uppercase">New Password</label>
                                <input 
                                    type="password" 
                                    value={newPass}
                                    onChange={(e) => setNewPass(e.target.value)}
                                    className="w-full bg-black border border-white/20 p-4 text-white focus:border-accent focus:outline-none text-center tracking-[0.5em] text-xl"
                                    autoComplete="new-password"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs text-gray-500 uppercase">Confirm Password</label>
                                <input 
                                    type="password" 
                                    value={confirmPass}
                                    onChange={(e) => setConfirmPass(e.target.value)}
                                    className="w-full bg-black border border-white/20 p-4 text-white focus:border-accent focus:outline-none text-center tracking-[0.5em] text-xl"
                                    autoComplete="new-password"
                                />
                            </div>

                            {error && <p className="text-red-500 text-xs text-center font-bold animate-pulse">{error}</p>}
                            {passSuccess && <p className="text-accent text-xs text-center font-bold">{passSuccess}</p>}

                            <button type="submit" className="w-full bg-white text-black font-black uppercase py-4 hover:bg-accent transition-colors tracking-widest">
                                Update Password
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
