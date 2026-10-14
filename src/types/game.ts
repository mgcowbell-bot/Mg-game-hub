export type GameCategory =
  | 'Action'
  | 'RPG'
  | 'Racing'
  | 'Arcade'
  | 'Strategy'
  | 'Casual'
  | 'Sci-Fi'
  | 'Multiplayer';

export interface GameComment {
  id: string;
  author: string;
  text: string;
  date: string;
}

export interface Game {
  id: string;
  title: string;
  slug: string;
  tagline: string;
  description: string;
  category: GameCategory;
  developer: string;
  version: string;
  minAndroid: string;
  packageName: string;
  architecture: string;
  fileSize: string;
  fileSizeBytes: number;
  apkUrl: string;
  apkFileName: string;
  sha256: string;
  coverImage: string;
  logoUrl?: string;
  screenshots: string[];
  features: string[];
  downloadCount: number;
  rating: number;
  published: boolean;
  isFeatured: boolean;
  changelog: string;
  releaseDate: string;
  updatedAt: string;
  comments?: GameComment[];
}

export interface DownloadStat {
  id: string;
  gameId: string;
  gameTitle: string;
  version: string;
  timestamp: string;
  deviceType: string;
  ipHash?: string;
}

export interface HubStats {
  totalDownloads: number;
  totalGames: number;
  featuredCount: number;
  activeCategories: number;
  lastUpdated: string;
}

export interface ImageGenerationRequest {
  prompt: string;
  stylePreset?: string;
  aspectRatio: '1:1' | '16:9' | '9:16' | '4:3';
  imageSize: '1K' | '2K' | '4K';
}
