import { useMemo, useState } from 'react';
import rawCities from './data/espresso-data.json';
import type { CityStop } from './types/city';
import FilterBar from './components/FilterBar';
import Map from './components/Map';

const cities = rawCities as CityStop[];

function App() {
  const [selectedCountry, setSelectedCountry] = useState('all');

  const countries = useMemo(
    () => Array.from(new Set(cities.map((city) => city.country))).sort(),
    [],
  );

  const filteredCities = useMemo(
    () => cities.filter((city) => selectedCountry === 'all' || city.country === selectedCountry),
    [selectedCountry],
  );

  return (
    <div className="flex h-screen flex-col bg-stone-100">
      <FilterBar
        countries={countries}
        selectedCountry={selectedCountry}
        onCountryChange={setSelectedCountry}
        shownCount={filteredCities.length}
        totalCount={cities.length}
      />
      <div className="min-h-0 flex-1">
        <Map cities={filteredCities} />
      </div>
    </div>
  );
}

export default App;
