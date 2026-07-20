import { useMemo, useState } from 'react';
import rawCities from './data/espresso-data.json';
import type { CityStop } from './types/city';
import Globe from './components/Globe';
import GlobeHeader from './components/GlobeHeader';
import CountryFilter from './components/CountryFilter';
import DetailPanel from './components/DetailPanel';

const cities = rawCities as CityStop[];
const totalCafes = cities.reduce((sum, c) => sum + c.cafes.length, 0);
const countries = Array.from(new Set(cities.map((c) => c.country))).sort();

function App() {
  const [selectedCountry, setSelectedCountry] = useState('all');
  const [selectedCityId, setSelectedCityId] = useState<string | null>(null);

  const visibleIds = useMemo(
    () =>
      new Set(
        cities
          .filter((c) => selectedCountry === 'all' || c.country === selectedCountry)
          .map((c) => c.id),
      ),
    [selectedCountry],
  );

  const selectedCity = selectedCityId && visibleIds.has(selectedCityId)
    ? (cities.find((c) => c.id === selectedCityId) ?? null)
    : null;

  return (
    <div className="relative h-screen w-full overflow-hidden bg-bg text-ink">
      <Globe
        cities={cities}
        visibleIds={visibleIds}
        selectedCityId={selectedCityId}
        onSelectCity={(city) => setSelectedCityId(city.id)}
      />

      <div
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          background:
            'radial-gradient(ellipse 150% 100% at 50% -10%, rgba(92,64,51,0.08) 0%, transparent 60%)',
        }}
      />

      <div className="absolute inset-x-0 top-0 z-10 flex flex-col gap-3 p-4 sm:block sm:p-0">
        <GlobeHeader totalCities={cities.length} totalCountries={countries.length} totalCafes={totalCafes} />

        <CountryFilter
          countries={countries}
          selectedCountry={selectedCountry}
          onCountryChange={(country) => {
            setSelectedCountry(country);
            setSelectedCityId(null);
          }}
          shownCount={visibleIds.size}
          totalCount={cities.length}
        />
      </div>

      <p className="pointer-events-none absolute bottom-8 left-8 z-10 text-[11px] tracking-[0.02em] text-ink-faint sm:bottom-12 sm:left-14">
        Drag to rotate &bull; Scroll to zoom &bull; Click a mark
      </p>

      <DetailPanel city={selectedCity} onClose={() => setSelectedCityId(null)} />
    </div>
  );
}

export default App;
