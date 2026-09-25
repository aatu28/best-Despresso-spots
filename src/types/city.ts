export interface Cafe {
  name: string;
  description: string;
}

export interface CityStop {
  id: string;
  city: string;
  country: string;
  latitude: number;
  longitude: number;
  cafes: Cafe[];
}
