export enum Tone {
  PROFESSIONAL = 'Professional',
  WITTY = 'Witty',
  URGENT = 'Urgent',
}

export enum AspectRatio {
  SQUARE = '1:1',
  PORTRAIT_2_3 = '2:3',
  LANDSCAPE_3_2 = '3:2',
  PORTRAIT_3_4 = '3:4',
  LANDSCAPE_4_3 = '4:3',
  PORTRAIT_9_16 = '9:16',
  LANDSCAPE_16_9 = '16:9',
  CINEMATIC_21_9 = '21:9',
}

export enum ImageSize {
  SIZE_1K = '1K',
  SIZE_2K = '2K',
  SIZE_4K = '4K',
}

export interface GeneratedPost {
  platform: string;
  content: string;
  imagePrompt: string;
  hashtags?: string[];
  suggestedAspectRatio: AspectRatio;
}

export interface SocialContentResult {
  linkedin: GeneratedPost;
  twitter: GeneratedPost;
  instagram: GeneratedPost;
}

export interface ImageGenerationResult {
  platform: string;
  imageUrl: string;
  loading: boolean;
  error?: string;
}

export interface AppState {
  idea: string;
  tone: Tone;
  imageSize: ImageSize;
  results: SocialContentResult | null;
  generatedImages: Record<string, ImageGenerationResult>;
  isGeneratingText: boolean;
  isGeneratingImages: boolean;
  error: string | null;
}
