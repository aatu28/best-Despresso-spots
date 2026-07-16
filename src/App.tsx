import { useMemo, useState } from 'react';
import rawCities from './data/espresso-data.json';
import type { CityStop } from './types/city';
import FilterBar from './components/FilterBar';
import WorldMap from './components/WorldMap';
import StampCard from './components/StampCard';

const cities = rawCities as CityStop[];
const totalCafes = cities.reduce((sum, c) => sum + c.cafes.length, 0);

function App() {
  const [selectedCountry, setSelectedCountry] = useState('all');
  const [selectedCityId, setSelectedCityId] = useState<string | null>(null);

  const countries = useMemo(
    () => Array.from(new Set(cities.map((city) => city.country))).sort(),
    [],
  );

  const filteredCities = useMemo(
    () => cities.filter((city) => selectedCountry === 'all' || city.country === selectedCountry),
    [selectedCountry],
  );

  const selectedCity = filteredCities.find((city) => city.id === selectedCityId) ?? null;
  const selectedIndex = selectedCity ? cities.indexOf(selectedCity) : -1;

  return (
    <div className="relative flex h-screen flex-col overflow-hidden bg-paper text-ink">
      <FilterBar
        countries={countries}
        selectedCountry={selectedCountry}
        onCountryChange={(country) => {
          setSelectedCountry(country);
          setSelectedCityId(null);
        }}
        totalCities={cities.length}
        totalCafes={totalCafes}
      />
      <main className="relative min-h-0 flex-1 bg-ocean">
        <WorldMap
          cities={filteredCities}
          selectedCityId={selectedCityId}
          onSelectCity={(city) => setSelectedCityId(city.id)}
        />
        {!selectedCity && (
          <p className="absolute bottom-4 left-1/2 max-w-[calc(100%-2rem)] -translate-x-1/2 rounded-full border border-line bg-paper-raised px-3.5 py-1.5 text-center font-mono text-xs tracking-wide text-ink-soft">
            Click a stamp to see the cafes
          </p>
        )}
        <StampCard
          city={selectedCity}
          index={selectedIndex}
          total={cities.length}
          onClose={() => setSelectedCityId(null)}
        />
      </main>
    </div>
  );
}

export default App;
