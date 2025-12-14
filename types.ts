
export interface GalleryItem {
  url: string;
  type: 'image' | 'video';
}

export interface AIAnalysis {
  industry: string;
  mood_vibe: string[];
  keywords: string[];
  synopsis_pitch: string;
  visual_elements: string[];
  color_dominance: string;
}

export interface Movie {
  id: string;
  title: string;
  description: string;
  genre: string;
  rating: number; // 1-10
  year: number;
  imageUrl?: string; 
  backdropUrl?: string;
  // New editable fields
  quality?: 'HD' | '4K' | '8K';
  matchPercentage?: number;
  crew?: string; // Free text for crew info
  videoUrl?: string; // Background video loop
  heroUrl?: string; // High-res static image for Hero
  vimeoUrl?: string; // Full film vimeo link
  downloadUrl?: string; // Download link for assets (Dropbox etc)
  gallery?: GalleryItem[]; // Array of media items for the gallery
  tags?: string[]; // Keywords for search
  
  // New Smart Curation Data
  aiAnalysis?: AIAnalysis;
}

export interface Category {
  id: string;
  title: string;
  movies: Movie[];
}

export interface CatalogData {
  library: Movie[]; // The master database of all projects
  highlight: Movie;
  top10: Movie[];
  categories: Category[];
  highlightTitle?: string;
  top10Title?: string;
  heroBadgeText?: string;
  heroBadgeColor?: string;
  marqueeColor?: string;
  marqueeTextColor?: string;
  themeColor?: string;
  
  // Pages Data
  aboutText?: string;
  aboutImage?: string;
  contactText?: string;
  emailPersonal?: string;
  emailAgent?: string;
}

export interface MarqueeItem {
  id: string;
  text: string;
  link: string;
}
