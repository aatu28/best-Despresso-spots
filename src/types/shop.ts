export interface EspressoShop {
  id: string;
  name: string;
  city: string;
  /** null when the source data had no verified coordinates */
  latitude: number | null;
  longitude: number | null;
  /** personal rating, 1-5 */
  rating: number;
  notes: string;
}
