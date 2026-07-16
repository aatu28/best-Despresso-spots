import type { EspressoShop } from '../types/shop';

export interface GeocodedShop extends EspressoShop {
  latitude: number;
  longitude: number;
}

/**
 * Placeholder for a real geocoding lookup (e.g. Nominatim/Google Geocoding API).
 * Wire this up to an API call if you want to auto-fill missing coordinates
 * from the shop's name/city instead of entering them by hand.
 */
export async function geocodeShop(shop: EspressoShop): Promise<{ latitude: number; longitude: number } | null> {
  console.warn(
    `[geocodeShop] No geocoding provider configured — could not resolve coordinates for "${shop.name}" (${shop.city}).`,
  );
  return null;
}

export function isGeocoded(shop: EspressoShop): shop is GeocodedShop {
  return (
    typeof shop.latitude === 'number' &&
    typeof shop.longitude === 'number' &&
    Number.isFinite(shop.latitude) &&
    Number.isFinite(shop.longitude)
  );
}

export function splitByCoordinates(shops: EspressoShop[]): {
  mapped: GeocodedShop[];
  unmapped: EspressoShop[];
} {
  const mapped: GeocodedShop[] = [];
  const unmapped: EspressoShop[] = [];

  for (const shop of shops) {
    if (isGeocoded(shop)) {
      mapped.push(shop);
    } else {
      unmapped.push(shop);
      console.warn(
        `[espresso-data] "${shop.name}" (${shop.city}) is missing latitude/longitude and will not be shown on the map.`,
      );
    }
  }

  return { mapped, unmapped };
}
