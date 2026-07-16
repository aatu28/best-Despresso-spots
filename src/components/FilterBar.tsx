interface FilterBarProps {
  countries: string[];
  selectedCountry: string;
  onCountryChange: (country: string) => void;
  totalCities: number;
  totalCafes: number;
}

export default function FilterBar({
  countries,
  selectedCountry,
  onCountryChange,
  totalCities,
  totalCafes,
}: FilterBarProps) {
  return (
    <header className="z-20 flex flex-wrap items-center justify-between gap-3 border-b border-dashed border-line bg-paper-raised px-5 py-3.5">
      <div>
        <div className="flex items-baseline gap-2.5">
          <span
            aria-hidden="true"
            className="flex h-8.5 w-8.5 flex-none -rotate-6 items-center justify-center rounded-full border-[1.5px] border-accent text-lg text-accent"
          >
            ☕
          </span>
          <h1 className="font-mono text-lg font-bold tracking-wide text-balance uppercase">
            Espresso Passport
          </h1>
        </div>
        <p className="mt-0.5 ml-11 font-mono text-xs tracking-wide text-ink-soft uppercase tabular-nums">
          {totalCities} cities logged — {totalCafes} cafes
        </p>
      </div>

      <label className="flex items-center gap-2 font-mono text-xs tracking-wider text-ink-soft uppercase">
        Country
        <select
          value={selectedCountry}
          onChange={(e) => onCountryChange(e.target.value)}
          className="ticket-select cursor-pointer rounded-sm border border-line bg-paper-card py-1.5 pr-7 pl-2.5 font-mono text-sm text-ink normal-case focus-visible:outline-2 focus-visible:outline-accent-2"
        >
          <option value="all">All countries</option>
          {countries.map((country) => (
            <option key={country} value={country}>
              {country}
            </option>
          ))}
        </select>
      </label>
    </header>
  );
}
