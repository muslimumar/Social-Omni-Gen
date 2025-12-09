import { AspectRatio, Tone, ImageSize } from './types';

export const DEFAULT_TONE = Tone.PROFESSIONAL;
export const DEFAULT_IMAGE_SIZE = ImageSize.SIZE_1K;

export const PLATFORM_CONFIG = {
  linkedin: {
    name: 'LinkedIn',
    color: 'bg-blue-700',
    textColor: 'text-blue-700',
    icon: 'briefcase', // simple representation
    defaultAspectRatio: AspectRatio.LANDSCAPE_16_9,
  },
  twitter: {
    name: 'X (Twitter)',
    color: 'bg-black',
    textColor: 'text-black',
    icon: 'twitter',
    defaultAspectRatio: AspectRatio.LANDSCAPE_16_9,
  },
  instagram: {
    name: 'Instagram',
    color: 'bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500',
    textColor: 'text-pink-600',
    icon: 'camera',
    defaultAspectRatio: AspectRatio.PORTRAIT_3_4,
  },
};

export const ASPECT_RATIOS = Object.values(AspectRatio);
export const IMAGE_SIZES = Object.values(ImageSize);
export const TONES = Object.values(Tone);
