interface CountryFilterProps {
  countries: string[];
  selectedCountry: string;
  onCountryChange: (country: string) => void;
  shownCount: number;
  totalCount: number;
}

export default function CountryFilter({
  countries,
  selectedCountry,
  onCountryChange,
  shownCount,
  totalCount,
}: CountryFilterProps) {
  return (
    <div className="flex flex-col items-end gap-1.5 self-end sm:self-auto">
      <label className="flex items-center gap-2 text-[11px] font-semibold tracking-[0.14em] text-ink-faint uppercase">
        Country
        <select
          value={selectedCountry}
          onChange={(e) => onCountryChange(e.target.value)}
          className="country-select cursor-pointer rounded-full border border-panel-border bg-panel py-2 pr-9 pl-4 text-[14px] font-medium tracking-normal text-ink normal-case focus-visible:outline-2 focus-visible:outline-accent"
        >
          <option value="all">All countries</option>
          {countries.map((country) => (
            <option key={country} value={country}>
              {country}
            </option>
          ))}
        </select>
      </label>
      <span className="text-[10px] tracking-[0.04em] text-ink-faint uppercase tabular-nums">
        {shownCount} of {totalCount} shown
      </span>
    </div>
  );
}
