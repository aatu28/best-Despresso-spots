interface GlobeHeaderProps {
  totalCities: number;
  totalCountries: number;
  totalCafes: number;
}

export default function GlobeHeader({ totalCities, totalCountries, totalCafes }: GlobeHeaderProps) {
  return (
    <div className="pointer-events-none max-w-full sm:absolute sm:top-14 sm:left-14 sm:max-w-[500px]">
      <div className="mb-3 text-[11px] font-semibold tracking-[0.16em] text-accent uppercase">
        Global Coverage
      </div>
      <h1 className="m-0 mb-4 font-serif text-[44px] leading-[0.98] font-medium tracking-[-0.01em] text-balance sm:text-[64px]">
        D-espresso Spots
      </h1>
      <p className="m-0 max-w-[420px] text-[15px] leading-[1.6] text-ink-soft">
        {totalCities} coffee stops across {totalCountries} countries — {totalCafes} cafes and counting.
      </p>
    </div>
  );
}
