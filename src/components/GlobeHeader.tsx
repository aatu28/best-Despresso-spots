interface GlobeHeaderProps {
  totalCities: number;
  totalCountries: number;
  totalCafes: number;
}

export default function GlobeHeader({ totalCities, totalCountries, totalCafes }: GlobeHeaderProps) {
  return (
    <div className="pointer-events-none max-w-full sm:absolute sm:top-14 sm:left-14 sm:max-w-[500px]">
      <div className="mb-3 text-[10px] font-extrabold tracking-[0.12em] text-accent uppercase opacity-70">
        Global Coverage
      </div>
      <h1 className="m-0 mb-4 text-[36px] leading-[1] font-extrabold tracking-[-0.02em] text-balance sm:text-[52px]">
        Despresso Spots
      </h1>
      <p className="m-0 max-w-[400px] text-[15px] leading-[1.6] text-ink-soft">
        {totalCities} coffee stops across {totalCountries} countries — {totalCafes} cafes and counting.
      </p>
    </div>
  );
}
