import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import type { CityStop } from '../types/city';
import { cityIcon } from './cityIcon';
import FitBounds from './FitBounds';

const DEFAULT_CENTER: [number, number] = [20, 10];
const DEFAULT_ZOOM = 2;

interface MapProps {
  cities: CityStop[];
}

export default function Map({ cities }: MapProps) {
  return (
    <MapContainer
      center={DEFAULT_CENTER}
      zoom={DEFAULT_ZOOM}
      scrollWheelZoom
      className="h-full w-full"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <FitBounds cities={cities} />
      {cities.map((city) => (
        <Marker key={city.id} position={[city.latitude, city.longitude]} icon={cityIcon}>
          <Popup>
            <div className="min-w-[180px] space-y-1">
              <p className="font-semibold text-stone-900">{city.city}</p>
              <p className="text-xs text-stone-500">{city.country}</p>
              <ul className="mt-1 list-inside list-disc text-sm text-stone-700">
                {city.cafes.map((cafe) => (
                  <li key={cafe}>{cafe}</li>
                ))}
              </ul>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
