
import { GoogleGenAI, Type, Schema } from "@google/genai";
import { CatalogData, Movie, Category, GalleryItem, AIAnalysis } from "../types";

const apiKey = process.env.API_KEY || "";
const ai = new GoogleGenAI({ apiKey });

// --- HELPER: Mock Data Generators ---

const assignImages = (movie: any, index: number, isLandscape: boolean = false) => {
  const seed = movie.title.length + index + (movie.year || 2024);
  const width = isLandscape ? 1920 : 600;
  const height = isLandscape ? 1080 : 900;
  return `https://picsum.photos/seed/${seed}/${width}/${height}`;
};

const generateGallery = (movie: any): GalleryItem[] => {
    const seedBase = movie.title.length + (movie.year || 2024);
    return Array.from({ length: 8 }).map((_, i) => ({
        url: `https://picsum.photos/seed/${seedBase + i + 100}/1920/1080`,
        type: 'image'
    }));
};

const enrichMovie = (movie: any): Movie => ({
  ...movie,
  quality: movie.quality || '4K',
  matchPercentage: movie.matchPercentage || Math.floor(Math.random() * (99 - 80) + 80),
  crew: movie.crew || "Director: Unknown | DOP: Unknown",
  imageUrl: movie.imageUrl || "",
  backdropUrl: movie.backdropUrl || "",
  videoUrl: movie.videoUrl || "",
  heroUrl: movie.heroUrl || "",
  vimeoUrl: movie.vimeoUrl || "",
  downloadUrl: movie.downloadUrl || "",
  gallery: movie.gallery || generateGallery(movie),
  tags: movie.tags || [],
  aiAnalysis: movie.aiAnalysis || undefined
});

export const fetchCatalog = async (): Promise<CatalogData> => {
  if (!apiKey) {
    console.warn("No API Key found. Returning mock data.");
    return mockCatalog;
  }

  const schema: Schema = {
    type: Type.OBJECT,
    properties: {
      highlight: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          title: { type: Type.STRING },
          description: { type: Type.STRING },
          genre: { type: Type.STRING },
          rating: { type: Type.NUMBER },
          year: { type: Type.INTEGER },
        },
        required: ["id", "title", "description", "genre", "rating", "year"],
      },
      top10: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            genre: { type: Type.STRING },
            rating: { type: Type.NUMBER },
            year: { type: Type.INTEGER },
          },
          required: ["id", "title", "description", "genre", "rating", "year"],
        },
      },
      categories: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            title: { type: Type.STRING },
            movies: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  title: { type: Type.STRING },
                  description: { type: Type.STRING },
                  genre: { type: Type.STRING },
                  rating: { type: Type.NUMBER },
                  year: { type: Type.INTEGER },
                },
                required: ["id", "title", "description", "genre", "rating", "year"],
              },
            },
          },
          required: ["id", "title", "movies"],
        },
      },
    },
    required: ["highlight", "top10", "categories"],
  };

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: "Generate a fictional streaming service catalog. Include 1 'highlight' movie (blockbuster), a list of 'top10' trending movies, and 3 'categories' (e.g., Sci-Fi, Drama, Action) with 5-6 movies each. Make the titles creative and descriptions punchy.",
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
      },
    });

    const rawData = JSON.parse(response.text || "{}");
    
    // Process movies
    const highlight = enrichMovie({
        ...rawData.highlight,
        imageUrl: assignImages(rawData.highlight, 0, true),
        backdropUrl: assignImages(rawData.highlight, 99, true)
    });

    // Use landscape=true for lists now to match the new UI format
    const top10 = (rawData.top10 || []).map((m: any, i: number) => enrichMovie({
        ...m,
        imageUrl: assignImages(m, i, true) 
    }));

    const categories = (rawData.categories || []).map((c: any, ci: number) => ({
        ...c,
        movies: (c.movies || []).map((m: any, mi: number) => enrichMovie({
            ...m,
            imageUrl: assignImages(m, mi + ci * 10, true)
        }))
    }));

    // Build Master Library (Unique items)
    const allMovies = [highlight, ...top10];
    categories.forEach((c: any) => allMovies.push(...c.movies));
    
    // Deduplicate by ID
    const library = Array.from(new Map(allMovies.map(m => [m.id, m])).values());

    return {
        highlight,
        top10,
        categories,
        library,
        highlightTitle: "Hero Highlight",
        top10Title: "Top 10 / Trending",
        heroBadgeText: "NEW ARRIVAL",
        heroBadgeColor: "",
        marqueeColor: "",
        marqueeTextColor: "#000000",
        themeColor: "#CCFF00",
        // Default Pages Data
        aboutText: "James F. Coton is a visionary director known for his brutalist aesthetic and high-octane visual storytelling. With a background in graphic design and automotive photography, he brings a unique, textured style to every frame.",
        aboutImage: "https://picsum.photos/seed/james/800/800",
        contactText: "For commercial inquiries, music videos, and creative collaborations, please reach out directly or contact my representation.",
        emailPersonal: "contact@jamesfcoton.com",
        emailAgent: "agent@hollywood.com"
    };
  } catch (error) {
    console.error("Gemini API Error:", error);
    return mockCatalog;
  }
};

export const fetchMovieDetails = async (baseMovie: any): Promise<Movie> => {
    return enrichMovie(baseMovie);
}

const mockHighlight: Movie = {
    id: "h1",
    title: "CHRONO NEXUS",
    description: "In a fragmented timeline...",
    genre: "Sci-Fi / Thriller",
    rating: 9.8,
    year: 2025,
    imageUrl: "https://picsum.photos/seed/chrono/1920/1080",
    quality: "4K",
    matchPercentage: 99,
    crew: "Director: James F. Coton | DOP: L. Jenkins",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4", 
    heroUrl: "https://picsum.photos/seed/chrono/3840/2160",
    vimeoUrl: "https://vimeo.com/76979871",
    downloadUrl: "https://dropbox.com",
    gallery: [],
    tags: ["Time Travel", "Dystopian", "Sci-Fi", "Action"]
};

const mockTop10: Movie[] = [];
const mockCategories: Category[] = [];
const mockLibrary: Movie[] = [];

const mockCatalog: CatalogData = {
  highlight: mockHighlight,
  top10: mockTop10,
  categories: mockCategories,
  library: mockLibrary,
  highlightTitle: "Hero Highlight",
  top10Title: "Top 10 / Trending",
  heroBadgeText: "NEW ARRIVAL",
  heroBadgeColor: "",
  marqueeColor: "",
  marqueeTextColor: "#000000",
  themeColor: "#CCFF00",
  aboutText: "James F. Coton is a visionary director known for his brutalist aesthetic.",
  contactText: "For commercial inquiries...",
  emailPersonal: "contact@jamesfcoton.com",
  emailAgent: "agent@reps.com"
};
