export interface VideoConfig {
  id: string;
  url: string;
  keywords: string[];
}

export interface CharacterConfig {
  id: string;
  name: string;
  imageUrl: string;
  defaultVideoUrl: string;
  teaserVideoUrls: string[];
  videos: VideoConfig[];
}

export interface AppConfig {
  characters: CharacterConfig[];
}
