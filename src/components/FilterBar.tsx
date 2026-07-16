interface FilterBarProps {
  countries: string[];
  selectedCountry: string;
  onCountryChange: (country: string) => void;
  shownCount: number;
  totalCount: number;
}

export default function FilterBar({
  countries,
  selectedCountry,
  onCountryChange,
  shownCount,
  totalCount,
}: FilterBarProps) {
  return (
    <div className="flex flex-col gap-4 border-b border-stone-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-xl font-semibold text-stone-900">Espresso Spots</h1>
        <p className="text-sm text-stone-500">
          Showing {shownCount} of {totalCount} cities
        </p>
      </div>

      <label className="flex items-center gap-2 text-sm text-stone-700">
        Country
        <select
          value={selectedCountry}
          onChange={(e) => onCountryChange(e.target.value)}
          className="rounded-md border border-stone-300 bg-white px-2 py-1.5 text-sm focus:border-amber-700 focus:outline-none"
        >
          <option value="all">All countries</option>
          {countries.map((country) => (
            <option key={country} value={country}>
              {country}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
