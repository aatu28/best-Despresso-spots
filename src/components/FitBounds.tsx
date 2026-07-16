import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import type { GeocodedShop } from '../utils/geo';

interface FitBoundsProps {
  shops: GeocodedShop[];
}

export default function FitBounds({ shops }: FitBoundsProps) {
  const map = useMap();

  useEffect(() => {
    if (shops.length === 0) return;

    if (shops.length === 1) {
      map.setView([shops[0].latitude, shops[0].longitude], 13);
      return;
    }

    const bounds = L.latLngBounds(shops.map((shop) => [shop.latitude, shop.longitude]));
    map.fitBounds(bounds, { padding: [48, 48] });
  }, [map, shops]);

  return null;
}
