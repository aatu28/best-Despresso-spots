import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import type { GeocodedShop } from '../utils/geo';
import { createShopIcon } from './shopIcon';
import FitBounds from './FitBounds';

const DEFAULT_CENTER: [number, number] = [20, 10];
const DEFAULT_ZOOM = 2;

interface MapProps {
  shops: GeocodedShop[];
}

export default function Map({ shops }: MapProps) {
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
      <FitBounds shops={shops} />
      {shops.map((shop) => (
        <Marker
          key={shop.id}
          position={[shop.latitude, shop.longitude]}
          icon={createShopIcon(shop.vibe)}
        >
          <Popup>
            <div className="min-w-[180px] space-y-1">
              <p className="font-semibold text-stone-900">{shop.name}</p>
              <span className="inline-block rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-900">
                {shop.vibe}
              </span>
              <p className="text-xs text-stone-500">{shop.city}</p>
              {shop.notes && <p className="text-sm text-stone-700">{shop.notes}</p>}
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
