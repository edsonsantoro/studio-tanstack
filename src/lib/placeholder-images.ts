import data from './placeholder-images.json';

export type ImagePlaceholder = {
  id: string;
  description: string;
  imageUrl: string;
  imageHint: string;
  gender?: string; // Optional for backward compatibility
};

export const PlaceHolderImages: ImagePlaceholder[] = data.placeholderImages;
