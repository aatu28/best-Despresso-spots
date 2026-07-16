export const VIBE_TIERS = ['Favorite', 'Great', 'Good', 'Decent'] as const;
export type Vibe = (typeof VIBE_TIERS)[number];

export interface EspressoShop {
  id: string;
  name: string;
  city: string;
  /** null when the source data had no verified coordinates */
  latitude: number | null;
  longitude: number | null;
  vibe: Vibe;
  notes: string;
}
