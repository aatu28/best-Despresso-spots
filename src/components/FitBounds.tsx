import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import type { CityStop } from '../types/city';

interface FitBoundsProps {
  cities: CityStop[];
}

export default function FitBounds({ cities }: FitBoundsProps) {
  const map = useMap();

  useEffect(() => {
    if (cities.length === 0) return;

    if (cities.length === 1) {
      map.setView([cities[0].latitude, cities[0].longitude], 10);
      return;
    }

    const bounds = L.latLngBounds(cities.map((city) => [city.latitude, city.longitude]));
    map.fitBounds(bounds, { padding: [48, 48] });
  }, [map, cities]);

  return null;
}
