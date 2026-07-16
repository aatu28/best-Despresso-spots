import { VIBE_TIERS, type Vibe } from '../types/shop';

interface FilterBarProps {
  cities: string[];
  selectedCity: string;
  onCityChange: (city: string) => void;
  minVibe: Vibe | 'any';
  onMinVibeChange: (vibe: Vibe | 'any') => void;
  shownCount: number;
  totalCount: number;
}

export default function FilterBar({
  cities,
  selectedCity,
  onCityChange,
  minVibe,
  onMinVibeChange,
  shownCount,
  totalCount,
}: FilterBarProps) {
  return (
    <div className="flex flex-col gap-4 border-b border-stone-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-xl font-semibold text-stone-900">Espresso Spots</h1>
        <p className="text-sm text-stone-500">
          Showing {shownCount} of {totalCount} shops
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <label className="flex items-center gap-2 text-sm text-stone-700">
          City
          <select
            value={selectedCity}
            onChange={(e) => onCityChange(e.target.value)}
            className="rounded-md border border-stone-300 bg-white px-2 py-1.5 text-sm focus:border-amber-700 focus:outline-none"
          >
            <option value="all">All cities</option>
            {cities.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
        </label>

        <label className="flex items-center gap-2 text-sm text-stone-700">
          Vibe
          <select
            value={minVibe}
            onChange={(e) => onMinVibeChange(e.target.value as Vibe | 'any')}
            className="rounded-md border border-stone-300 bg-white px-2 py-1.5 text-sm focus:border-amber-700 focus:outline-none"
          >
            <option value="any">Any vibe</option>
            {VIBE_TIERS.map((vibe) => (
              <option key={vibe} value={vibe}>
                {vibe} or better
              </option>
            ))}
          </select>
        </label>
      </div>
    </div>
  );
}
