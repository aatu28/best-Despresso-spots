import type { CityStop } from '../types/city';

interface StampCardProps {
  city: CityStop | null;
  index: number;
  total: number;
  onClose: () => void;
}

function formatCoord(lat: number, lon: number): string {
  const latDir = lat >= 0 ? 'N' : 'S';
  const lonDir = lon >= 0 ? 'E' : 'W';
  return `${Math.abs(lat).toFixed(2)}°${latDir} ${Math.abs(lon).toFixed(2)}°${lonDir}`;
}

export default function StampCard({ city, index, total, onClose }: StampCardProps) {
  const open = city !== null;

  return (
    <aside
      aria-live="polite"
      className={`stamp-card absolute inset-x-0 bottom-0 z-30 max-h-[62vh] overflow-y-auto rounded-t-xl border border-line bg-paper-card p-5 shadow-2xl sm:inset-x-auto sm:top-4 sm:right-4 sm:bottom-auto sm:max-h-[calc(100%-2rem)] sm:w-80 sm:rounded ${
        open ? 'translate-y-0 opacity-100 sm:translate-x-0' : 'translate-y-full opacity-0 sm:translate-x-[calc(100%+2rem)] sm:translate-y-0'
      }`}
    >
      {city && (
        <>
          <button
            onClick={onClose}
            aria-label="Close"
            className="absolute top-2.5 right-2.5 p-1 font-mono text-ink-soft hover:text-ink"
          >
            ✕
          </button>
          <p className="mb-1 font-mono text-[0.65rem] tracking-widest text-accent-2 uppercase">
            Stop {String(index + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
          </p>
          <h2 className="pr-6 font-mono text-lg font-bold text-balance">{city.city}</h2>
          <p className="mb-3.5 text-sm text-ink-soft italic">{city.country}</p>
          <hr className="mb-3.5 border-t border-dashed border-line" />
          <ul className="flex flex-col gap-2.5">
            {city.cafes.map((cafe, i) => (
              <li key={cafe} className="flex items-baseline gap-2.5 text-[0.94rem] leading-snug">
                <span className="pt-0.5 font-mono text-[0.68rem] text-accent">{String(i + 1).padStart(2, '0')}</span>
                <span>{cafe}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex justify-between border-t border-dashed border-line pt-3 font-mono text-[0.65rem] tracking-wider text-ink-soft uppercase tabular-nums">
            <span>
              {city.cafes.length} cafe{city.cafes.length === 1 ? '' : 's'}
            </span>
            <span>{formatCoord(city.latitude, city.longitude)}</span>
          </div>
        </>
      )}
    </aside>
  );
}
