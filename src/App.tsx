import { useMemo, useState } from 'react';
import rawShops from './data/espresso-data.json';
import type { EspressoShop, Vibe } from './types/shop';
import { VIBE_TIERS } from './types/shop';
import { splitByCoordinates } from './utils/geo';
import FilterBar from './components/FilterBar';
import UnmappedList from './components/UnmappedList';
import Map from './components/Map';

const shops = rawShops as EspressoShop[];

function App() {
  const [selectedCity, setSelectedCity] = useState('all');
  const [minVibe, setMinVibe] = useState<Vibe | 'any'>('any');

  const cities = useMemo(
    () => Array.from(new Set(shops.map((shop) => shop.city))).sort(),
    [],
  );

  const filteredShops = useMemo(() => {
    const minVibeIndex = minVibe === 'any' ? VIBE_TIERS.length - 1 : VIBE_TIERS.indexOf(minVibe);

    return shops.filter(
      (shop) =>
        (selectedCity === 'all' || shop.city === selectedCity) &&
        VIBE_TIERS.indexOf(shop.vibe) <= minVibeIndex,
    );
  }, [selectedCity, minVibe]);

  const { mapped, unmapped } = useMemo(() => splitByCoordinates(filteredShops), [filteredShops]);

  return (
    <div className="flex h-screen flex-col bg-stone-100">
      <FilterBar
        cities={cities}
        selectedCity={selectedCity}
        onCityChange={setSelectedCity}
        minVibe={minVibe}
        onMinVibeChange={setMinVibe}
        shownCount={mapped.length}
        totalCount={filteredShops.length}
      />
      <div className="min-h-0 flex-1">
        <Map shops={mapped} />
      </div>
      <UnmappedList shops={unmapped} />
    </div>
  );
}

export default App;
