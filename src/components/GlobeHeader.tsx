interface GlobeHeaderProps {
  totalCities: number;
  totalCountries: number;
  totalCafes: number;
}

export default function GlobeHeader({ totalCities, totalCountries, totalCafes }: GlobeHeaderProps) {
  return (
    <div className="pointer-events-none max-w-full sm:absolute sm:top-14 sm:left-14 sm:max-w-[500px]">
      <div className="mb-1.5 text-[10px] font-semibold tracking-[0.14em] text-accent uppercase sm:mb-3 sm:text-[11px] sm:tracking-[0.16em]">
        Global Coverage
      </div>
      <h1 className="m-0 mb-1.5 font-serif text-[26px] leading-[1.05] font-medium tracking-[-0.01em] text-balance sm:mb-4 sm:text-[64px] sm:leading-[0.98]">
        D-espresso Spots
      </h1>
      <p className="m-0 max-w-[420px] text-[13px] leading-[1.45] text-ink-soft sm:text-[15px] sm:leading-[1.6]">
        {totalCities} coffee stops across {totalCountries} countries — {totalCafes} cafes and counting.
      </p>
    </div>
  );
}
