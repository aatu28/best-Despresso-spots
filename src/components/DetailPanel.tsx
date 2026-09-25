import { useState } from 'react';
import type { CityStop } from '../types/city';

interface DetailPanelProps {
  city: CityStop | null;
  onClose: () => void;
}

function formatCoord(lat: number, lon: number): string {
  const latDir = lat >= 0 ? 'N' : 'S';
  const lonDir = lon >= 0 ? 'E' : 'W';
  return `${Math.abs(lat).toFixed(2)}°${latDir}, ${Math.abs(lon).toFixed(2)}°${lonDir}`;
}

export default function DetailPanel({ city, onClose }: DetailPanelProps) {
  const open = city !== null;
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  function toggle(name: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  }

  return (
    <aside
      aria-live="polite"
      className={`detail-panel absolute inset-x-0 bottom-0 z-30 flex max-h-[70vh] flex-col gap-5 overflow-y-auto border-t border-panel-border bg-panel p-6 shadow-2xl sm:inset-x-auto sm:top-0 sm:right-0 sm:h-full sm:max-h-none sm:w-[min(400px,90vw)] sm:border-t-0 sm:border-l sm:p-10 sm:py-12 ${
        open ? 'translate-y-0 sm:translate-x-0' : 'translate-y-full sm:translate-x-full sm:translate-y-0'
      }`}
    >
      <button
        onClick={onClose}
        aria-label="Close"
        className="panel-close-btn flex h-9 w-9 flex-none items-center justify-center self-end rounded-sm text-lg text-ink"
      >
        &times;
      </button>

      {city && (
        <div className="flex flex-col gap-4">
          <div>
            <div className="mb-1.5 text-[10px] font-extrabold tracking-[0.12em] text-accent uppercase opacity-70">
              {city.country}
            </div>
            <h2 className="mb-2 text-[28px] leading-[1.1] font-extrabold text-balance">{city.city}</h2>
            <div className="text-[13px] text-ink-soft">
              {city.cafes.length} cafe{city.cafes.length === 1 ? '' : 's'} visited &mdash; tap one for details
            </div>
          </div>

          <ul className="flex flex-col gap-1 text-[14px] leading-[1.4]">
            {city.cafes.map((cafe) => {
              const isOpen = expanded.has(cafe.name);
              const hasDescription = cafe.description && cafe.description !== 'UNVERIFIED';
              return (
                <li key={cafe.name} className="border-b border-line last:border-b-0">
                  <button
                    onClick={() => toggle(cafe.name)}
                    aria-expanded={isOpen}
                    className="flex w-full items-center justify-between gap-3 py-2.5 text-left"
                  >
                    <span className="flex items-baseline gap-2">
                      <span className="text-accent opacity-60">&bull;</span>
                      <span className="text-ink-soft">{cafe.name}</span>
                    </span>
                    <span className="flex-none text-[12px] text-ink-faint">{isOpen ? '−' : '+'}</span>
                  </button>
                  {isOpen && (
                    <p className="mb-3 pl-4 text-[13px] leading-[1.55] text-ink-faint">
                      {hasDescription ? cafe.description : 'No verified details yet.'}
                    </p>
                  )}
                </li>
              );
            })}
          </ul>

          <div
            className="inline-flex w-fit items-center rounded-sm px-3 py-1.5 text-[10px] font-semibold tracking-[0.04em] text-accent uppercase"
            style={{ background: 'var(--color-tag-bg)' }}
          >
            Coverage: Active
          </div>

          <div className="my-1 h-px bg-line" />

          <div className="text-[10px] tracking-[0.06em] text-ink-faint uppercase tabular-nums">
            {formatCoord(city.latitude, city.longitude)}
          </div>
        </div>
      )}
    </aside>
  );
}
