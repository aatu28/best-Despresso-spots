import { useEffect, useRef, useState } from 'react';
import type { CityStop } from '../types/city';

interface CityFinderProps {
  cities: CityStop[];
  onSelectCity: (city: CityStop) => void;
}

export default function CityFinder({ cities, onSelectCity }: CityFinderProps) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const q = query.trim().toLowerCase();
  const matches = q
    ? cities
        .filter(
          (c) =>
            c.city.toLowerCase().includes(q) ||
            c.country.toLowerCase().includes(q) ||
            c.cafes.some((cafe) => cafe.name.toLowerCase().includes(q)),
        )
        .sort((a, b) => a.city.localeCompare(b.city))
    : [...cities].sort((a, b) => a.country.localeCompare(b.country) || a.city.localeCompare(b.city));

  useEffect(() => {
    setActiveIndex(0);
  }, [query, open]);

  useEffect(() => {
    function onDocPointerDown(evt: PointerEvent) {
      if (rootRef.current && !rootRef.current.contains(evt.target as Node)) setOpen(false);
    }
    document.addEventListener('pointerdown', onDocPointerDown);
    return () => document.removeEventListener('pointerdown', onDocPointerDown);
  }, []);

  function select(city: CityStop) {
    onSelectCity(city);
    setQuery('');
    setOpen(false);
    inputRef.current?.blur();
  }

  function onKeyDown(evt: React.KeyboardEvent<HTMLInputElement>) {
    if (evt.key === 'ArrowDown') {
      evt.preventDefault();
      setOpen(true);
      setActiveIndex((i) => Math.min(i + 1, matches.length - 1));
    } else if (evt.key === 'ArrowUp') {
      evt.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (evt.key === 'Enter') {
      evt.preventDefault();
      const city = matches[activeIndex];
      if (city) select(city);
    } else if (evt.key === 'Escape') {
      setOpen(false);
      inputRef.current?.blur();
    }
  }

  let lastCountry: string | null = null;

  return (
    <div ref={rootRef} className="relative w-[220px] sm:w-[260px]">
      <div className="relative flex items-center">
        <svg
          aria-hidden
          width="14"
          height="14"
          viewBox="0 0 14 14"
          fill="none"
          className="pointer-events-none absolute left-3.5 text-ink-faint"
        >
          <circle cx="6" cy="6" r="4.75" stroke="currentColor" strokeWidth="1.3" />
          <path d="M9.5 9.5L13 13" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
        </svg>
        <input
          ref={inputRef}
          type="text"
          role="combobox"
          aria-expanded={open}
          aria-controls="city-finder-listbox"
          aria-autocomplete="list"
          placeholder="Find a city or cafe…"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          className="w-full rounded-full border border-panel-border bg-panel py-2 pr-8 pl-9 text-[14px] text-ink placeholder:text-ink-faint focus-visible:outline-2 focus-visible:outline-accent"
        />
        {query && (
          <button
            type="button"
            aria-label="Clear search"
            onClick={() => {
              setQuery('');
              inputRef.current?.focus();
            }}
            className="absolute right-3 text-[13px] text-ink-faint hover:text-ink"
          >
            &times;
          </button>
        )}
      </div>

      {open && (
        <ul
          id="city-finder-listbox"
          role="listbox"
          className="absolute top-[calc(100%+8px)] right-0 z-20 max-h-80 w-full overflow-y-auto rounded-xl border border-panel-border bg-panel py-1.5 shadow-lg"
        >
          {matches.length === 0 && (
            <li className="px-4 py-3 text-[13px] text-ink-faint">No cities or cafes match "{query}".</li>
          )}
          {matches.map((city, i) => {
            const showHeader = !q && city.country !== lastCountry;
            lastCountry = city.country;
            return (
              <li key={city.id} role="presentation">
                {showHeader && (
                  <div
                    aria-hidden
                    className="px-4 pt-2.5 pb-1 text-[10px] font-semibold tracking-[0.12em] text-accent uppercase"
                  >
                    {city.country}
                  </div>
                )}
                <button
                  type="button"
                  role="option"
                  aria-selected={i === activeIndex}
                  onMouseEnter={() => setActiveIndex(i)}
                  onClick={() => select(city)}
                  className={`flex w-full items-center justify-between gap-3 px-4 py-2 text-left text-[14px] ${
                    i === activeIndex ? 'bg-tag-bg text-ink' : 'text-ink-soft'
                  }`}
                >
                  <span>
                    {city.city}
                    {q && <span className="text-ink-faint"> &middot; {city.country}</span>}
                  </span>
                  <span className="flex-none text-[11px] text-ink-faint tabular-nums">{city.cafes.length}</span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
