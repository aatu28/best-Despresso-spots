export interface Cafe {
  name: string;
  description: string;
  /** Personal 1-5 rating, hand-filled per cafe. Omitted means not yet rated. */
  rating?: number;
}

export interface CityStop {
  id: string;
  city: string;
  country: string;
  latitude: number;
  longitude: number;
  cafes: Cafe[];
}
