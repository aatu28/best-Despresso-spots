import { Suspense, lazy, useEffect, useMemo, useState } from 'react';
import rawCities from './data/espresso-data.json';
import type { CityStop } from './types/city';
import GlobeHeader from './components/GlobeHeader';
import CountryFilter from './components/CountryFilter';
import CityFinder from './components/CityFinder';
import DetailPanel from './components/DetailPanel';

const Globe = lazy(() => import('./components/Globe'));

const cities = rawCities as CityStop[];
const totalCafes = cities.reduce((sum, c) => sum + c.cafes.length, 0);
const countries = Array.from(new Set(cities.map((c) => c.country))).sort();

function cityIdFromUrl(): string | null {
  const id = new URLSearchParams(window.location.search).get('city');
  return id && cities.some((c) => c.id === id) ? id : null;
}

function App() {
  const [selectedCountry, setSelectedCountry] = useState('all');
  const [selectedCityId, setSelectedCityId] = useState<string | null>(cityIdFromUrl);

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

  // Keep the URL in sync so a city can be linked/bookmarked directly.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (selectedCityId) params.set('city', selectedCityId);
    else params.delete('city');
    const qs = params.toString();
    window.history.replaceState(null, '', `${window.location.pathname}${qs ? `?${qs}` : ''}`);
  }, [selectedCityId]);

  function selectCity(city: CityStop) {
    if (selectedCountry !== 'all' && selectedCountry !== city.country) setSelectedCountry('all');
    setSelectedCityId(city.id);
  }

  return (
    <div className="relative h-dvh w-full overflow-hidden bg-bg text-ink">
      <Suspense
        fallback={
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="h-[70vmin] w-[70vmin] rounded-full border border-panel-border opacity-40" />
          </div>
        }
      >
        <Globe cities={cities} visibleIds={visibleIds} selectedCityId={selectedCityId} onSelectCity={selectCity} />
      </Suspense>

      <div className="paper-grain pointer-events-none absolute inset-0 z-0" />

      <div
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          background:
            'radial-gradient(ellipse 80% 60% at 10% 100%, rgba(107,74,43,0.1) 0%, transparent 55%), radial-gradient(ellipse 70% 50% at 100% 0%, rgba(107,74,43,0.08) 0%, transparent 55%)',
        }}
      />

      <div className="airmail-stripe pointer-events-none absolute inset-x-0 top-0 z-10" />
      <div className="airmail-stripe pointer-events-none absolute inset-x-0 bottom-0 z-10" />

      <div className="absolute inset-x-0 top-0 z-10 flex flex-col gap-2 p-4 sm:block sm:p-0">
        <GlobeHeader totalCities={cities.length} totalCountries={countries.length} totalCafes={totalCafes} />

        <div className="flex flex-col items-end gap-2 sm:absolute sm:top-14 sm:right-14 sm:gap-3">
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
          <CityFinder cities={cities} onSelectCity={selectCity} />
        </div>
      </div>

      <p className="pointer-events-none absolute bottom-8 left-8 z-10 text-[11px] tracking-[0.02em] text-ink-faint sm:bottom-12 sm:left-14">
        Drag to rotate &bull; Scroll to zoom &bull; Click a mark
      </p>

      <div
        aria-hidden
        className="stamp-badge-dashed pointer-events-none absolute right-14 bottom-12 z-10 hidden h-[148px] w-[112px] flex-none flex-col items-center justify-center gap-2 rounded-sm bg-panel sm:flex"
        style={{ transform: 'rotate(-3deg)' }}
      >
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="9" className="stroke-brass" strokeWidth="1.4" />
          <path d="M12 7v5l3 2" className="stroke-brass" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
        <span className="text-[9.5px] font-semibold tracking-[0.1em] text-brass uppercase">Air Mail</span>
        <span className="font-serif text-[21px] font-semibold text-ink">{totalCafes}</span>
        <span className="text-[8.5px] font-semibold tracking-[0.08em] text-brass uppercase">cafes</span>
      </div>

      <DetailPanel key={selectedCity?.id ?? 'none'} city={selectedCity} onClose={() => setSelectedCityId(null)} />
    </div>
  );
}

export default App;
