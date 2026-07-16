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
          icon={createShopIcon(shop.rating)}
        >
          <Popup>
            <div className="min-w-[180px] space-y-1">
              <p className="font-semibold text-stone-900">{shop.name}</p>
              <p className="text-sm text-amber-800">
                {'★'.repeat(Math.round(shop.rating))}
                {'☆'.repeat(5 - Math.round(shop.rating))}
                <span className="ml-1 text-stone-500">{shop.rating.toFixed(1)}</span>
              </p>
              <p className="text-xs text-stone-500">{shop.city}</p>
              {shop.notes && <p className="text-sm text-stone-700">{shop.notes}</p>}
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
